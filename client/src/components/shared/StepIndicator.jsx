import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, label: 'Add Faculty', path: '/faculty' },
  { id: 2, label: 'Add Subjects', path: '/subjects' },
  { id: 3, label: 'Add Rooms', path: '/rooms' },
  { id: 4, label: 'Generate', path: '/generate' },
];

export default function StepIndicator({ stats }) {
  const navigate = useNavigate();
  
  const stepStatus = [
    { completed: stats.facultyCount > 0, current: stats.facultyCount === 0 },
    { completed: stats.subjectCount > 0, current: stats.facultyCount > 0 && stats.subjectCount === 0 },
    { completed: stats.roomCount > 0, current: stats.facultyCount > 0 && stats.subjectCount > 0 && stats.roomCount === 0 },
    { completed: false, current: stats.facultyCount > 0 && stats.subjectCount > 0 && stats.roomCount > 0 },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-10">
      {steps.map((step, idx) => {
        const status = stepStatus[idx];
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => navigate(step.path)}>
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  status.completed ? "bg-green-500 text-white shadow-md shadow-green-500/20" :
                  status.current ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/30" :
                  "bg-slate-200 text-slate-500"
                )}
              >
                {status.completed ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={clsx(
                "mt-3 text-sm font-semibold tracking-tight",
                status.current ? "text-indigo-700" : 
                status.completed ? "text-slate-800" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={clsx(
                "flex-1 h-1 mx-2 transition-colors duration-300 transform -translate-y-4 rounded-full",
                stepStatus[idx].completed ? "bg-green-500" : "bg-slate-200"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
