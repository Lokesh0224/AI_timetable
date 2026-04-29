import React from 'react';
import { Pencil, Trash2, Layers } from 'lucide-react';
import { subjectsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

export default function SubjectTable({ subjectList, onRefresh, onEdit }) {
  const { refreshStats } = useAppContext();

  const handleDelete = async (subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      try {
        await subjectsAPI.delete(subject._id);
        toast.success("Subject deleted");
        onRefresh();
        refreshStats();
      } catch (e) {}
    }
  };

  if (subjectList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white bg-opacity-50 h-[400px]">
        <h3 className="text-xl font-bold text-slate-700 mb-1 tracking-tight">No subjects added yet.</h3>
        <p className="text-slate-500 font-medium">Fill the form to assign subjects mapping to the academic tree.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border md:border-transparent border-slate-200 shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
      <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
          <tr>
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Code</th>
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Subject Name</th>
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Faculty</th>
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Scope</th>
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {subjectList.map(sub => (
            <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors group">
              <td className="px-6 py-4 font-mono font-bold text-slate-600 bg-slate-50/30">{sub.code}</td>
              <td className="px-6 py-4 font-semibold text-slate-900">{sub.name}</td>
              <td className="px-6 py-4 font-medium text-slate-600">{sub.facultyId?.name || <span className="text-amber-500 italic">Unassigned</span>}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1 text-[11px] font-bold">
                   <span className="text-slate-500">{sub.departmentId?.code} / {sub.programId?.name}</span>
                   <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm w-max border border-indigo-100">Yr {sub.year} • Sec {sub.sectionId?.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right align-middle">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(sub)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100" title="Edit"><Pencil className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(sub)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
