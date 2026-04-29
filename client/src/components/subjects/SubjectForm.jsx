import React, { useState, useEffect } from 'react';
import { subjectsAPI, facultyAPI, departmentsAPI, programsAPI, sectionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SubjectForm({ onRefresh, editItem, setEditItem }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [programId, setProgramId] = useState('');
  const [year, setYear] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const [fac, dep, prog, sec] = await Promise.all([
        facultyAPI.getAll(),
        departmentsAPI.getAll(),
        programsAPI.getAll(),
        sectionsAPI.getAll()
      ]);
      setFacultyList(fac); setDepartments(dep); setPrograms(prog); setSections(sec);
    } catch (e) { }
  };

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCode(editItem.code.split('-')[0] || editItem.code); // strip bulk suffix if matched
      setFacultyId(editItem.facultyId?._id || editItem.facultyId);
      setDepartmentId(editItem.departmentId?._id || editItem.departmentId);
      setProgramId(editItem.programId?._id || editItem.programId);
      setYear(editItem.year);
      setSelectedSections([editItem.sectionId?._id || editItem.sectionId]);
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setName(''); setCode(''); setFacultyId(''); setDepartmentId(''); setProgramId(''); setYear(''); setSelectedSections([]);
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facultyId || !departmentId || !programId || !year || selectedSections.length === 0) {
      return toast.error("Please fill all required hierarchical fields and select at least one section.");
    }

    try {
      setLoading(true);
      const payload = { 
        name, code, facultyId, departmentId, programId, 
        year: parseInt(year), hoursPerWeek: 5 
      };
      
      if (editItem) {
        payload.sectionId = selectedSections[0];
        await subjectsAPI.update(editItem._id, payload);
        toast.success("Subject updated successfully");
      } else {
        if (selectedSections.length === 1) {
           payload.sectionId = selectedSections[0];
           await subjectsAPI.create(payload);
        } else {
           await subjectsAPI.createBulk({ ...payload, sectionIds: selectedSections });
        }
        toast.success("Subject(s) added successfully");
      }
      resetForm();
      onRefresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (secId) => {
    if (editItem) return; // cannot bulk toggle on edit
    setSelectedSections(prev => 
      prev.includes(secId) ? prev.filter(id => id !== secId) : [...prev, secId]
    );
  };

  const filteredPrograms = programs.filter(p => p.departmentId?._id === departmentId);
  const selectedProg = programs.find(p => p._id === programId);
  const years = selectedProg ? Array.from({length: selectedProg.durationYears}, (_, i) => i + 1) : [1,2,3,4,5];
  const filteredSections = sections.filter(s => s.programId?._id === programId && s.year === parseInt(year));

  return (
    <div className="card p-6 shadow-md border-0 bg-white ring-1 ring-slate-200">
      <h2 className="text-xl tracking-tight font-bold text-slate-800 mb-6 font-sans">
        {editItem ? "Edit Subject" : "Add Subject"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold mb-1 block text-slate-500">Department</label>
          <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-semibold text-slate-700" 
            value={departmentId} onChange={e => {setDepartmentId(e.target.value); setProgramId(''); setYear(''); setSelectedSections([]);}}>
            <option value="" disabled>Select Dept</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
             <label className="label text-xs uppercase tracking-wider font-bold mb-1 block text-slate-500">Program</label>
             <select required disabled={!departmentId} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-semibold text-slate-700 disabled:opacity-50" 
               value={programId} onChange={e => {setProgramId(e.target.value); setYear(''); setSelectedSections([]);}}>
               <option value="" disabled>Select Prog</option>
               {filteredPrograms.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
             </select>
          </div>
          <div className="w-24">
             <label className="label text-xs uppercase tracking-wider font-bold mb-1 block text-slate-500">Year</label>
             <select required disabled={!programId} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-indigo-700 disabled:opacity-50" 
               value={year} onChange={e => {setYear(e.target.value); setSelectedSections([]);}}>
               <option value="" disabled>Yr</option>
               {years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>
        </div>

        {programId && year && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner mt-2 mb-4">
             <label className="label text-xs uppercase tracking-wider font-bold block text-slate-500 mb-2">Assign to Sections:</label>
             {filteredSections.length === 0 ? <p className="text-xs font-semibold text-red-500">No sections found for this year.</p> : (
               <div className="flex flex-wrap gap-2">
                 {filteredSections.map(sec => (
                   <label key={sec._id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition-all ${selectedSections.includes(sec._id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                     <input type="checkbox" checked={selectedSections.includes(sec._id)} onChange={() => handleSectionToggle(sec._id)} disabled={editItem && !selectedSections.includes(sec._id)} className="hidden" />
                     {sec.name}
                   </label>
                 ))}
               </div>
             )}
          </div>
        )}

        <hr className="border-slate-100 my-4" />

        <div>
          <label className="label text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">Subject Name</label>
          <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-semibold" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">Subject Code</label>
          <input type="text" required placeholder="e.g. CS101" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold font-mono" value={code} onChange={e => setCode(e.target.value)} />
          {selectedSections.length > 1 && <span className="text-[10px] text-slate-400 font-medium block mt-1">Codes will be appended with section (e.g. CS101-A)</span>}
        </div>
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">Assigned Faculty</label>
          <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-semibold text-slate-700" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
            <option value="" disabled>Select Faculty</option>
            {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
          <button type="submit" disabled={loading} className={`flex-1 py-3 font-bold rounded-xl text-[14px] transition-all ${editItem ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 shadow-md' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 shadow-md'}`}>
            {loading ? "Saving..." : editItem ? "Update Subject" : "Add Subject"}
          </button>
          {editItem && <button type="button" onClick={resetForm} className="py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
