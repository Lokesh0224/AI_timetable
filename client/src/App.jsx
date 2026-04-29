import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import Subjects from './pages/Subjects';
import Rooms from './pages/Rooms';
import Generate from './pages/Generate';
import ViewTimetable from './pages/ViewTimetable';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/timetable" element={<ViewTimetable />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
