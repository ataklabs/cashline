import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, ChevronRight, Shield, Zap } from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString()}`;
};

export default function StatusOverview({ businessData, status, criticalDate, upcomingPayments, forecast }) {
  const todaySales = businessData.avgDailySales;
  const todayCosts = 850;
  const basDate = businessData.basDate;
  const cashAtBasDate = forecast.find(f => f.date === basDate)?.balance || 0;
  const basShortfall = Math.max(0, businessData.basAmount - cashAtBasDate);

  const statusConfig = {
    safe: {
      label: 'Safe',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle
    },
    watch: {
      label: 'Watch',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: Clock
    },
    risk: {
      label: 'Risk',
      color: 'from-rose-500 to-red-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: AlertTriangle
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-2xl ${currentStatus.bg} border ${currentStatus.border} p-6`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <StatusIcon className="w-full h-full" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${currentStatus.color}`}>
            <StatusIcon size={20} className="text-white" />
          </div>
          <span className={`text-lg font-bold ${currentStatus.text}`}>
            {currentStatus.label}
          </span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          {criticalDate > 0
            ? `At this pace, cash becomes critical in ${criticalDate} days.`
            : 'Cash position is stable for the next 14 days.'}
        </p>
      </motion.div>

      {/* Cash Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Shield size={14} className="text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Available</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(businessData.currentCash)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Expected</p>
          <p className="text-xl font-bold text-emerald-400">
            +{formatCurrency(todaySales)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20">
              <TrendingDown size={14} className="text-rose-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Due Today</p>
          <p className="text-xl font-bold text-rose-400">
            -{formatCurrency(todayCosts)}
          </p>
        </motion.div>
      </div>

      {/* Next Critical Payment */}
      {upcomingPayments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next Critical Payment</p>
              <p className="text-sm text-slate-300 font-medium mb-1">
                {new Date(upcomingPayments[0].date).toLocaleDateString('en-AU', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-slate-400 text-sm">{upcomingPayments[0].desc}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {formatCurrency(upcomingPayments[0].amount)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* BAS Warning */}
      {basShortfall > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-rose-500/10 backdrop-blur-sm rounded-2xl p-5 border border-rose-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20">
              <AlertTriangle size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-rose-400 font-semibold text-sm">BAS payment will create cash gap</p>
              <p className="text-slate-400 text-sm mt-1">
                {new Date(basDate).toLocaleDateString('en-AU')}: {formatCurrency(basShortfall)} shortfall projected
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}