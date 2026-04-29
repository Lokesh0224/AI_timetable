import React, { useState, useEffect, useMemo } from 'react';
import { timetableAPI, facultyAPI, departmentsAPI, programsAPI, sectionsAPI } from '../services/api';
import { Download, LayoutGrid, List, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const SLOTS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM'];

export default function ViewTimetable() {
  const [data, setData] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewType, setViewType] = useState('grid');
  
  const [deptFilter, setDeptFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [secFilter, setSecFilter] = useState('All');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('All');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [facultyStats, setFacultyStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableRes, facRes, depRes, progRes, secRes] = await Promise.all([
        timetableAPI.getTimetable(),
        facultyAPI.getAll(),
        departmentsAPI.getAll(),
        programsAPI.getAll(),
        sectionsAPI.getAll()
      ]);
      setData(tableRes);
      setFacultyList(facRes);
      setDepartments(depRes);
      setPrograms(progRes);
      setSections(secRes);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const facId = searchParams.get('faculty');
    if (facId && facultyList.some(f => f._id === facId)) {
      setFacultyFilter(facId);
    }
  }, [searchParams, facultyList]);

  useEffect(() => {
    if (facultyFilter !== 'All') {
      searchParams.set('faculty', facultyFilter);
      setSearchParams(searchParams, { replace: true });
      axios.get(`http://localhost:5000/api/timetable/faculty/${facultyFilter}`)
        .then(res => setFacultyStats(res.data.summary))
        .catch(err => console.error(err));
    } else {
      searchParams.delete('faculty');
      setSearchParams(searchParams, { replace: true });
      setFacultyStats(null);
    }
  }, [facultyFilter, searchParams, setSearchParams]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (deptFilter !== 'All' && item.departmentId?._id !== deptFilter) return false;
      if (progFilter !== 'All' && item.programId?._id !== progFilter) return false;
      if (yearFilter !== 'All' && item.year !== parseInt(yearFilter)) return false;
      if (secFilter !== 'All' && item.sectionId?._id !== secFilter) return false;
      if (facultyFilter !== 'All' && item.facultyId?._id !== facultyFilter) return false;
      if (dayFilter !== 'All' && item.day !== dayFilter) return false;
      return true;
    });
  }, [data, deptFilter, progFilter, yearFilter, secFilter, facultyFilter, dayFilter]);

  const clearFilters = () => {
    setDeptFilter('All'); setProgFilter('All'); setYearFilter('All'); setSecFilter('All'); setFacultyFilter('All'); setDayFilter('All');
  };

  const getYearColor = (year) => {
    const cols = {
      1: "bg-blue-100 border-blue-400 text-blue-900 border-l-blue-500",
      2: "bg-green-100 border-green-400 text-green-900 border-l-green-500",
      3: "bg-amber-100 border-amber-400 text-amber-900 border-l-amber-500",
      4: "bg-purple-100 border-purple-400 text-purple-900 border-l-purple-500",
      5: "bg-rose-100 border-rose-400 text-rose-900 border-l-rose-500"
    };
    return cols[year] || "bg-slate-100 border-slate-300 text-slate-800 border-l-slate-500";
  };

  const selectedFacultyObj = facultyFilter !== 'All' ? facultyList.find(f => f._id === facultyFilter) : null;
  const filteredPrograms = programs.filter(p => p.departmentId?._id === deptFilter);
  const selectedProg = programs.find(p => p._id === progFilter);
  const years = selectedProg ? Array.from({length: selectedProg.durationYears}, (_, i) => i + 1) : [1,2,3,4,5];
  const filteredSections = sections.filter(s => s.programId?._id === progFilter && s.year === parseInt(yearFilter));

  const renderTable = () => (
    <div className="bg-white border text-left border-slate-200 shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
      {selectedFacultyObj && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-indigo-900 tracking-tight">Showing schedule for <span className="font-black">{selectedFacultyObj.name}</span> — {filteredData.length} sessions</h3>
          <button onClick={() => setFacultyFilter('All')} className="ml-auto text-sm text-indigo-600 bg-white px-3 py-1 font-semibold rounded shadow-sm hover:bg-slate-50 border border-indigo-200">Clear Faculty View</button>
        </div>
      )}
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-widest">
            <tr>
              <th className="px-6 py-5">Day</th>
              <th className="px-6 py-5">Time</th>
              <th className="px-6 py-5">Scope</th>
              <th className="px-6 py-5">Subject</th>
              {!selectedFacultyObj && <th className="px-6 py-5">Faculty</th>}
              <th className="px-6 py-5 text-right">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map(row => (
              <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{row.day.substring(0,3)}</td>
                <td className="px-6 py-4 font-black text-indigo-600"><span className="bg-indigo-50 px-2 py-1 rounded-md">{row.timeSlot}</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-[11px] font-bold">
                     <span className="text-slate-500">{row.departmentId?.code} / {row.programId?.name}</span>
                     <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm border border-indigo-100 w-max">
                       Yr {row.year} • Sec {row.sectionId?.name}
                     </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">
                  <div className="flex flex-col">
                    <span>{row.subjectId?.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">{row.subjectId?.code}</span>
                  </div>
                </td>
                {!selectedFacultyObj && <td className="px-6 py-4 font-semibold text-slate-600">{row.facultyId?.name}</td>}
                <td className="px-6 py-4 font-mono text-xs font-bold text-right text-slate-500">{row.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-16 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <List className="w-8 h-8 text-slate-400" />
             </div>
             <p className="font-bold text-slate-500 text-lg">No classes found matching filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGrid = () => {
    const gridMap = {};
    DAYS.forEach(d => {
      gridMap[d] = {};
      SLOTS.forEach(s => gridMap[d][s] = []);
    });

    // If filtering by specific section, we isolate grid. Same for specific faculty.
    const isIsolated = selectedFacultyObj || secFilter !== 'All';
    const dataToMap = isIsolated ? filteredData : data.filter(item => {
      // General broad filter matching everything except section/faculty isolate bounds
      if (deptFilter !== 'All' && item.departmentId?._id !== deptFilter) return false;
      if (progFilter !== 'All' && item.programId?._id !== progFilter) return false;
      if (yearFilter !== 'All' && item.year !== parseInt(yearFilter)) return false;
      if (dayFilter !== 'All' && item.day !== dayFilter) return false;
      return true;
    });

    dataToMap.forEach(entry => {
      if (gridMap[entry.day] && gridMap[entry.day][entry.timeSlot]) {
        gridMap[entry.day][entry.timeSlot].push(entry);
      }
    });

    // Compute dynamic scope header label
    let scopeHeading = "";
    if (secFilter !== 'All') {
      const s = sections.find(x => x._id === secFilter);
      scopeHeading = s ? `${s.departmentId?.code} / ${s.programId?.name} / Year ${s.year} / Section ${s.name}` : "";
    }

    return (
      <motion.div key={isIsolated ? "iso" : "all"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto pb-6">
        <div className="min-w-[1200px] border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 bg-white ring-1 ring-slate-900/5">
          
          {selectedFacultyObj && (
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white p-5 flex justify-between items-center shadow-inner">
               <div>
                 <h2 className="text-xl font-bold tracking-tight">{selectedFacultyObj.name} — Personal Weekly Schedule</h2>
                 <p className="text-indigo-200 text-sm font-semibold opacity-90 mt-0.5">Department: {selectedFacultyObj.departmentId?.code || 'N/A'}</p>
               </div>
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                 <span className="font-black text-lg">{filteredData.length}</span> <span className="text-sm font-medium opacity-80">classes this week</span>
               </div>
            </div>
          )}

          {secFilter !== 'All' && !selectedFacultyObj && scopeHeading && (
            <div className="bg-slate-100 border-b border-slate-200 p-5 flex justify-between items-center">
               <div>
                 <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Timetable — {scopeHeading}</h2>
               </div>
               <div className="bg-white shadow-sm px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                 <span className="font-black text-lg text-indigo-600">{filteredData.length}</span> <span className="text-sm font-bold opacity-80">sessions this week</span>
               </div>
            </div>
          )}

          <div className="flex bg-slate-50 border-b border-slate-200">
            <div className="w-24 shrink-0 border-r border-slate-200 p-4 bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 uppercase tracking-widest shadow-inner">
              Time
            </div>
            {DAYS.map(day => (
              <div key={day} className="flex-1 border-r border-slate-200 last:border-r-0 p-4 block text-center font-extrabold text-slate-700 uppercase text-[11px] tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {filteredData.length === 0 && isIsolated ? (
            <div className="p-20 text-center flex flex-col items-center bg-slate-50 min-h-[300px] justify-center">
               <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
               <p className="text-slate-500 font-bold text-lg">No sessions mapped for this filter.</p>
               <p className="text-slate-400 font-medium">Please check generator output parameters.</p>
            </div>
          ) : SLOTS.map(slot => (
            <div key={slot} className="flex border-b border-slate-100 last:border-b-0 min-h-[110px]">
              <div className="w-24 shrink-0 border-r border-slate-200 bg-slate-50/80 flex items-center justify-center p-3">
                <span className="font-black text-[13px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{slot}</span>
              </div>
              
              {slot === '1PM' ? (
                <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200/50"></div>
                  <span className="font-black text-slate-500 tracking-[0.3em] uppercase flex items-center gap-3 relative z-10 text-sm">
                    <span className="text-2xl drop-shadow-sm">🍽️</span> Lunch Break
                  </span>
                </div>
              ) : (
                DAYS.map(day => {
                  const cellEntries = gridMap[day][slot];
                  const isEmpty = cellEntries.length === 0;
                  return (
                    <div key={`${day}-${slot}`} className={`flex-1 border-r border-slate-100 last:border-r-0 p-2.5 relative transition-colors group ${isEmpty ? (isIsolated ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50') : 'bg-white hover:bg-slate-50'}`}>
                      <div className="flex flex-col gap-2 h-full">
                        {cellEntries.map((c, i) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            key={c._id} 
                            className={`p-3.5 border-l-4 rounded-r-xl rounded-l-sm shadow-sm flex flex-col h-full ring-1 ring-black/5 hover:shadow-md transition-shadow cursor-default ${getYearColor(c.year)}`}
                          >
                            <div className="font-extrabold text-[13px] leading-tight mb-1" title={c.subjectId?.name}>{c.subjectId?.name}</div>
                            {!selectedFacultyObj && <div className="text-[11px] font-bold opacity-80 truncate tracking-wide">{c.facultyId?.name}</div>}
                            <div className="font-mono text-[10px] font-bold opacity-70 uppercase my-1">{c.room}</div>
                            
                            {/* Academic Scope Badges */}
                            <div className={`flex flex-wrap gap-1 mt-auto pt-2 border-t border-black/5`}>
                              <span className="text-[9px] font-black bg-white/60 px-1.5 py-0.5 rounded shadow-sm text-slate-700">[{c.departmentId?.code}]</span>
                              <span className="text-[9px] font-black bg-white/60 px-1.5 py-0.5 rounded shadow-sm text-slate-700">[{c.programId?.name}]</span>
                              <span className="text-[9px] font-black bg-white/60 px-1.5 py-0.5 rounded shadow-sm text-slate-700">[{c.year}{c.sectionId?.name}]</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
        
        {selectedFacultyObj && facultyStats && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 ring-1 ring-slate-900/5">
             <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl">{selectedFacultyObj.name.charAt(0)}</div>
                <div>
                   <h3 className="font-black text-xl text-slate-800">{selectedFacultyObj.name}</h3>
                   <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{selectedFacultyObj.departmentId?.code || 'Faculty Member'}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-bold">Total classes this week:</span>
                  <span className="font-black text-slate-800 text-base">{facultyStats.totalClasses}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-bold">Busiest day:</span>
                  <span className="font-bold text-slate-800">{facultyStats.busiestDay}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-bold shrink-0">Subjects teaching:</span>
                  <span className="font-bold text-slate-800 text-right">{facultyStats.subjects.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-bold shrink-0">Days active:</span>
                  <span className="font-bold text-slate-800 text-right">{facultyStats.activeDays.join(', ') || 'None'}</span>
                </div>
             </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
       <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
       <p className="mt-4 font-bold text-slate-500 tracking-wide">Loading Timetable Grid...</p>
    </div>
  );

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="max-w-[1600px] mx-auto h-full flex flex-col pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Timetable Explorer
          </h1>
          <p className="text-slate-500 font-medium text-lg">Filter, view, and export your generated institutional schedules.</p>
        </div>
        <div className="flex bg-slate-200/70 p-1.5 rounded-xl shadow-inner">
          <button onClick={()=>setViewType('table')} className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewType==='table'?'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5':'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}>
            <List className="w-4 h-4"/> List View
          </button>
          <button onClick={()=>setViewType('grid')} className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewType==='grid'?'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5':'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}>
            <LayoutGrid className="w-4 h-4"/> Weekly Grid
          </button>
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col gap-4 ring-1 ring-slate-900/5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Department Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</span>
            <select value={deptFilter} onChange={e=>{setDeptFilter(e.target.value); setProgFilter('All'); setYearFilter('All'); setSecFilter('All');}} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 cursor-pointer shadow-inner w-full">
              <option value="All">All Departments</option>
              {departments.map(d=><option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
            </select>
          </div>

          {/* Program Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Program</span>
            <select disabled={deptFilter==='All'} value={progFilter} onChange={e=>{setProgFilter(e.target.value); setYearFilter('All'); setSecFilter('All');}} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 cursor-pointer shadow-inner w-full disabled:opacity-50">
              <option value="All">All Programs</option>
              {filteredPrograms.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</span>
            <select disabled={progFilter==='All'} value={yearFilter} onChange={e=>{setYearFilter(e.target.value); setSecFilter('All');}} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 cursor-pointer shadow-inner w-full disabled:opacity-50">
              <option value="All">All Years</option>
              {years.map(y=><option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section</span>
            <select disabled={yearFilter==='All'} value={secFilter} onChange={e=>setSecFilter(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 cursor-pointer shadow-inner w-full disabled:opacity-50">
              <option value="All">All Sections</option>
              {filteredSections.map(s=><option key={s._id} value={s._id}>Section {s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-1"></div>

        <div className="flex flex-col md:flex-row items-end flex-wrap gap-4 w-full">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty Filter</span>
            <select value={facultyFilter} onChange={e=>setFacultyFilter(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 md:w-[220px] truncate cursor-pointer shadow-inner w-full">
              <option value="All">All Faculty (Full Overview)</option>
              {facultyList.map(f=><option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-auto md:ml-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Day View</span>
            <select value={dayFilter} onChange={e=>setDayFilter(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-700 cursor-pointer shadow-inner w-full">
              <option value="All">All Days</option>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button onClick={clearFilters} className="text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 h-10 rounded-lg transition-colors ml-auto">Clear All Filters</button>
          
          <a 
            href={facultyFilter === 'All' ? "http://localhost:5000/api/timetable/export/csv" : `http://localhost:5000/api/timetable/export/faculty/${facultyFilter}`} 
            target="_blank" rel="noreferrer" 
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 px-5 py-2 h-10 rounded-lg font-bold text-sm transition-all shadow-md shadow-emerald-500/20 w-full md:w-auto"
          >
            <Download className="w-4 h-4"/> 
            {selectedFacultyObj ? `Export Schedule` : `Export CSV`}
          </a>
        </div>

      </div>

      {viewType === 'table' ? renderTable() : renderGrid()}
      
    </motion.div>
  );
}
