import React, { useState, useEffect, useMemo } from 'react';
import { Settings, TrendingUp, TrendingDown, Calendar, DollarSign, Users, Receipt, ChevronRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusOverview from '../components/cashline/StatusOverview.jsx';
import ForecastTimeline from '../components/cashline/ForecastTimeline.jsx';
import PayrollSection from '../components/cashline/PayrollSection.jsx';
import SuppliersSection from '../components/cashline/SuppliersSection.jsx';
import BasSection from '../components/cashline/BasSection.jsx';
import SetupPanel from '../components/cashline/SetupPanel.jsx';

const DEFAULT_BUSINESS_DATA = {
  currentCash: 18500,
  avgDailySales: 4000,
  weeklyPayroll: 11400,
  payrollDay: 3,
  rentAmount: 6500,
  rentDay: 20,
  basAmount: 8400,
  basDate: '2026-01-28',
  lastUpdated: null
};

const DEFAULT_SUPPLIERS = [
  { id: 1, name: 'Premium Meats Co.', owed: 2400, due: '2026-01-17', flexibility: 'critical' },
  { id: 2, name: 'Fresh Produce Market', owed: 800, due: '2026-01-17', flexibility: 'flexible' },
  { id: 3, name: 'Wine Distributors', owed: 1850, due: '2026-01-20', flexibility: 'medium' },
  { id: 4, name: 'Linen Services', owed: 450, due: '2026-01-24', flexibility: 'flexible' },
];

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showSetup, setShowSetup] = useState(false);
  const [businessData, setBusinessData] = useState(DEFAULT_BUSINESS_DATA);
  const [suppliers, setSuppliers] = useState(DEFAULT_SUPPLIERS);

  useEffect(() => {
    const savedBusiness = localStorage.getItem('cashline-business-data');
    const savedSuppliers = localStorage.getItem('cashline-suppliers');
    if (savedBusiness) setBusinessData(JSON.parse(savedBusiness));
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
  }, []);

  const saveData = () => {
    const updatedBusiness = { ...businessData, lastUpdated: new Date().toISOString() };
    localStorage.setItem('cashline-business-data', JSON.stringify(updatedBusiness));
    localStorage.setItem('cashline-suppliers', JSON.stringify(suppliers));
    setBusinessData(updatedBusiness);
    setShowSetup(false);
  };

  const upcomingPayments = useMemo(() => {
    const payments = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() === businessData.payrollDay) {
        payments.push({
          date: date.toISOString().split('T')[0],
          type: 'payroll',
          amount: businessData.weeklyPayroll,
          desc: 'Weekly Payroll'
        });
      }
      
      if (date.getDate() === businessData.rentDay) {
        payments.push({
          date: date.toISOString().split('T')[0],
          type: 'rent',
          amount: businessData.rentAmount,
          desc: 'Rent'
        });
      }
    }

    if (businessData.basDate) {
      payments.push({
        date: businessData.basDate,
        type: 'bas',
        amount: businessData.basAmount,
        desc: 'BAS/GST Payment'
      });
    }

    suppliers.forEach(s => {
      payments.push({
        date: s.due,
        type: 'supplier',
        amount: s.owed,
        desc: s.name
      });
    });

    return payments.sort((a, b) => a.date.localeCompare(b.date));
  }, [businessData, suppliers]);

  const forecast = useMemo(() => {
    const result = [];
    let runningBalance = businessData.currentCash;
    const avgDailyCosts = 800;
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      const dayPayments = upcomingPayments.filter(p => p.date === dateStr);
      const totalOut = dayPayments.reduce((sum, p) => sum + p.amount, 0) + avgDailyCosts;

      const salesMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.4 : 1;
      const cashIn = businessData.avgDailySales * salesMultiplier;

      runningBalance += cashIn - totalOut;

      result.push({
        date: dateStr,
        day: date.getDate(),
        month: date.toLocaleDateString('en-AU', { month: 'short' }),
        dayName: date.toLocaleDateString('en-AU', { weekday: 'short' }),
        cashIn,
        cashOut: totalOut,
        balance: runningBalance,
        payments: dayPayments,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6
      });
    }

    return result;
  }, [businessData, upcomingPayments]);

  const minBalance = Math.min(...forecast.map(f => f.balance));
  const criticalDate = forecast.findIndex(f => f.balance < 5000);
  const status = minBalance > 10000 ? 'safe' : minBalance > 5000 ? 'watch' : 'risk';

  const tabs = [
    { id: 'dashboard', label: 'Today', icon: DollarSign },
    { id: 'timeline', label: '14 Days', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Receipt },
    { id: 'bas', label: 'BAS', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              CashLine
            </h1>
            {businessData.lastUpdated && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={10} />
                Updated {new Date(businessData.lastUpdated).toLocaleDateString('en-AU')}
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSetup(!showSetup)}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300 backdrop-blur-sm"
          >
            <Settings size={20} className="text-slate-400" />
          </motion.button>
        </motion.header>

        {/* Setup Panel */}
        <AnimatePresence>
          {showSetup && (
            <SetupPanel
              businessData={businessData}
              setBusinessData={setBusinessData}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              onSave={saveData}
              onClose={() => setShowSetup(false)}
            />
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap text-sm ${
                  activeView === tab.id
                    ? 'bg-white text-slate-900 shadow-lg shadow-white/10'
                    : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border border-slate-700/30'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'dashboard' && (
              <StatusOverview
                businessData={businessData}
                status={status}
                criticalDate={criticalDate}
                upcomingPayments={upcomingPayments}
                forecast={forecast}
              />
            )}
            {activeView === 'timeline' && (
              <ForecastTimeline forecast={forecast} />
            )}
            {activeView === 'payroll' && (
              <PayrollSection businessData={businessData} />
            )}
            {activeView === 'suppliers' && (
              <SuppliersSection suppliers={suppliers} />
            )}
            {activeView === 'bas' && (
              <BasSection businessData={businessData} forecast={forecast} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}