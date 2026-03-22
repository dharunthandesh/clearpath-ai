import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CityMapPage from './pages/CityMapPage';
import ReportPage from './pages/ReportPage';
import RouteFinder from './pages/RouteFinder';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bglight">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<CityMapPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/route-finder" element={<RouteFinder />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
