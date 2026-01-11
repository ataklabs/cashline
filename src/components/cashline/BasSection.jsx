import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, TrendingDown, CheckCircle, DollarSign } from 'lucide-react';

const formatCurrency = (amount) => {
  if (Math.abs(amount) >= 1000) {
    return `$${(Math.abs(amount) / 1000).toFixed(1)}k`;
  }
  return `$${Math.abs(amount).toLocaleString()}`;
};

export default function BasSection({ businessData, forecast }) {
  const basDate = businessData.basDate;
  const basAmount = businessData.basAmount;
  const daysToBasDate = forecast.findIndex(f => f.date === basDate);
  const cashAtBasDate = forecast.find(f => f.date === basDate)?.balance || 0;
  const projectedAfterBas = cashAtBasDate - basAmount;
  const basShortfall = Math.max(0, basAmount - cashAtBasDate);
  const canAfford = cashAtBasDate >= basAmount;

  const getDaysUntil = () => {
    const today = new Date();
    const due = new Date(basDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntil();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={20} className="text-rose-400" />
        <h2 className="text-lg font-semibold text-white">BAS/GST Payment</h2>
      </div>

      {/* Main BAS Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-6 border ${
          canAfford 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-rose-500/10 border-rose-500/30'
        }`}
      >
        <div className="absolute top-4 right-4">
          {canAfford ? (
            <CheckCircle className="text-emerald-400" size={24} />
          ) : (
            <AlertTriangle className="text-rose-400" size={24} />
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">BAS Due Date</p>
          <p className="text-2xl font-bold text-white">
            {new Date(basDate).toLocaleDateString('en-AU', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className={`text-sm mt-1 ${daysUntil <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
            {daysUntil} days away
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/30 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Amount Due</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(basAmount)}</p>
          </div>
          <div className="bg-slate-900/30 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Projected Cash</p>
            <p className={`text-2xl font-bold ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(cashAtBasDate)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Shortfall Warning */}
      {!canAfford && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-rose-500/10 rounded-2xl p-5 border border-rose-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 mt-0.5">
              <TrendingDown size={18} className="text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-rose-400 font-semibold">Cash Shortfall Projected</p>
              <p className="text-sm text-slate-400 mt-1">
                Based on current projections, you'll be <span className="text-rose-400 font-bold">{formatCurrency(basShortfall)}</span> short when BAS is due.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* After Payment Projection */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30"
      >
        <h3 className="text-sm font-semibold text-white mb-4">After BAS Payment</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Projected Balance</p>
            <p className={`text-2xl font-bold ${
              projectedAfterBas > 5000 
                ? 'text-emerald-400' 
                : projectedAfterBas > 0 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
            }`}>
              {projectedAfterBas > 0 ? '' : '-'}{formatCurrency(projectedAfterBas)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl ${
            projectedAfterBas > 5000 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : projectedAfterBas > 0 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-rose-500/20 text-rose-400'
          }`}>
            {projectedAfterBas > 5000 
              ? 'Healthy' 
              : projectedAfterBas > 0 
                ? 'Tight' 
                : 'Negative'}
          </div>
        </div>
      </motion.div>

      {/* Cash Flow Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Cash Flow to BAS Date</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
            <span className="text-slate-400">Current Cash</span>
            <span className="font-semibold text-white">{formatCurrency(businessData.currentCash)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
            <span className="text-slate-400">Expected Revenue ({daysToBasDate > 0 ? daysToBasDate : daysUntil} days)</span>
            <span className="font-semibold text-emerald-400">
              +{formatCurrency(businessData.avgDailySales * (daysToBasDate > 0 ? daysToBasDate : daysUntil))}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
            <span className="text-slate-400">Estimated Expenses</span>
            <span className="font-semibold text-rose-400">
              -{formatCurrency(800 * (daysToBasDate > 0 ? daysToBasDate : daysUntil))}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">Projected at BAS Date</span>
            <span className={`font-bold text-lg ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(cashAtBasDate)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {!canAfford && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30"
        >
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <DollarSign size={16} />
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Negotiate extended payment terms with flexible suppliers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Consider ATO payment plan options if shortfall continues
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Focus on increasing weekend revenue leading up to due date
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}