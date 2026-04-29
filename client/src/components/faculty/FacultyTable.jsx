import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { facultyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

export default function FacultyTable({ facultyList, onRefresh, onEdit }) {
  const { refreshStats } = useAppContext();

  const handleDelete = async (faculty) => {
    if (window.confirm(`Are you sure you want to delete ${faculty.name}? This cannot be undone.`)) {
      try {
        await facultyAPI.delete(faculty._id);
        toast.success('Faculty deleted successfully');
        onRefresh();
        refreshStats();
      } catch (e) { }
    }
  };

  const countTotalSlots = (slotsMap) => {
    if (!slotsMap) return 0;
    return Object.values(slotsMap).reduce((acc, slots) => acc + slots.length, 0);
  };

  if (facultyList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white bg-opacity-50">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-800">No faculty added yet</h3>
        <p className="text-slate-500 mt-2 max-w-sm font-medium">Use the form to add your first faculty member and define their availability.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-bold text-xs tracking-wider uppercase">Name / Dept</th>
              <th className="px-6 py-4 font-bold text-xs tracking-wider uppercase">Available Days</th>
              <th className="px-6 py-4 font-bold text-xs tracking-wider uppercase text-center">Total Slots</th>
              <th className="px-6 py-4 font-bold text-xs tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facultyList.map((faculty) => (
              <tr key={faculty._id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{faculty.name}</div>
                  <div className="text-slate-500 text-xs mt-1">{faculty.department} &bull; {faculty.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 w-48">
                    {faculty.availableDays.map(day => (
                      <span key={day} className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-100">
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm shadow-emerald-100/50">
                    {countTotalSlots(faculty.availableSlots)} slots
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(faculty)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(faculty)}
                      className="p-2.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
