"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Search, Percent, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SalaryStructuresTabProps {
  employees: any[];
  fetchEmployees: () => Promise<void>;
  userRole?: string;
}

export default function SalaryStructuresTab({ employees, fetchEmployees, userRole = 'HR' }: SalaryStructuresTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Editor States
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState<any | null>(null);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    basic: 0,
    hra: 0,
    allowance: 0,
    bonus: 0,
    pf: 0,
    esi: 0,
    tax: 0,
    otherDeductions: 0
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const calculatedSalaryNet = useMemo(() => {
    const { basic, hra, allowance, bonus, pf, esi, tax, otherDeductions } = salaryForm;
    const gross = Number(basic) + Number(hra) + Number(allowance) + Number(bonus);
    const deductions = Number(pf) + Number(esi) + Number(tax) + Number(otherDeductions);
    return Math.max(0, gross - deductions);
  }, [salaryForm]);

  const handleSaveSalaryStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForSalary) return;

    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/employees/${selectedEmployeeForSalary._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          salaryStructure: {
            ...salaryForm,
            net: calculatedSalaryNet
          }
        })
      });
      if (res.ok) {
        await fetchEmployees();
        setIsEditingSalary(false);
        setSelectedEmployeeForSalary(null);
      }
    } catch (err) {
      console.error('Failed to save salary structure:', err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Employee Wage Directory</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Manage compensation base rates and mandatory statutory deductions.</p>
        </div>
        <div className="min-w-[260px]">
          <input 
            type="text" 
            placeholder="Search employee salary base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Salary Structures Table */}
      <div className="saas-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-850">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Salary</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Allowances (HRA + SA)</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deductions (Tax + PF)</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Est. Net Takehome</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => {
                const s = emp.salaryStructure || { basic: 0, hra: 0, allowance: 0, pf: 0, tax: 0, net: 0 };
                return (
                  <tr key={emp._id} className="group hover:bg-slate-50/55 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{emp.fullName}</p>
                        <p className="text-[9px] font-bold text-slate-455 mt-0.5">{emp.designation || 'Specialist'} • {emp.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-black text-slate-805 dark:text-slate-205">₹{(s.basic || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-slate-500">₹{((s.hra || 0) + (s.allowance || 0)).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-rose-500">
                      <span className="text-[11px] font-bold">-₹{((s.pf || 0) + (s.tax || 0)).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-black text-blue-600">₹{(s.net || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          setSelectedEmployeeForSalary(emp);
                          setSalaryForm(s);
                          setIsEditingSalary(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 dark:text-slate-350 rounded-lg text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-1 border border-transparent"
                      >
                        <Edit2 className="w-3 h-3" /> Setup
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Setup salary structures */}
      <AnimatePresence>
        {isEditingSalary && selectedEmployeeForSalary && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="wage-setup-modal w-full max-w-xl rounded-2xl p-5 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Configure Wage Package</h3>
                  <p className="text-[9px] text-slate-455 font-bold mt-0.5">Assign salary parameters for {selectedEmployeeForSalary.fullName}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsEditingSalary(false);
                    setSelectedEmployeeForSalary(null);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSalaryStructure} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Earnings */}
                  <div className="col-span-2 space-y-3">
                    <h4 className="text-[9px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-widest border-b pb-1.5">Earnings Components</h4>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Basic Salary (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.basic}
                        onChange={(e) => setSalaryForm({ ...salaryForm, basic: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">HRA Allowance (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.hra}
                        onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Special Allowance (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.allowance}
                        onChange={(e) => setSalaryForm({ ...salaryForm, allowance: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Recurring Bonus (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.bonus}
                        onChange={(e) => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="col-span-2 space-y-3">
                    <h4 className="text-[9px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-widest border-b pb-1.5">Statutory Deductions</h4>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Provident Fund (PF) (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.pf}
                        onChange={(e) => setSalaryForm({ ...salaryForm, pf: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">ESI Deductions (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.esi}
                        onChange={(e) => setSalaryForm({ ...salaryForm, esi: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">TDS Income Tax (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.tax}
                        onChange={(e) => setSalaryForm({ ...salaryForm, tax: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Other Deductions (₹)</label>
                      <input 
                        type="number" 
                        required
                        className="saas-input w-full px-2.5 py-1.5 text-[11px] border border-slate-150/40 rounded-lg outline-none focus:border-blue-500/50"
                        value={salaryForm.otherDeductions}
                        onChange={(e) => setSalaryForm({ ...salaryForm, otherDeductions: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Net Pay Calculator Promo */}
                <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-750 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4.5 h-4.5 text-blue-600" />
                    <div>
                      <h4 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Estimated Net Pay Summary</h4>
                      <p className="text-[7.5px] text-slate-455 font-bold uppercase mt-0.5">Calculated in real-time based on variables</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase block mb-0.5">Estimated takehome</span>
                    <span className="text-base font-black text-blue-600">₹{calculatedSalaryNet.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Save Wage Settings
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditingSalary(false);
                      setSelectedEmployeeForSalary(null);
                    }}
                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-400 rounded-lg text-[8.5px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
