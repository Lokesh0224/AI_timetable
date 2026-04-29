import React from 'react';
import { clsx } from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];

export default function AvailabilityPicker({ availableDays, availableSlots, setAvailableDays, setAvailableSlots }) {
  
  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
      const newSlots = { ...availableSlots };
      delete newSlots[day];
      setAvailableSlots(newSlots);
    } else {
      setAvailableDays([...availableDays, day]);
      setAvailableSlots({ ...availableSlots, [day]: [] });
    }
  };

  const toggleSlot = (day, slot) => {
    if (slot === '1PM') return; // Lunch not selectable
    
    const daySlots = availableSlots[day] || [];
    let newDaySlots;
    if (daySlots.includes(slot)) {
      newDaySlots = daySlots.filter(s => s !== slot);
    } else {
      newDaySlots = [...daySlots, slot];
    }
    setAvailableSlots({ ...availableSlots, [day]: newDaySlots });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Select Available Days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border shadow-sm",
                availableDays.includes(day) 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20" 
                  : "bg-white border-slate-300 text-slate-600 hover:border-indigo-400"
              )}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {availableDays.length > 0 && (
        <div className="space-y-4">
          <label className="label">Select Time Slots for Each Day</label>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm pb-5">
            {availableDays.map(day => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-white pb-3 last:border-0 last:pb-0">
                <span className="w-24 font-bold text-xs uppercase tracking-wider text-slate-500">{day}:</span>
                <div className="flex flex-wrap gap-2">
                  {SLOTS.map(slot => {
                    const isLunch = slot === '1PM';
                    const isSelected = availableSlots[day]?.includes(slot);
                    
                    return (
                      <button
                        key={`${day}-${slot}`}
                        type="button"
                        disabled={isLunch}
                        onClick={() => toggleSlot(day, slot)}
                        className={clsx(
                          "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border",
                          isLunch 
                            ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed cursor-help" 
                            : isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20 shadow-inner"
                              : "bg-white border-slate-300 text-slate-600 hover:border-emerald-400 focus:ring-2 ring-emerald-500"
                        )}
                        title={isLunch ? "Lunch Break" : ""}
                      >
                        {isLunch ? 'Lunch' : slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {availableDays.length === 0 && (
        <div className="text-sm font-medium text-slate-400 text-center p-6 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          Select days above to activate time slots
        </div>
      )}
    </div>
  );
}
