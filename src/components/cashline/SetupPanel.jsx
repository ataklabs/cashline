import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, Edit2, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export default function SetupPanel({ 
  businessData, 
  setBusinessData, 
  suppliers, 
  setSuppliers, 
  onSave, 
  onClose 
}) {
  const [editingSupplier, setEditingSupplier] = useState(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 overflow-hidden"
    >
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Settings size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Business Setup</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Current Cash Available
            </Label>
            <Input
              type="number"
              value={businessData.currentCash}
              onChange={(e) => setBusinessData({...businessData, currentCash: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white text-lg font-bold h-12"
              placeholder="18500"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Avg Daily Sales
            </Label>
            <Input
              type="number"
              value={businessData.avgDailySales}
              onChange={(e) => setBusinessData({...businessData, avgDailySales: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
              placeholder="4000"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Weekly Payroll
            </Label>
            <Input
              type="number"
              value={businessData.weeklyPayroll}
              onChange={(e) => setBusinessData({...businessData, weeklyPayroll: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
              placeholder="11400"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Payroll Day
            </Label>
            <Select 
              value={String(businessData.payrollDay)}
              onValueChange={(value) => setBusinessData({...businessData, payrollDay: Number(value)})}
            >
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {DAYS.map(day => (
                  <SelectItem key={day.value} value={day.value} className="text-white">
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Monthly Rent
            </Label>
            <Input
              type="number"
              value={businessData.rentAmount}
              onChange={(e) => setBusinessData({...businessData, rentAmount: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
              placeholder="6500"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              Rent Day
            </Label>
            <Input
              type="number"
              value={businessData.rentDay}
              onChange={(e) => setBusinessData({...businessData, rentDay: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
              placeholder="20"
              min="1"
              max="31"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              BAS/GST Amount
            </Label>
            <Input
              type="number"
              value={businessData.basAmount}
              onChange={(e) => setBusinessData({...businessData, basAmount: Number(e.target.value)})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
              placeholder="8400"
            />
          </div>

          <div>
            <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
              BAS Due Date
            </Label>
            <Input
              type="date"
              value={businessData.basDate}
              onChange={(e) => setBusinessData({...businessData, basDate: e.target.value})}
              className="bg-slate-900/50 border-slate-700 text-white h-11"
            />
          </div>
        </div>

        {/* Suppliers Section */}
        <div className="border-t border-slate-700/50 pt-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-slate-400 text-xs uppercase tracking-wider">Suppliers</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={addSupplier}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {suppliers.map(supplier => (
              <div 
                key={supplier.id}
                className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/30"
              >
                {editingSupplier === supplier.id ? (
                  <div className="space-y-3">
                    <Input
                      value={supplier.name}
                      onChange={(e) => updateSupplier(supplier.id, 'name', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white h-9 text-sm"
                      placeholder="Supplier name"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={supplier.owed}
                        onChange={(e) => updateSupplier(supplier.id, 'owed', Number(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white h-9 text-sm"
                        placeholder="Amount"
                      />
                      <Input
                        type="date"
                        value={supplier.due}
                        onChange={(e) => updateSupplier(supplier.id, 'due', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white h-9 text-sm"
                      />
                      <Select 
                        value={supplier.flexibility}
                        onValueChange={(value) => updateSupplier(supplier.id, 'flexibility', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="critical" className="text-rose-400">Critical</SelectItem>
                          <SelectItem value="medium" className="text-amber-400">Medium</SelectItem>
                          <SelectItem value="flexible" className="text-emerald-400">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingSupplier(null)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8"
                      >
                        <Check size={14} className="mr-1" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSupplier(supplier.id)}
                        className="h-8"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {supplier.name || 'New Supplier'}
                      </p>
                      <p className="text-xs text-slate-500">
                        ${supplier.owed.toLocaleString()} · {new Date(supplier.due).toLocaleDateString('en-AU')} · {supplier.flexibility}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingSupplier(supplier.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} className="text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={onSave}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
        >
          <Save size={18} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}