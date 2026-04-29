import React, { createContext, useState, useEffect, useContext } from 'react';
import { timetableAPI } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState({
    facultyCount: 0,
    subjectCount: 0,
    roomCount: 0,
    totalSessionsNeeded: 0,
    totalAvailableSlots: 0,
    readyToGenerate: false,
  });

  const refreshStats = async () => {
    try {
      const data = await timetableAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <AppContext.Provider value={{ stats, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
