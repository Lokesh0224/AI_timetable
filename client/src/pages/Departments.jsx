import React, { useState, useEffect } from 'react';
import { departmentsAPI } from '../services/api';
import { Plus, Trash2, Library } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentsAPI.create(formData);
      toast.success('Department created');
      setFormData({ name: '', code: '' });
      loadDepartments();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    try {
      await departmentsAPI.delete(id);
      toast.success('Department deleted');
      loadDepartments();
    } catch (err) {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Departments</h1>
        <p className="text-slate-500 font-medium mt-2">Manage college departments and their codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Library className="w-5 h-5 text-indigo-500" /> Add New Department
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Name</label>
                <input
                  type="text" required
                  placeholder="Computer Science Engineering"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all font-medium"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                <input
                  type="text" required
                  placeholder="CSE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all font-mono font-bold uppercase"
                  value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-2">
                <Plus className="w-5 h-5"/> Add Department
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, i) => (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={dept._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start w-full">
                  <div className="bg-indigo-50 text-indigo-700 font-black px-3 py-1.5 rounded-lg text-sm border border-indigo-100 tracking-widest">{dept.code}</div>
                  <button onClick={() => handleDelete(dept._id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-extrabold text-xl text-slate-800 leading-tight">{dept.name}</h3>
              </motion.div>
            ))}
            {departments.length === 0 && (
              <div className="col-span-full p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-bold">No departments added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
