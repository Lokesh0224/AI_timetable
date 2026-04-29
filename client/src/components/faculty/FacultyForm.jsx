import React, { useState, useEffect } from 'react';
import AvailabilityPicker from './AvailabilityPicker';
import { facultyAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function FacultyForm({ onRefresh, editItem, setEditItem }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setEmail(editItem.email);
      setDepartment(editItem.department);
      setAvailability(editItem.availability || []);
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setName(''); setEmail(''); setDepartment('');
    setAvailability([]);
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (availability.length < 5) return toast.error(`This faculty has only ${availability.length} slots set. Minimum 5 needed to fully schedule any subject.`);
    
    try {
      setLoading(true);
      const payload = { name, email, department, availability };
      
      if (editItem) {
        await facultyAPI.update(editItem._id, payload);
        toast.success("Faculty updated successfully");
      } else {
        await facultyAPI.create(payload);
        toast.success("Faculty added successfully");
      }
      resetForm();
      onRefresh();
    } catch (error) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 shadow-md border-0 bg-white ring-1 ring-slate-200">
      <h2 className="text-xl tracking-tight font-bold text-slate-800 mb-6 flex items-center gap-2">
        {editItem ? "Edit Faculty Member" : "Add Faculty Member"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Dr. Priya Sharma" 
            className="input shadow-sm" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input 
            type="email" 
            required 
            placeholder="e.g. priya@college.edu" 
            className="input shadow-sm" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="label">Department</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Computer Science" 
            className="input shadow-sm" 
            value={department} 
            onChange={e => setDepartment(e.target.value)} 
          />
        </div>
        
        <div className="pt-5 mt-5 border-t border-slate-100">
          <AvailabilityPicker 
            availability={availability} 
            setAvailability={setAvailability} 
          />
        </div>

        <div className="flex gap-3 pt-6">
          <button 
            type="submit" 
            disabled={loading} 
            className={`btn flex-1 py-2.5 text-[15px] ${editItem ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 shadow-md' : 'btn-primary shadow-indigo-600/30 shadow-md'}`}
          >
            {loading ? "Saving..." : editItem ? "Update Faculty" : "Add Faculty"}
          </button>
          
          {editItem && (
            <button 
              type="button" 
              onClick={resetForm}
              className="btn btn-secondary py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
