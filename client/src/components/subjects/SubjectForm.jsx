import React, { useState, useEffect } from 'react';
import { subjectsAPI, facultyAPI } from '../../services/api';
import toast from 'react-hot-toast';

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year', badgeClass: 'bg-blue-100 text-blue-700 shadow-sm shadow-blue-100/50' },
  { value: 2, label: '2nd Year', badgeClass: 'bg-green-100 text-green-700 shadow-sm shadow-green-100/50' },
  { value: 3, label: '3rd Year', badgeClass: 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100/50' },
  { value: 4, label: '4th Year', badgeClass: 'bg-purple-100 text-purple-700 shadow-sm shadow-purple-100/50' },
];

export default function SubjectForm({ onRefresh, editItem, setEditItem }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [year, setYear] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const data = await facultyAPI.getAll();
      setFacultyList(data);
    } catch (e) { }
  };

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCode(editItem.code);
      setFacultyId(editItem.facultyId?._id || editItem.facultyId);
      setYear(editItem.year);
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setName(''); setCode(''); setFacultyId(''); setYear('');
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facultyId) return toast.error("Please assign a faculty member.");
    if (!year) return toast.error("Please select a year group.");

    try {
      setLoading(true);
      const payload = { name, code, facultyId, year: parseInt(year), hoursPerWeek: 5 };
      
      if (editItem) {
        await subjectsAPI.update(editItem._id, payload);
        toast.success("Subject updated successfully");
      } else {
        await subjectsAPI.create(payload);
        toast.success("Subject added successfully");
      }
      resetForm();
      onRefresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 shadow-md border-0 bg-white ring-1 ring-slate-200">
      <h2 className="text-xl tracking-tight font-bold text-slate-800 mb-6 font-sans">
        {editItem ? "Edit Subject" : "Add Subject"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold">Subject Name</label>
          <input type="text" required className="input bg-slate-50 border-slate-200 focus:bg-white" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold">Subject Code</label>
          <input type="text" required placeholder="e.g. CS101" className="input bg-slate-50 border-slate-200 focus:bg-white" value={code} onChange={e => setCode(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold">Assigned Faculty</label>
          <select required className="input bg-slate-50 border-slate-200 focus:bg-white" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
            <option value="" disabled>Select Faculty</option>
            {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label mt-2 mb-3 text-xs uppercase tracking-wider font-bold">Year Group</label>
          <div className="grid grid-cols-2 gap-3">
            {YEAR_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setYear(opt.value)}
                className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${year === opt.value ? 'ring-2 ring-indigo-500 border-transparent ' + opt.badgeClass : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label mb-1 mt-4 text-xs uppercase tracking-wider font-bold">Hours Per Week</label>
          <div className="inline-flex py-1.5 px-4 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-sm font-semibold">
            5 hours/week (fixed)
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
          <button type="submit" disabled={loading} className={`btn flex-1 py-3 text-[15px] ${editItem ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 shadow-md' : 'btn-primary shadow-indigo-600/30 shadow-md'}`}>
            {loading ? "Saving..." : editItem ? "Update Subject" : "Add Subject"}
          </button>
          {editItem && <button type="button" onClick={resetForm} className="btn py-3 px-6 bg-slate-100 text-slate-600 border-0 hover:bg-slate-200">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
