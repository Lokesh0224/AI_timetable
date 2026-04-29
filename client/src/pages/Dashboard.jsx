import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, BookOpen, DoorClosed, CheckCircle2, Wand2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StepIndicator from '../components/shared/StepIndicator';
import StatCard from '../components/shared/StatCard';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { stats, refreshStats } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const getMissingStep = () => {
    if (stats.facultyCount === 0) return { name: 'Faculty', path: '/faculty' };
    if (stats.subjectCount === 0) return { name: 'Subjects', path: '/subjects' };
    if (stats.roomCount === 0) return { name: 'Rooms', path: '/rooms' };
    return null;
  };

  const missing = getMissingStep();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8"
    >
      <div className="mb-14 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 font-sans tracking-tight">Generate Timetables Effortlessly</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Follow the steps below to gather data and generate a clash-free schedule based on faculty availability and credit requirements.</p>
      </div>

      <StepIndicator stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Faculty Added" 
          count={stats.facultyCount} 
          icon={Users} 
          link="/faculty"
          emptyText="Add Faculty"
        />
        <StatCard 
          title="Subjects Added" 
          count={stats.subjectCount} 
          icon={BookOpen} 
          link="/subjects"
          emptyText="Add Subjects"
        />
        <StatCard 
          title="Rooms Added" 
          count={stats.roomCount} 
          icon={DoorClosed} 
          link="/rooms"
          emptyText="Add Rooms"
        />
        <StatCard 
          title="Ready status" 
          count={stats.readyToGenerate ? "YES" : "NO"} 
          isReady={stats.readyToGenerate}
          icon={CheckCircle2} 
        />
      </div>

      <div className="flex justify-center mt-12 pb-12">
        {stats.readyToGenerate ? (
          <button 
            onClick={() => navigate('/generate')}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 overflow-hidden shadow-xl shadow-indigo-600/30"
          >
            <div className="absolute inset-0 w-full h-full border-[3px] border-indigo-400 rounded-full animate-ping opacity-30"></div>
            <Wand2 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
            Generate Timetable Now
          </button>
        ) : missing ? (
          <div className="text-center p-8 bg-amber-50 rounded-2xl border border-amber-200/60 max-w-md w-full shadow-sm">
            <h3 className="text-xl font-bold text-amber-900 mb-2 tracking-tight">Almost there</h3>
            <p className="text-amber-700 mb-6 font-medium">You need to complete the <b>{missing.name}</b> step before generating the timetable.</p>
            <Link to={missing.path} className="btn w-full bg-amber-600 text-white hover:bg-amber-700 shadow-sm py-3 text-base">
              Go Add {missing.name} <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
