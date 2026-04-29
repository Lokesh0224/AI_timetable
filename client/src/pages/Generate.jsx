import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Wand2, CheckCircle, AlertTriangle, ChevronRight, Download } from 'lucide-react';
import { timetableAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const LOGS = [
  "Initializing scheduler algorithms...",
  "Loading faculty availability and constraints...",
  "Loading subject hours and year assignments...",
  "Loading room capacities and definitions...",
  "Sorting subjects by constraint priority...",
  "Checking for existing potential conflicts...",
  "Validating soft and hard constraints...",
];

export default function Generate() {
  const { stats, refreshStats } = useAppContext();
  const navigate = useNavigate();
  
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState([]);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  const missingItem = 
    stats.facultyCount === 0 ? "Faculty" :
    stats.subjectCount === 0 ? "Subjects" :
    stats.roomCount === 0 ? "Rooms" : null;

  const handleGenerate = async () => {
    setGenerating(true);
    setLogs([]);
    setCompleted(false);

    try {
      // simulate artificial logs streaming
      for (let i = 0; i < LOGS.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 350));
        setLogs(prev => [...prev, LOGS[i]]);
      }
      
      const res = await timetableAPI.generate();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(prev => [...prev, `Timetable generated successfully — ${res.scheduled} sessions scheduled`]);
      setWarnings(res.warnings || []);
      
      const tableRes = await timetableAPI.getTimetable();
      setPreview(tableRes.slice(0, 10)); // first 10
      setResults(res);
      
      setTimeout(() => setCompleted(true), 400);
      refreshStats();

    } catch (e) {
      setGenerating(false);
      setLogs(prev => [...prev, "ERROR: " + (e.response?.data?.message || e.message)]);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const coverage = stats.totalSessionsNeeded > 0 
    ? Math.min(100, Math.round((stats.totalAvailableSlots / stats.totalSessionsNeeded) * 100)) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Section 1: Pre-generation summary */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="card p-10 mb-10 relative overflow-hidden ring-1 ring-slate-900/5"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
        <h2 className="text-2xl tracking-tight font-extrabold text-slate-800 mb-8 relative z-10">Pre-Generation Summary</h2>
        
        <div className="space-y-5 relative z-10 text-slate-700 font-medium text-lg">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <CheckCircle className={`w-7 h-7 ${stats.facultyCount > 0 ? 'text-green-500' : 'text-slate-300'}`} />
            <span><span className="font-extrabold text-slate-900 text-xl">{stats.facultyCount}</span> Faculty members loaded</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <CheckCircle className={`w-7 h-7 ${stats.subjectCount > 0 ? 'text-green-500' : 'text-slate-300'}`} />
            <span><span className="font-extrabold text-slate-900 text-xl">{stats.subjectCount}</span> Subjects mapped and loaded</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <CheckCircle className={`w-7 h-7 ${stats.roomCount > 0 ? 'text-green-500' : 'text-slate-300'}`} />
            <span><span className="font-extrabold text-slate-900 text-xl">{stats.roomCount}</span> Rooms instantiated</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-4 border-t border-slate-100 pt-5 mt-2">
            <CheckCircle className="w-7 h-7 text-indigo-500" />
            <span>Total sessions needed: <span className="font-extrabold text-slate-900 text-xl bg-indigo-50 px-2 py-1 rounded-lg ml-1">{stats.totalSessionsNeeded} hrs</span></span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <CheckCircle className="w-7 h-7 text-indigo-500" />
            <span>Total available slots: <span className="font-extrabold text-slate-900 text-xl bg-indigo-50 px-2 py-1 rounded-lg ml-1">{stats.totalAvailableSlots} hrs</span></span>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-4 font-bold pt-4">
             <CheckCircle className={`w-7 h-7 ${stats.readyToGenerate ? 'text-green-500' : 'text-red-500'}`} />
             <span>Coverage estimate: <span className={`text-xl ${stats.readyToGenerate ? 'text-green-600' : 'text-red-600'}`}>{coverage}%</span> — {stats.readyToGenerate ? <span className="text-green-600 ml-1">Ready</span> : <span className="text-red-600 ml-1">Missing Constraints</span>}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Section 2: Action */}
      <div className="mb-12">
        {missingItem ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-8 h-8 mt-0.5 text-red-600" />
            <div>
              <h3 className="font-bold text-xl tracking-tight mb-1">Cannot Generate Array</h3>
              <p className="font-medium text-red-700">Missing {missingItem} dataset. Please go back and add the prerequisite data.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {!completed && (
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className={`group relative inline-flex items-center justify-center px-10 py-6 text-xl font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none overflow-hidden shadow-xl shadow-indigo-600/40 w-full max-w-md ${generating ? 'opacity-90 scale-[0.98]' : 'hover:scale-[1.02]'}`}
              >
                {!generating && <div className="absolute inset-0 w-full h-full border-[3px] border-indigo-400 rounded-full animate-ping opacity-40"></div>}
                
                {generating ? (
                  <><div className="w-6 h-6 animate-spin rounded-full border-4 border-white border-t-white/30 mr-3"></div> Initializing...</>
                ) : (
                  <><Wand2 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" /> Generate Timetable</>
                )}
              </button>
            )}
            
            {completed && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center bg-emerald-500 text-white px-10 py-6 text-xl font-bold rounded-full w-full max-w-md shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                Generated Successfully
              </motion.div>
            )}
            
            {(generating || logs.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="w-full mt-10 origin-top"
              >
                <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm leading-relaxed overflow-hidden relative shadow-2xl border border-slate-800 ring-4 ring-slate-900/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-500 ml-2 text-xs font-bold font-sans">SCHEDULER TERMINAL</span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {logs.map((log, idx) => {
                      const isDone = idx < logs.length - 1 || completed;
                      const isError = log.startsWith("ERROR");
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 ${isError ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-indigo-300'}`}
                        >
                          <span className="shrink-0 font-bold opacity-80">
                            {isError ? "[x]" : isDone ? "[✓]" : <span className="animate-pulse inline-block">[●]</span>}
                          </span>
                          <span className="font-medium tracking-wide">{log}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <div className="h-2 w-full bg-slate-800 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      className={`h-full relative ${completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      initial={{ width: "2%" }}
                      animate={{ width: `${Math.min(100, (logs.length / (LOGS.length + 1)) * 100)}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-8 blur-md -skew-x-[30deg] animate-[shimmer_1s_infinite]"></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl flex items-center shadow-lg shadow-emerald-100/50">
              <div className="bg-emerald-100 p-3 rounded-xl mr-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-2xl tracking-tight mb-1 text-emerald-900">Timetable ready!</h3>
                <p className="font-medium text-emerald-700 text-lg">{results?.scheduled} sessions successfully mapped across 5 days for all years.</p>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-lg flex items-center text-amber-900 mb-4"><AlertTriangle className="w-6 h-6 mr-3 text-amber-600" /> Scheduling Warnings</h3>
                <ul className="space-y-3 font-medium bg-amber-100/50 p-4 rounded-xl border border-amber-200/50">
                  {warnings.map((w, i) => <li key={i} className="flex gap-2"><span className="text-amber-500">•</span> {w}</li>)}
                </ul>
              </div>
            )}

            {results?.priorityReport && (
              <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
                <div className="p-6 border-b border-slate-100 bg-slate-50/80">
                  <h3 className="font-extrabold text-lg text-slate-800 tracking-tight mb-2">Priority Usage Report</h3>
                  <p className="text-sm text-slate-500 font-medium">Breakdown of priority slots used per subject scheduling logic.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Subject (Faculty)</th>
                        <th className="px-6 py-4 text-center text-green-700">P1</th>
                        <th className="px-6 py-4 text-center text-amber-700">P2</th>
                        <th className="px-6 py-4 text-center text-orange-700">P3</th>
                        <th className="px-6 py-4 text-center font-extrabold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.priorityReport.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-semibold text-slate-800">
                            {row.subjectName} <span className="text-slate-500 font-normal">({row.facultyName})</span>
                          </td>
                          <td className="px-6 py-3 text-center font-mono font-bold text-green-600">{row.p1 || '-'}</td>
                          <td className="px-6 py-3 text-center font-mono font-bold text-amber-500">{row.p2 || '-'}</td>
                          <td className="px-6 py-3 text-center font-mono font-bold text-orange-500">{row.p3 || '-'}</td>
                          <td className="px-6 py-3 text-center font-bold text-slate-900">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-900/5">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">Data Preview</h3>
                <button onClick={() => navigate('/timetable')} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                  View Weekly Grid <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-slate-100 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4 text-center">Day</th>
                      <th className="px-6 py-4 text-center">Time</th>
                      <th className="px-6 py-4 text-center">Year</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Faculty</th>
                      <th className="px-6 py-4 text-right">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 text-center font-bold text-slate-700">{row.day.substring(0,3)}</td>
                        <td className="px-6 py-3.5 text-center font-black text-indigo-600"><span className="bg-indigo-50 px-2 py-1 rounded-md">{row.timeSlot}</span></td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block shadow-sm ${row.year===1?'bg-blue-100 text-blue-800 ring-1 ring-blue-200':row.year===2?'bg-green-100 text-green-800 ring-1 ring-green-200':row.year===3?'bg-amber-100 text-amber-800 ring-1 ring-amber-200':'bg-purple-100 text-purple-800 ring-1 ring-purple-200'}`}>
                            Y{row.year}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-800 tracking-tight">{row.subjectId?.name}</td>
                        <td className="px-6 py-3.5 text-slate-600 font-semibold">{row.facultyId?.name}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-[11px] font-bold text-slate-500 uppercase">{row.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 mt-auto">
                <button onClick={() => navigate('/timetable')} className="btn flex-1 py-4 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold transition-all">Go to Full Timetable View</button>
                <a href="http://localhost:5000/api/timetable/export/csv" target="_blank" rel="noreferrer" className="btn px-8 border-slate-300 font-bold text-slate-700 bg-white hover:bg-slate-100 flex items-center shadow-sm">
                  <Download className="w-5 h-5 mr-3 text-slate-400" />
                  <span className="mt-0.5">Export CSV</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
