import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${Math.abs(amount).toLocaleString()}`;
};

export default function ForecastTimeline({ forecast }) {
  const maxBalance = Math.max(...forecast.map(f => Math.abs(f.balance)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar size={20} className="text-blue-400" />
          14-Day Forecast
        </h2>
        <p className="text-xs text-slate-500">Based on recent averages</p>
      </div>

      <div className="space-y-2">
        {forecast.map((day, idx) => {
          const isToday = idx === 0;
          const hasPayments = day.payments.length > 0;
          const isNegative = day.balance < 0;
          const isCritical = day.balance < 5000;
          const barWidth = Math.abs(day.balance) / maxBalance * 100;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-300 ${
                isToday 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : isCritical
                    ? 'bg-rose-500/5 border-rose-500/20'
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
              }`}
            >
              {/* Balance bar background */}
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                  isNegative 
                    ? 'bg-rose-500/10' 
                    : isCritical 
                      ? 'bg-amber-500/10' 
                      : 'bg-emerald-500/5'
                }`}
                style={{ width: `${barWidth}%` }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[44px]">
                    <p className={`text-xs font-medium ${day.isWeekend ? 'text-blue-400' : 'text-slate-500'}`}>
                      {day.dayName}
                    </p>
                    <p className="text-lg font-bold text-white">{day.day}</p>
                    <p className="text-xs text-slate-600">{day.month}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs">
                        <TrendingUp size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-medium">
                          +{formatCurrency(day.cashIn)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <TrendingDown size={12} className="text-rose-400" />
                        <span className="text-rose-400 font-medium">
                          -{formatCurrency(day.cashOut)}
                        </span>
                      </span>
                    </div>
                    
                    {hasPayments && (
                      <div className="flex flex-wrap gap-1">
                        {day.payments.map((p, i) => (
                          <span 
                            key={i}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              p.type === 'payroll' 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : p.type === 'rent'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : p.type === 'bas'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-slate-600/20 text-slate-400'
                            }`}
                          >
                            {p.desc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    isNegative 
                      ? 'text-rose-400' 
                      : isCritical 
                        ? 'text-amber-400' 
                        : 'text-white'
                  }`}>
                    {formatCurrency(day.balance)}
                  </p>
                  {isCritical && !isNegative && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 justify-end">
                      <AlertCircle size={10} />
                      Low
                    </span>
                  )}
                  {isNegative && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1 justify-end">
                      <AlertCircle size={10} />
                      Negative
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}