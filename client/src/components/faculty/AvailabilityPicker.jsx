import React from 'react';
import { clsx } from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];

export default function AvailabilityPicker({ availability = [], setAvailability }) {
  
  const handlePrioritySelect = (day, timeSlot, priority) => {
    if (timeSlot === '1PM') return;
    
    setAvailability(prev => {
      // Remove any existing entry for this day+slot
      const filtered = prev.filter(
        a => !(a.day === day && a.timeSlot === timeSlot)
      );
      
      const existing = prev.find(
        a => a.day === day && a.timeSlot === timeSlot
      );
      
      // If clicking same priority -> deselect (return filtered)
      if (existing?.priority === priority) {
        return filtered;
      }
      
      // Otherwise set new priority
      return [...filtered, { day, timeSlot, priority }];
    });
  };

  const getPriority = (day, timeSlot) => {
    return availability.find(
      a => a.day === day && a.timeSlot === timeSlot
    )?.priority || null;
  };

  const priorityCounts = {
    1: availability.filter(a => a.priority === 1).length,
    2: availability.filter(a => a.priority === 2).length,
    3: availability.filter(a => a.priority === 3).length,
  };
  const total = availability.length;

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="font-bold text-sm text-slate-800 mb-3">Priority Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Priority 1 (Most Preferred)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Priority 2 (Fallback)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Priority 3 (Last Resort)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span> Not Available</div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="label">Select Availability and Priorities</label>
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {DAYS.map(day => (
            <div key={day} className="flex flex-col xl:flex-row xl:items-center border-b border-slate-100 last:border-0 p-4 gap-4 transition-colors hover:bg-slate-50/50">
              <span className="w-24 font-bold text-sm text-slate-700">{day}</span>
              <div className="flex flex-wrap gap-2 flex-1">
                {SLOTS.map(slot => {
                  const isLunch = slot === '1PM';
                  const currentP = getPriority(day, slot);
                  
                  if (isLunch) {
                    return (
                      <div key={slot} className="flex flex-col items-center bg-slate-100 border border-slate-200 rounded pb-1 px-1 opacity-60 cursor-not-allowed">
                        <span className="text-[10px] font-bold text-slate-500 my-1">{slot}</span>
                        <div className="text-[10px] font-medium text-slate-400 px-3">Lunch</div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${day}-${slot}`} className="flex flex-col items-center bg-white border border-slate-200 rounded pb-1 px-1 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                      <span className="text-[10px] font-bold text-slate-600 my-1">{slot}</span>
                      <div className="flex gap-px">
                        <button
                          type="button"
                          onClick={() => handlePrioritySelect(day, slot, 1)}
                          className={clsx(
                            "w-6 h-6 text-[10px] font-bold rounded-l transition-all",
                            currentP === 1 ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          )}
                        >
                          P1
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrioritySelect(day, slot, 2)}
                          className={clsx(
                            "w-6 h-6 text-[10px] font-bold transition-all",
                            currentP === 2 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          )}
                        >
                          P2
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrioritySelect(day, slot, 3)}
                          className={clsx(
                            "w-6 h-6 text-[10px] font-bold rounded-r transition-all",
                            currentP === 3 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          )}
                        >
                          P3
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="font-bold text-sm text-slate-800 mb-2">Availability Summary</h4>
        <div className="grid grid-cols-4 gap-4 text-sm font-medium">
          <div className="text-green-700 bg-green-50 p-2 rounded border border-green-100">
            P1: {priorityCounts[1]} slots
          </div>
          <div className="text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
            P2: {priorityCounts[2]} slots
          </div>
          <div className="text-orange-700 bg-orange-50 p-2 rounded border border-orange-100">
            P3: {priorityCounts[3]} slots
          </div>
          <div className="text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-100 font-bold">
            Total: {total} slots
          </div>
        </div>
      </div>

    </div>
  );
}
