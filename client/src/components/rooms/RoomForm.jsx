import React, { useState, useEffect } from 'react';
import { roomsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function RoomForm({ onRefresh, editItem, setEditItem }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCapacity(editItem.capacity);
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setName('');
    setCapacity('');
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(capacity) < 1) return toast.error("Capacity must be at least 1");

    try {
      setLoading(true);
      const payload = { name, capacity: parseInt(capacity) };
      
      if (editItem) {
        await roomsAPI.update(editItem._id, payload);
        toast.success("Room updated");
      } else {
        await roomsAPI.create(payload);
        toast.success("Room added");
      }
      resetForm();
      onRefresh();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 shadow-lg border-0 bg-white ring-1 ring-slate-200 w-full max-w-lg mx-auto mb-10">
      <h2 className="text-2xl tracking-tight font-bold text-slate-800 mb-6 font-sans">
        {editItem ? "Edit Room" : "Add Room"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold">Room Name</label>
          <input type="text" required placeholder="e.g. Lab-101" className="input bg-slate-50 border-slate-200 focus:bg-white text-lg font-medium py-6" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs uppercase tracking-wider font-bold">Capacity (Seats)</label>
          <input type="number" min="1" required className="input bg-slate-50 border-slate-200 focus:bg-white text-lg font-medium py-6" value={capacity} onChange={e => setCapacity(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-4 mt-2">
          <button type="submit" disabled={loading} className={`btn flex-1 py-4 text-base font-bold tracking-wide ${editItem ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 shadow-lg' : 'btn-primary shadow-indigo-600/30 shadow-lg'}`}>
            {loading ? "Saving..." : editItem ? "Update Room" : "Add Room"}
          </button>
          {editItem && <button type="button" onClick={resetForm} className="btn py-4 px-6 bg-slate-100 text-slate-600 border-0 hover:bg-slate-200 font-bold">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
