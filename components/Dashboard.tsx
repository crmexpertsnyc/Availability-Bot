
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TeamMember, AvailabilityStatus } from '../types';

interface DashboardProps {
  team: TeamMember[];
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ team, onRefresh }) => {
  const stats = {
    available: team.filter(m => m.currentStatus === AvailabilityStatus.AVAILABLE).length,
    limited: team.filter(m => m.currentStatus === AvailabilityStatus.LIMITED).length,
    unavailable: team.filter(m => m.currentStatus === AvailabilityStatus.UNAVAILABLE).length,
    noResponse: team.filter(m => m.currentStatus === AvailabilityStatus.NO_RESPONSE).length,
  };

  const pieData = [
    { name: 'Available', value: stats.available, color: '#4f46e5' }, // Matching indigo theme
    { name: 'Limited', value: stats.limited, color: '#f59e0b' },
    { name: 'Unavailable', value: stats.unavailable, color: '#ef4444' },
    { name: 'Pending', value: stats.noResponse, color: '#cbd5e1' },
  ];

  const trendData = [
    { day: 'Mon', count: 6 },
    { day: 'Tue', count: 5 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 4 },
    { day: 'Fri', count: 5 },
    { day: 'Sat', count: 1 },
    { day: 'Sun', count: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Team Pulse</h2>
          <p className="text-slate-500 font-medium">Monitoring status for {team.length} core members.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Available', count: stats.available, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Limited', count: stats.limited, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unavailable', count: stats.unavailable, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Pending', count: stats.noResponse, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6 rounded-3xl">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-4xl font-black ${stat.color}`}>{stat.count}</span>
              <span className="text-slate-400 text-sm font-medium">/ {team.length}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Participation Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count >= 5 ? '#4f46e5' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Mix Pie */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-6 w-full">Response Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 w-full space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{team.length > 0 ? Math.round((item.value / team.length) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Log View */}
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Timeline</h3>
        <div className="space-y-4">
          {team.filter(m => m.lastRespondedAt).length > 0 ? (
            team.filter(m => m.lastRespondedAt).map((member) => (
              <div key={member.email} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {member.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800">{member.displayName} <span className="text-slate-400 font-medium text-xs ml-1">{member.email}</span></p>
                    <span className="text-xs font-medium text-slate-400">
                      {member.lastRespondedAt ? new Date(member.lastRespondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      member.currentStatus === AvailabilityStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700' :
                      member.currentStatus === AvailabilityStatus.LIMITED ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {member.currentStatus}
                    </span>
                    {member.notes && <span className="text-xs text-slate-500 italic truncate italic">— "{member.notes}"</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No responses recorded yet for today.
            </div>
          )}
          
          {team.filter(m => !m.lastRespondedAt).length > 0 && (
             <div className="p-4 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 text-center">
                <p className="text-xs font-medium text-slate-400">
                  {team.filter(m => !m.lastRespondedAt).length} members pending response (Reminder set for 12:00 PM)
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
