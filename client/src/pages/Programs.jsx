import React, { useState, useEffect } from 'react';
import { programsAPI, departmentsAPI } from '../services/api';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '', departmentId: '', durationYears: 4 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [progRes, deptRes] = await Promise.all([programsAPI.getAll(), departmentsAPI.getAll()]);
      setPrograms(progRes); setDepartments(deptRes);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) return toast.error("Please select a department");
    try {
      await programsAPI.create(formData);
      toast.success('Program created');
      setFormData({ ...formData, name: '' });
      loadData();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    try {
      await programsAPI.delete(id);
      toast.success('Program deleted');
      loadData();
    } catch (err) {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Programs</h1>
        <p className="text-slate-500 font-medium mt-2">Manage degree programs (B.Tech, B.Sc) mapped to departments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" /> Add New Program
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program Name</label>
                <input
                  type="text" required placeholder="B.Tech"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all font-bold"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                  value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Years)</label>
                <input
                  type="number" min="1" max="6" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all font-bold"
                  value={formData.durationYears} onChange={e => setFormData({...formData, durationYears: parseInt(e.target.value)})}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-2">
                <Plus className="w-5 h-5"/> Add Program
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border text-left border-slate-200 shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-widest">
                <tr>
                  <th className="px-6 py-5">Program</th>
                  <th className="px-6 py-5">Department</th>
                  <th className="px-6 py-5 text-center">Duration</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programs.map(prog => (
                  <tr key={prog._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800 text-base">{prog.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      <span className="bg-slate-100 px-3 py-1 rounded-md text-xs border border-slate-200">{prog.departmentId?.code || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{prog.durationYears} Years</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(prog._id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {programs.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-slate-500 font-bold">No programs added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
