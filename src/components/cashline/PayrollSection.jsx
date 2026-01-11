import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString()}`;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PayrollSection({ businessData }) {
  const recentWeeklySales = businessData.avgDailySales * 7;
  const payrollPercent = Math.round((businessData.weeklyPayroll / recentWeeklySales) * 100);
  const isHealthy = payrollPercent <= 35;
  const isWarning = payrollPercent > 35 && payrollPercent <= 45;

  const getNextPayrollDate = () => {
    const today = new Date();
    const daysUntilPayroll = (businessData.payrollDay - today.getDay() + 7) % 7 || 7;
    const nextPayroll = new Date(today);
    nextPayroll.setDate(today.getDate() + daysUntilPayroll);
    return nextPayroll;
  };

  const nextPayroll = getNextPayrollDate();
  const daysUntil = Math.ceil((nextPayroll - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users size={20} className="text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Payroll Analysis</h2>
      </div>

      {/* Next Payroll Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-500/20"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next Payroll</p>
            <p className="text-2xl font-bold text-white">
              {nextPayroll.toLocaleDateString('en-AU', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {daysUntil} {daysUntil === 1 ? 'day' : 'days'} away
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-400">
              {formatCurrency(businessData.weeklyPayroll)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {DAYS.map((day, idx) => (
            <div 
              key={day}
              className={`flex-1 py-2 rounded-lg text-center text-xs font-medium transition-all ${
                idx === businessData.payrollDay
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-slate-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Labor Cost Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 border ${
          isHealthy 
            ? 'bg-emerald-500/5 border-emerald-500/20' 
            : isWarning
              ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-rose-500/5 border-rose-500/20'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Labor Cost Ratio</p>
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle size={18} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={18} className={isWarning ? 'text-amber-400' : 'text-rose-400'} />
              )}
              <p className={`text-2xl font-bold ${
                isHealthy ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {payrollPercent}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">of weekly revenue</p>
            <p className="text-sm text-slate-400">{formatCurrency(recentWeeklySales)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(payrollPercent, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute h-full rounded-full ${
              isHealthy 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                : isWarning
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
          />
          {/* Benchmark markers */}
          <div className="absolute top-0 left-[35%] h-full w-0.5 bg-slate-600" />
          <div className="absolute top-0 left-[45%] h-full w-0.5 bg-slate-600" />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>0%</span>
          <span>35% (Target)</span>
          <span>45% (Max)</span>
        </div>

        <p className="text-sm text-slate-400 mt-4">
          {isHealthy 
            ? '✓ Labor costs are within healthy range for hospitality.'
            : isWarning
              ? '⚠ Labor costs are slightly high. Consider optimizing schedules.'
              : '⚠ Labor costs exceed industry benchmarks. Review staffing levels.'}
        </p>
      </motion.div>

      {/* Weekly Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Monthly Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Monthly Payroll</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(businessData.weeklyPayroll * 4.33)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Per Week Average</p>
            <p className="text-xl font-bold text-purple-400">
              {formatCurrency(businessData.weeklyPayroll)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}