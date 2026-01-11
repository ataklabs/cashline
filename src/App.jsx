import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X, Edit2, Save, Settings } from 'lucide-react';

const CashLine = () => {
  // Core state
  const [activeView, setActiveView] = useState('dashboard');
  const [showSetup, setShowSetup] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  // Business data with defaults
  const [businessData, setBusinessData] = useState({
    currentCash: 18500,
    avgDailySales: 4000,
    weeklyPayroll: 11400,
    payrollDay: 3, // Wednesday = 3
    rentAmount: 6500,
    rentDay: 20,
    basAmount: 8400,
    basDate: '2026-01-28',
    lastUpdated: null
  });
  
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Premium Meats Co.', owed: 2400, due: '2026-01-17', flexibility: 'critical' },
    { id: 2, name: 'Fresh Produce Market', owed: 800, due: '2026-01-17', flexibility: 'flexible' },
    { id: 3, name: 'Wine Distributors', owed: 1850, due: '2026-01-20', flexibility: 'medium' },
    { id: 4, name: 'Linen Services', owed: 450, due: '2026-01-24', flexibility: 'flexible' },
  ]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Storage functions using localStorage
  const loadData = () => {
    try {
      const savedBusiness = localStorage.getItem('cashline-business-data');
      const savedSuppliers = localStorage.getItem('cashline-suppliers');
      
      if (savedBusiness) {
        setBusinessData(JSON.parse(savedBusiness));
      }
      if (savedSuppliers) {
        setSuppliers(JSON.parse(savedSuppliers));
      }
    } catch (error) {
      console.log('First time user - using defaults');
    }
  };
  
  const saveData = () => {
    try {
      const updatedBusiness = { ...businessData, lastUpdated: new Date().toISOString() };
      localStorage.setItem('cashline-business-data', JSON.stringify(updatedBusiness));
      localStorage.setItem('cashline-suppliers', JSON.stringify(suppliers));
      setBusinessData(updatedBusiness);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  };
  
  // Calculate upcoming payments
  const generateUpcomingPayments = () => {
    const payments = [];
    const today = new Date();
    
    // Generate payrolls for next 30 days
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
    
    // Add BAS
    if (businessData.basDate) {
      payments.push({
        date: businessData.basDate,
        type: 'bas',
        amount: businessData.basAmount,
        desc: 'BAS/GST Payment'
      });
    }
    
    // Add suppliers
    suppliers.forEach(s => {
      payments.push({
        date: s.due,
        type: 'supplier',
        amount: s.owed,
        desc: s.name
      });
    });
    
    return payments.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const upcomingPayments = generateUpcomingPayments();
  
  // Generate 14-day forecast
  const generate14DayForecast = () => {
    const forecast = [];
    let runningBalance = businessData.currentCash;
    const avgDailyCosts = 800;
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      const payments = upcomingPayments.filter(p => p.date === dateStr);
      const totalOut = payments.reduce((sum, p) => sum + p.amount, 0) + avgDailyCosts;
      
      const salesMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.4 : 1;
      const cashIn = businessData.avgDailySales * salesMultiplier;
      
      runningBalance += cashIn - totalOut;
      
      forecast.push({
        date: dateStr,
        day: date.getDate(),
        month: date.toLocaleDateString('en-AU', { month: 'short' }),
        dayName: date.toLocaleDateString('en-AU', { weekday: 'short' }),
        cashIn,
        cashOut: totalOut,
        balance: runningBalance,
        payments,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6
      });
    }
    
    return forecast;
  };
  
  const forecast = generate14DayForecast();
  const minBalance = Math.min(...forecast.map(f => f.balance));
  const criticalDate = forecast.findIndex(f => f.balance < 5000);
  const status = minBalance > 10000 ? 'safe' : minBalance > 5000 ? 'watch' : 'risk';
  
  const recentWeeklySales = businessData.avgDailySales * 7;
  const payrollPercent = Math.round((businessData.weeklyPayroll / recentWeeklySales) * 100);
  
  const basDate = businessData.basDate;
  const daysToBasDate = forecast.findIndex(f => f.date === basDate);
  const cashAtBasDate = forecast.find(f => f.date === basDate)?.balance || 0;
  const basShortfall = Math.max(0, businessData.basAmount - cashAtBasDate);
  
  // Supplier management
  const addSupplier = () => {
    const newSupplier = {
      id: Date.now(),
      name: '',
      owed: 0,
      due: new Date().toISOString().split('T')[0],
      flexibility: 'medium'
    };
    setSuppliers([...suppliers, newSupplier]);
    setEditingSupplier(newSupplier.id);
  };
  
  const updateSupplier = (id, field, value) => {
    setSuppliers(suppliers.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };
  
  const deleteSupplier = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };
  
  const todaySales = businessData.avgDailySales;
  const todayCosts = 850;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">CashLine</h1>
            {businessData.lastUpdated && (
              <div className="text-xs text-slate-400 mt-1">
                Updated {new Date(businessData.lastUpdated).toLocaleDateString('en-AU')}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Setup Panel */}
        {showSetup && (
          <div className="bg-slate-800 rounded-xl p-5 mb-4 space-y-4">
            <h2 className="font-bold text-lg mb-4">Business Setup</h2>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Cash Available</label>
              <input
                type="number"
                value={businessData.currentCash}
                onChange={(e) => setBusinessData({...businessData, currentCash: Number(e.target.value)})}
                className="w-full bg-slate-900 rounded-lg px-4 py-3 text-lg font-bold"
                placeholder="18500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">Average Daily Sales</label>
              <input
                type="number"
                value={businessData.avgDailySales}
                onChange={(e) => setBusinessData({...businessData, avgDailySales: Number(e.target.value)})}
                className="w-full bg-slate-900 rounded-lg px-4 py-3"
                placeholder="4000"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Weekly Payroll</label>
                <input
                  type="number"
                  value={businessData.weeklyPayroll}
                  onChange={(e) => setBusinessData({...businessData, weeklyPayroll: Number(e.target.value)})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                  placeholder="11400"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Payroll Day</label>
                <select
                  value={businessData.payrollDay}
                  onChange={(e) => setBusinessData({...businessData, payrollDay: Number(e.target.value)})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Monthly Rent</label>
                <input
                  type="number"
                  value={businessData.rentAmount}
                  onChange={(e) => setBusinessData({...businessData, rentAmount: Number(e.target.value)})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                  placeholder="6500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Rent Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={businessData.rentDay}
                  onChange={(e) => setBusinessData({...businessData, rentDay: Number(e.target.value)})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                  placeholder="20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-2">BAS/GST Amount</label>
                <input
                  type="number"
                  value={businessData.basAmount}
                  onChange={(e) => setBusinessData({...businessData, basAmount: Number(e.target.value)})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                  placeholder="8400"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">BAS Due Date</label>
                <input
                  type="date"
                  value={businessData.basDate}
                  onChange={(e) => setBusinessData({...businessData, basDate: e.target.value})}
                  className="w-full bg-slate-900 rounded-lg px-4 py-3"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-slate-400">Suppliers</label>
                <button
                  onClick={addSupplier}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Supplier
                </button>
              </div>
              
              <div className="space-y-2">
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="bg-slate-900 rounded-lg p-3">
                    {editingSupplier === supplier.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={supplier.name}
                          onChange={(e) => updateSupplier(supplier.id, 'name', e.target.value)}
                          className="w-full bg-slate-800 rounded px-3 py-2 text-sm"
                          placeholder="Supplier name"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={supplier.owed}
                            onChange={(e) => updateSupplier(supplier.id, 'owed', Number(e.target.value))}
                            className="bg-slate-800 rounded px-3 py-2 text-sm"
                            placeholder="Amount"
                          />
                          <input
                            type="date"
                            value={supplier.due}
                            onChange={(e) => updateSupplier(supplier.id, 'due', e.target.value)}
                            className="bg-slate-800 rounded px-3 py-2 text-sm"
                          />
                          <select
                            value={supplier.flexibility}
                            onChange={(e) => updateSupplier(supplier.id, 'flexibility', e.target.value)}
                            className="bg-slate-800 rounded px-3 py-2 text-sm"
                          >
                            <option value="critical">Critical</option>
                            <option value="medium">Medium</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSupplier(null)}
                            className="flex-1 px-3 py-2 bg-green-600 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Done
                          </button>
                          <button
                            onClick={() => deleteSupplier(supplier.id)}
                            className="px-3 py-2 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{supplier.name || 'New Supplier'}</div>
                          <div className="text-xs text-slate-400">
                            ${supplier.owed.toLocaleString()} · {new Date(supplier.due).toLocaleDateString('en-AU')} · {supplier.flexibility}
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingSupplier(supplier.id)}
                          className="p-2 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => {
                const success = saveData();
                if (success) {
                  setShowSetup(false);
                  alert('Data saved successfully!');
                }
              }}
              className="w-full py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Today' },
            { id: 'timeline', label: '14 Days' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'suppliers', label: 'Suppliers' },
            { id: 'bas', label: 'BAS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                activeView === tab.id
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="space-y-3">
            
            <div className={`p-6 rounded-xl ${
              status === 'safe' ? 'bg-green-900 bg-opacity-40' :
              status === 'watch' ? 'bg-orange-900 bg-opacity-40' :
              'bg-red-900 bg-opacity-40'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-5 h-5 rounded-full ${
                  status === 'safe' ? 'bg-green-500' :
                  status === 'watch' ? 'bg-orange-500' :
                  'bg-red-500'
                }`} />
                <span className="font-bold text-lg uppercase tracking-wide">
                  {status === 'safe' ? 'Safe' : status === 'watch' ? 'Watch' : 'Risk'}
                </span>
              </div>
              <p className="text-2xl font-bold leading-tight">
                {criticalDate > 0 
                  ? `At this pace, cash becomes critical in ${criticalDate} days.`
                  : 'Cash position is stable for the next 14 days.'}
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Cash Available Now</div>
              <div className="text-5xl font-bold mb-4">
                ${(businessData.currentCash / 1000).toFixed(1)}k
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Expected Today</div>
                  <div className="text-xl font-bold text-green-400">+${(todaySales / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Due Today</div>
                  <div className="text-xl font-bold text-slate-300">-${(todayCosts / 1000).toFixed(1)}k</div>
                </div>
              </div>
            </div>

            {upcomingPayments.length > 0 && (
              <div className="bg-red-900 bg-opacity-30 rounded-xl p-5 border border-red-800">
                <div className="text-red-300 text-sm mb-2">Next Critical Payment</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {new Date(upcomingPayments[0].date).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-slate-300 mt-1">{upcomingPayments[0].desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">${(upcomingPayments[0].amount / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              </div>
            )}

            {basShortfall > 0 && (
              <div className="bg-red-900 bg-opacity-30 rounded-xl p-4 border border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <div className="font-bold mb-1">BAS payment will create cash gap</div>
                    <div className="text-sm text-slate-300">{new Date(basDate).toLocaleDateString('en-AU')}: ${(basShortfall / 1000).toFixed(1)}k shortfall projected</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 14-DAY TIMELINE */}
        {activeView === 'timeline' && (
          <div className="space-y-2">
            <div className="text-slate-400 text-sm mb-3">
              Next 14 days · Based on recent averages
            </div>
            
            {forecast.map((day, idx) => {
              const isToday = idx === 0;
              const hasPayments = day.payments.length > 0;
              
              return (
                <div 
                  key={idx} 
                  className={`rounded-xl p-4 border-2 ${
                    day.balance < 5000 ? 'bg-red-900 bg-opacity-20 border-red-800' :
                    day.balance < 10000 ? 'bg-orange-900 bg-opacity-20 border-orange-800' :
                    'bg-slate-800 border-slate-700'
                  } ${isToday ? 'border-white' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold w-10">{day.dayName}</div>
                      <div className="text-slate-400 text-sm">{day.month} {day.day}</div>
                      {day.isWeekend && <div className="text-xs text-green-400">↑</div>}
                    </div>
                    <div className={`text-xl font-bold ${
                      day.balance < 5000 ? 'text-red-400' :
                      day.balance < 10000 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      ${(day.balance / 1000).toFixed(1)}k
                    </div>
                  </div>
                  
                  {hasPayments && (
                    <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
                      {day.payments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{p.desc}</span>
                          <span className="font-bold">-${(p.amount / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAYROLL */}
        {activeView === 'payroll' && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-4">Weekly Payroll Pressure</div>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Amount</div>
                  <div className="text-3xl font-bold">${(businessData.weeklyPayroll / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">% of Sales</div>
                  <div className={`text-3xl font-bold ${
                    payrollPercent > 40 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {payrollPercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-3">Next 3 Payrolls</div>
              <div className="space-y-3">
                {upcomingPayments.filter(p => p.type === 'payroll').slice(0, 3).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div className="text-sm text-slate-300">
                      {new Date(p.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-bold">${(p.amount / 1000).toFixed(1)}k</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPPLIERS */}
        {activeView === 'suppliers' && (
          <div className="space-y-2">
            <div className="text-slate-400 text-sm mb-3">
              Who to pay first · Sorted by criticality
            </div>
            
            {suppliers.sort((a, b) => {
              const priority = { critical: 0, medium: 1, flexible: 2 };
              return priority[a.flexibility] - priority[b.flexibility];
            }).map((s, idx) => (
              <div 
                key={idx} 
                className={`rounded-xl p-4 border-2 ${
                  s.flexibility === 'critical' ? 'bg-red-900 bg-opacity-20 border-red-800' :
                  s.flexibility === 'medium' ? 'bg-orange-900 bg-opacity-20 border-orange-800' :
                  'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">{s.name}</div>
                    <div className="text-sm text-slate-400">
                      Due {new Date(s.due).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${(s.owed / 1000).toFixed(1)}k</div>
                    <div className={`text-xs font-bold uppercase mt-1 ${
                      s.flexibility === 'critical' ? 'text-red-400' :
                      s.flexibility === 'medium' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {s.flexibility}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-slate-800 rounded-xl p-4 mt-4">
              <div className="text-xs text-slate-400">
                <div className="mb-1"><span className="text-red-400 font-bold">Critical:</span> Pay immediately or risk supply cut</div>
                <div className="mb-1"><span className="text-orange-400 font-bold">Medium:</span> Can negotiate 3-7 day delay</div>
                <div><span className="text-green-400 font-bold">Flexible:</span> Can delay 1-2 weeks if needed</div>
              </div>
            </div>
          </div>
        )}

        {/* BAS/GST */}
        {activeView === 'bas' && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-4">Upcoming BAS/GST Obligation</div>
              
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Amount</div>
                  <div className="text-2xl font-bold">${(businessData.basAmount / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Due</div>
                  <div className="text-2xl font-bold">{new Date(basDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Cash Then</div>
                  <div className={`text-2xl font-bold ${
                    cashAtBasDate > businessData.basAmount ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${(cashAtBasDate / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>

              {basShortfall > 0 && (
                <div className="bg-red-900 bg-opacity-40 rounded-lg p-4 border border-red-800">
                  <div className="font-bold text-lg mb-2">
                    If nothing changes, BAS will create a ${(basShortfall / 1000).toFixed(1)}k cash gap
                  </div>
                  <div className="text-sm text-slate-300">
                    {daysToBasDate > 0 ? `${daysToBasDate} days to find ${(basShortfall / 1000).toFixed(1)}k or negotiate payment plan` : 'BAS due soon - take action now'}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 leading-relaxed">
                This estimate is based on recent GST collected from sales. The actual amount may vary. 
                Always verify with your accountant before the due date.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CashLine;