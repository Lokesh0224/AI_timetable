import React, { useState, useEffect } from 'react';
import SubjectForm from '../components/subjects/SubjectForm';
import SubjectTable from '../components/subjects/SubjectTable';
import { subjectsAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

export default function Subjects() {
  const [subjectList, setSubjectList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const { refreshStats } = useAppContext();

  const fetchSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjectList(data);
      refreshStats();
    } catch (error) { }
  };

  useEffect(() => { fetchSubjects(); }, [refreshStats]);

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Manage Subjects</h1>
        <p className="text-slate-500 text-lg">Add subjects mapped to specific faculty across your year groups.</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start mt-4 flex-1">
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 sticky top-24">
          <SubjectForm onRefresh={fetchSubjects} editItem={editItem} setEditItem={setEditItem} />
        </div>
        <div className="w-full flex-1">
          <SubjectTable subjectList={subjectList} onRefresh={fetchSubjects} onEdit={setEditItem} />
        </div>
      </div>
    </motion.div>
  );
}
