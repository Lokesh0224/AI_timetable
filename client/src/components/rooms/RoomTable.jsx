import React from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { roomsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

export default function RoomTable({ roomList, onRefresh, onEdit }) {
  const { refreshStats } = useAppContext();

  const handleDelete = async (room) => {
    if (window.confirm(`Delete ${room.name}?`)) {
      try {
        await roomsAPI.delete(room._id);
        toast.success("Room deleted");
        onRefresh();
        refreshStats();
      } catch (e) {}
    }
  };

  if (roomList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white bg-opacity-50 mt-4">
        <h3 className="text-xl font-bold text-slate-700 mb-1 tracking-tight">No rooms added</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-12">
      {roomList.map(room => (
        <div key={room._id} className="bg-white border border-slate-200 p-6 rounded-[1.25rem] shadow-sm hover:shadow-xl transition-all duration-300 relative group ring-1 ring-slate-900/5 hover:-translate-y-1">
          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(room)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100" title="Edit"><Pencil className="w-4 h-4"/></button>
            <button onClick={() => handleDelete(room)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4"/></button>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-2 pr-12">{room.name}</h3>
          <div className="flex items-center gap-2 mt-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-slate-500 font-medium text-sm">Capacity: <span className="text-slate-900 font-bold ml-1 text-base">{room.capacity}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}
