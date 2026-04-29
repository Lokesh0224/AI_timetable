import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
