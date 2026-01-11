import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString()}`;
};

const flexibilityConfig = {
  critical: {
    label: 'Critical',
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: AlertCircle
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Clock
  },
  flexible: {
    label: 'Flexible',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2
  }
};

export default function SuppliersSection({ suppliers }) {
  const totalOwed = suppliers.reduce((sum, s) => sum + s.owed, 0);
  const criticalSuppliers = suppliers.filter(s => s.flexibility === 'critical');
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const priority = { critical: 0, medium: 1, flexible: 2 };
    return priority[a.flexibility] - priority[b.flexibility] || new Date(a.due) - new Date(b.due);
  });

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Receipt size={20} className="text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Supplier Payments</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Owed</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalOwed)}</p>
          <p className="text-xs text-slate-500 mt-1">{suppliers.length} suppliers</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl p-5 border ${
            criticalSuppliers.length > 0 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Critical</p>
          <p className={`text-2xl font-bold ${
            criticalSuppliers.length > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {criticalSuppliers.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {criticalSuppliers.length > 0 
              ? formatCurrency(criticalSuppliers.reduce((s, c) => s + c.owed, 0))
              : 'All manageable'}
          </p>
        </motion.div>
      </div>

      {/* Supplier List */}
      <div className="space-y-2">
        {sortedSuppliers.map((supplier, idx) => {
          const config = flexibilityConfig[supplier.flexibility];
          const Icon = config.icon;
          const daysUntil = getDaysUntilDue(supplier.due);
          const isOverdue = daysUntil < 0;
          const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

          return (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-4 border transition-all duration-300 hover:scale-[1.01] ${
                isOverdue 
                  ? 'bg-rose-500/10 border-rose-500/30' 
                  : isDueSoon && supplier.flexibility === 'critical'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                    <Icon size={16} className={config.color.split(' ')[1]} />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{supplier.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs ${
                        isOverdue 
                          ? 'text-rose-400' 
                          : isDueSoon 
                            ? 'text-amber-400' 
                            : 'text-slate-500'
                      }`}>
                        {isOverdue 
                          ? `${Math.abs(daysUntil)} days overdue`
                          : daysUntil === 0 
                            ? 'Due today'
                            : `Due in ${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(supplier.owed)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(supplier.due).toLocaleDateString('en-AU', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payment Priority Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/20"
      >
        <p className="text-xs font-medium text-slate-400 mb-3">Payment Priority</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle size={14} className="text-rose-400" />
            <span className="text-slate-400">Critical - Pay on time to maintain supply</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock size={14} className="text-amber-400" />
            <span className="text-slate-400">Medium - Some flexibility, negotiate if needed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-slate-400">Flexible - Can extend payment terms</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}