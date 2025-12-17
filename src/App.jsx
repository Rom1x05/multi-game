import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Trophy,
  Users,
  Play,
  Plus,
  Settings,
  BarChart2,
  LayoutDashboard
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import PlayerManager from './components/PlayerManager';
import RaceSetup from './components/RaceSetup';
import ActiveRace from './components/ActiveRace';
import RaceResults from './components/RaceResults';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import PlayerProfile from './components/PlayerProfile';
import Data from './components/Data';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/players" element={<PlayerManager />} />
      <Route path="/players/:id" element={<PlayerProfile />} />
      <Route path="/race/new" element={<RaceSetup />} />
      <Route path="/race/:id" element={<ActiveRace />} />
      <Route path="/race/:id/results" element={<RaceResults />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/data" element={<Data />} />
    </Routes>
  );
}

export default App;
