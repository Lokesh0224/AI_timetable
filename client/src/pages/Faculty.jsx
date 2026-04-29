import React, { useState, useEffect } from 'react';
import FacultyForm from '../components/faculty/FacultyForm';
import FacultyTable from '../components/faculty/FacultyTable';
import { facultyAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const { refreshStats } = useAppContext();

  const fetchFaculty = async () => {
    try {
      const data = await facultyAPI.getAll();
      setFacultyList(data);
      refreshStats();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [refreshStats]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col max-w-7xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Manage Faculty</h1>
        <p className="text-slate-500 text-lg">Define faculty members and select exactly when they are available to teach.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 items-start mt-4">
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
          <div className="sticky top-24">
            <FacultyForm onRefresh={fetchFaculty} editItem={editItem} setEditItem={setEditItem} />
          </div>
        </div>
        
        <div className="w-full flex-1">
          <FacultyTable facultyList={facultyList} onRefresh={fetchFaculty} onEdit={setEditItem} />
        </div>
      </div>
    </motion.div>
  );
}
