import React, { useState, useEffect } from 'react';
import { sectionsAPI, programsAPI, departmentsAPI } from '../services/api';
import { Plus, Trash2, Users, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', departmentId: '', programId: '', year: 1, studentCount: 60 });
  const [bulkData, setBulkData] = useState({ count: 4, departmentId: '', programId: '', year: 1 });
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [secRes, progRes, deptRes] = await Promise.all([
        sectionsAPI.getAll(), programsAPI.getAll(), departmentsAPI.getAll()
      ]);
      setSections(secRes); setPrograms(progRes); setDepartments(deptRes);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.programId) return toast.error("Select program");
    try {
      await sectionsAPI.create(formData);
      toast.success('Section created');
      setFormData({ ...formData, name: '' });
      loadData();
    } catch (err) {}
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!bulkData.programId) return toast.error("Select program");
    try {
      await sectionsAPI.createBulk(bulkData);
      toast.success(`Created ${bulkData.count} sections`);
      setShowBulkModal(false);
      loadData();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    try {
      await sectionsAPI.delete(id);
      toast.success('Section deleted');
      loadData();
    } catch (err) {}
  };

  const filteredPrograms = programs.filter(p => !formData.departmentId || p.departmentId?._id === formData.departmentId);
  const selectedProgram = programs.find(p => p._id === formData.programId);
  const years = selectedProgram ? Array.from({length: selectedProgram.durationYears}, (_, i) => i + 1) : [1,2,3,4];

  const filteredBulkPrograms = programs.filter(p => !bulkData.departmentId || p.departmentId?._id === bulkData.departmentId);
  const selectedBulkProgram = programs.find(p => p._id === bulkData.programId);
  const bulkYears = selectedBulkProgram ? Array.from({length: selectedBulkProgram.durationYears}, (_, i) => i + 1) : [1,2,3,4];

  // Group sections for display: Dept -> Prog -> Year
  const groupedSections = {};
  sections.forEach(s => {
    const deptName = s.departmentId?.code || 'Unknown';
    const progName = s.programId?.name || 'Unknown';
    const groupKey = `${deptName} / ${progName} / Year ${s.year}`;
    if (!groupedSections[groupKey]) groupedSections[groupKey] = [];
    groupedSections[groupKey].push(s);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto pb-10 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sections</h1>
          <p className="text-slate-500 font-medium mt-2">Create student groupings matching the academic tree.</p>
        </div>
        <button onClick={() => setShowBulkModal(true)} className="bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-200 transition-colors flex items-center gap-2 shadow-sm">
          <Layers className="w-5 h-5"/> Bulk Create Sections
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Single Section
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-medium text-slate-700"
                  value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value, programId: ''})}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program</label>
                <select 
                  required disabled={!formData.departmentId}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-medium text-slate-700 disabled:opacity-50"
                  value={formData.programId} onChange={e => setFormData({...formData, programId: e.target.value})}
                >
                  <option value="" disabled>Select Program</option>
                  {filteredPrograms.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                <select 
                  required disabled={!formData.programId}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-medium text-slate-700 disabled:opacity-50"
                  value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                >
                  {years.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section Name (e.g. A)</label>
                <input
                  type="text" required placeholder="A" maxLength={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-bold uppercase"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Count</label>
                <input
                  type="number" required min={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-bold"
                  value={formData.studentCount} onChange={e => setFormData({...formData, studentCount: parseInt(e.target.value)})}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 mt-2">
                Create Section
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {Object.keys(groupedSections).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-bold">No sections configured.</p>
            </div>
          ) : (
            Object.keys(groupedSections).sort().map(groupKey => (
              <div key={groupKey} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                   <Users className="w-5 h-5 text-indigo-500" />
                   <h3 className="font-bold text-slate-700 tracking-tight">{groupKey}</h3>
                   <span className="ml-auto bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                     {groupedSections[groupKey].length} Sections
                   </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {groupedSections[groupKey].map(sec => (
                    <div key={sec._id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="bg-indigo-100 text-indigo-800 font-black w-10 h-10 flex items-center justify-center rounded-xl text-lg">{sec.name}</span>
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">Section {sec.name}</span>
                           <span className="text-xs font-semibold text-slate-500">{sec.studentCount} Students</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(sec._id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} key="modal" animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <Layers className="w-6 h-6 text-indigo-600" /> Bulk Create
              </h2>
              <form onSubmit={handleBulkCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select 
                    required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-medium"
                    value={bulkData.departmentId} onChange={e => setBulkData({...bulkData, departmentId: e.target.value, programId: ''})}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program</label>
                  <select 
                    required disabled={!bulkData.departmentId}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-medium disabled:opacity-50"
                    value={bulkData.programId} onChange={e => setBulkData({...bulkData, programId: e.target.value})}
                  >
                    <option value="" disabled>Select Program</option>
                    {filteredBulkPrograms.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                    <select 
                      required disabled={!bulkData.programId}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-bold disabled:opacity-50"
                      value={bulkData.year} onChange={e => setBulkData({...bulkData, year: parseInt(e.target.value)})}
                    >
                      {bulkYears.map((y) => <option key={y} value={y}>Y{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                    <input
                      type="number" required min={1} max={26}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none font-bold"
                      value={bulkData.count} onChange={e => setBulkData({...bulkData, count: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                {bulkData.count > 0 && bulkData.count <= 26 && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm font-semibold">
                    Will auto-generate sections: {Array.from({length: bulkData.count}, (_, i) => String.fromCharCode(65 + i)).join(', ')}
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md">Create All</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
