import React from 'react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function StatCard({ title, count, icon: Icon, isReady, emptyText, link }) {
  const isEmpty = typeof count === 'number' && count === 0;
  
  return (
    <div className="card p-6 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={clsx(
        "p-4 rounded-full mb-4",
        isReady === true ? "bg-green-100 text-green-600" :
        isReady === false || isEmpty ? "bg-red-50 text-red-500" :
        "bg-indigo-50 text-indigo-600"
      )}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className={clsx(
        "text-4xl font-bold mt-2 font-sans tracking-tight",
        isReady === true ? "text-green-600" :
        isReady === false || isEmpty ? "text-red-600" :
        "text-indigo-900"
      )}>
        {count}
      </p>
      
      {isEmpty && link && (
        <Link to={link} className="mt-4 text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 group">
          {emptyText} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
