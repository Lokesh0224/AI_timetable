import React, { useState, useEffect, useMemo } from 'react';
import { timetableAPI, facultyAPI } from '../services/api';
import { Download, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const SLOTS = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM'];

export default function ViewTimetable() {
  const [data, setData] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewType, setViewType] = useState('grid');
  const [yearFilter, setYearFilter] = useState('All');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableRes, facRes] = await Promise.all([
        timetableAPI.getTimetable(),
        facultyAPI.getAll()
      ]);
      setData(tableRes);
      setFacultyList(facRes);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (yearFilter !== 'All' && item.year !== parseInt(yearFilter)) return false;
      if (facultyFilter !== 'All' && item.facultyId?._id !== facultyFilter) return false;
      if (dayFilter !== 'All' && item.day !== dayFilter) return false;
      return true;
    });
  }, [data, yearFilter, facultyFilter, dayFilter]);

  const clearFilters = () => {
    setYearFilter('All'); setFacultyFilter('All'); setDayFilter('All');
  };

  const getYearColor = (year) => {
    const cols = {
      1: "bg-blue-100 border-blue-400 text-blue-900 border-l-blue-500",
      2: "bg-green-100 border-green-400 text-green-900 border-l-green-500",
      3: "bg-amber-100 border-amber-400 text-amber-900 border-l-amber-500",
      4: "bg-purple-100 border-purple-400 text-purple-900 border-l-purple-500"
    };
    return cols[year] || "bg-slate-100 border-slate-300 text-slate-800 border-l-slate-500";
  };

  const renderTable = () => (
    <div className="bg-white border md:border-transparent border-slate-200 shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-widest">
            <tr>
              <th className="px-6 py-5">Day</th>
              <th className="px-6 py-5">Time Slot</th>
              <th className="px-6 py-5">Year</th>
              <th className="px-6 py-5">Subject</th>
              <th className="px-6 py-5">Code</th>
              <th className="px-6 py-5">Faculty</th>
              <th className="px-6 py-5 text-right">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map(row => (
              <tr key={row._id} className={`hover:bg-slate-50/70 transition-colors ${row.hasConflict ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4 font-bold text-slate-700">{row.day.substring(0,3)}</td>
                <td className="px-6 py-4 font-black text-indigo-600"><span className="bg-indigo-50 px-2 py-1 rounded-md">{row.timeSlot}</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${getYearColor(row.year).split(" ").filter(c=>c.startsWith("bg-")||c.startsWith("text-")).join(" ")} ring-1 ring-black/5`}>
                    Y{row.year}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">{row.subjectId?.name}</td>
                <td className="px-6 py-4 font-mono font-bold text-slate-400 text-[11px] uppercase tracking-wider">{row.subjectId?.code}</td>
                <td className="px-6 py-4 font-semibold text-slate-600">{row.facultyId?.name}</td>
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

    filteredData.forEach(entry => {
      if (gridMap[entry.day] && gridMap[entry.day][entry.timeSlot]) {
        gridMap[entry.day][entry.timeSlot].push(entry);
      }
    });

    return (
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[1200px] border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 bg-white ring-1 ring-slate-900/5">
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

          {SLOTS.map(slot => (
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
                  return (
                    <div key={`${day}-${slot}`} className="flex-1 border-r border-slate-100 last:border-r-0 p-2.5 bg-white relative hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col gap-2 h-full">
                        {cellEntries.map((c, i) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                            key={c._id} 
                            className={`p-3.5 border-l-4 rounded-r-xl rounded-l-sm shadow-sm flex flex-col h-full ring-1 ring-black/5 hover:shadow-md transition-shadow cursor-default ${getYearColor(c.year)}`}
                          >
                            <div className="font-extrabold text-[13px] leading-tight mb-1" title={c.subjectId?.name}>{c.subjectId?.name}</div>
                            <div className="text-[11px] font-bold opacity-80 truncate mb-auto mt-0.5 tracking-wide">{c.facultyId?.name}</div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                              <span className="font-mono text-[10px] font-bold opacity-70 bg-black/5 px-1.5 py-0.5 rounded uppercase">{c.room}</span>
                              <span className="text-[10px] font-bold bg-white/60 px-1.5 py-0.5 rounded shadow-sm ring-1 ring-black/5">Y{c.year}</span>
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
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
       <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
       <p className="mt-4 font-bold text-slate-500 tracking-wide">Loading Timetable Grid...</p>
    </div>
  );

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="max-w-[1400px] mx-auto h-full flex flex-col pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Timetable Explorer</h1>
          <p className="text-slate-500 font-medium text-lg">Filter, view, and export your generated institutional schedules.</p>
        </div>
        <div className="flex bg-slate-200/70 p-1.5 rounded-xl shadow-inner">
          <button 
            onClick={()=>setViewType('table')} 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewType==='table'?'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5':'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
          >
            <List className="w-4 h-4"/> List View
          </button>
          <button 
            onClick={()=>setViewType('grid')} 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewType==='grid'?'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5':'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
          >
            <LayoutGrid className="w-4 h-4"/> Weekly Grid
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-wrap items-center gap-6 ring-1 ring-slate-900/5">
        
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Year Filter:</span>
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200/70">
            {['All', '1', '2', '3', '4'].map(y => (
              <button key={y} onClick={()=>setYearFilter(y)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${yearFilter===y?'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200':'text-slate-500 hover:bg-slate-200/50'}`}>
                {y === 'All' ? 'All' : `Y${y}`}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Day:</span>
          <select value={dayFilter} onChange={e=>setDayFilter(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 ring-indigo-500 outline-none font-bold text-slate-700 cursor-pointer shadow-inner">
            <option value="All">All Days</option>
            {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Faculty:</span>
          <select value={facultyFilter} onChange={e=>setFacultyFilter(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 ring-indigo-500 outline-none font-bold text-slate-700 max-w-[220px] truncate cursor-pointer shadow-inner">
            <option value="All">All Faculty (Full Overview)</option>
            {facultyList.map(f=><option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>

        <button onClick={clearFilters} className="text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">Clear</button>
        
        <div className="ml-auto">
          <a href="http://localhost:5000/api/timetable/export/csv" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20">
            <Download className="w-4 h-4"/> Export CSV
          </a>
        </div>
      </div>

      {viewType === 'table' ? renderTable() : renderGrid()}
      
    </motion.div>
  );
}
