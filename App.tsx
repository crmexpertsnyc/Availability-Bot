
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Icons, BOT_CONFIG } from './constants';
import Dashboard from './components/Dashboard';
import Roster from './components/Roster';
import Settings from './components/Settings';
import BotCode from './components/BotCode';
import { TeamMember, AvailabilityStatus } from './types';
import { INITIAL_ROSTER } from './constants';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Overview', icon: <Icons.Dashboard /> },
    { path: '/roster', label: 'Team Roster', icon: <Icons.Users /> },
    { path: '/settings', label: 'Bot Config', icon: <Icons.Settings /> },
    { path: '/code', label: 'Apps Script', icon: <Icons.Code /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 h-screen sticky top-0 flex flex-col bg-white">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <span className="font-bold text-lg">AIQ</span>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-none">AvailabilityIQ</h1>
          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Control Center</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Leadership Space</p>
          <p className="text-xs font-mono text-slate-600 truncate">{BOT_CONFIG.leadershipSpace}</p>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ isLive, isFetching }: { isLive: boolean, isFetching: boolean }) => (
  <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isFetching ? 'animate-ping bg-indigo-400' : isLive ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'}`}></span>
      <span className="text-sm font-medium text-slate-600 tracking-tight">
        Source: <span className={isLive ? 'text-indigo-600 font-bold' : 'text-emerald-600 font-bold'}>
          {isFetching ? 'Refreshing...' : isLive ? 'Live Deployment' : 'Demo Logic'}
        </span>
      </span>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
        <Icons.Bell />
      </button>
      <div className="h-8 w-[1px] bg-slate-100"></div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100">
          <img src="https://picsum.photos/32/32?seed=admin" alt="Admin" />
        </div>
        <span className="text-sm font-semibold text-slate-700">John Perez</span>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(
    INITIAL_ROSTER.map(u => ({
      ...u,
      currentStatus: AvailabilityStatus.NO_RESPONSE,
      lastRespondedAt: undefined
    }))
  );
  const [isLive, setIsLive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = async () => {
    const apiUrl = localStorage.getItem('AIQ_WEBAPP_URL');
    if (!apiUrl) {
      setIsLive(false);
      // Fallback to mock behavior if no URL
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        setIsLive(true);
      }
    } catch (e) {
      console.error("Fetch failed", e);
      setIsLive(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 60 seconds if live
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock initial response data for demo purposes (only runs if not live)
  useEffect(() => {
    if (isLive) return;
    const timer = setTimeout(() => {
      setTeam(prev => prev.map((member, i) => {
        if (i < 3) return {
          ...member,
          currentStatus: AvailabilityStatus.AVAILABLE,
          lastRespondedAt: new Date().toISOString()
        };
        if (i === 4) return {
          ...member,
          currentStatus: AvailabilityStatus.LIMITED,
          startTime: "10:00 AM",
          endTime: "03:00 PM",
          notes: "Focus work block",
          lastRespondedAt: new Date().toISOString()
        };
        return member;
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLive]);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Header isLive={isLive} isFetching={isFetching} />
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard team={team} onRefresh={fetchData} />} />
              <Route path="/roster" element={<Roster team={team} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/code" element={<BotCode />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
