import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, User, BookOpen, DoorClosed, Wand2, CalendarDays, Library, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Departments', path: '/departments', icon: Library },
  { name: 'Programs', path: '/programs', icon: GraduationCap },
  { name: 'Sections', path: '/sections', icon: Users },
  { name: 'Faculty', path: '/faculty', icon: User },
  { name: 'Subjects', path: '/subjects', icon: BookOpen },
  { name: 'Rooms', path: '/rooms', icon: DoorClosed },
  { name: 'Generate', path: '/generate', icon: Wand2 },
  { name: 'Timetable', path: '/timetable', icon: CalendarDays },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-indigo-950 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-indigo-900">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-400" />
          <span className="tracking-tight">Timetable Pro</span>
        </h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-900 border-l-4 border-indigo-500 text-white" 
                : "text-indigo-200 hover:bg-indigo-900/50 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
