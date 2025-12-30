
import React from 'react';
import { TeamMember, AvailabilityStatus } from '../types';

interface RosterProps {
  team: TeamMember[];
}

const Roster: React.FC<RosterProps> = ({ team }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Team Roster</h2>
          <p className="text-slate-500 font-medium">Authoritative list of polled members.</p>
        </div>
        <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-2">Total Enrolled</p>
           <p className="text-2xl font-black text-indigo-700 px-2 leading-none">
             {team.length.toString().padStart(2, '0')}
           </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Name & Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">DM Space ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {team.map((member) => (
              <tr key={member.email} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {member.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-none">{member.displayName}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      member.currentStatus === AvailabilityStatus.AVAILABLE ? 'bg-emerald-500' :
                      member.currentStatus === AvailabilityStatus.LIMITED ? 'bg-amber-500' :
                      member.currentStatus === AvailabilityStatus.UNAVAILABLE ? 'bg-rose-500' : 'bg-slate-300'
                    }`}></div>
                    <span className="text-sm font-semibold text-slate-700">
                      {member.currentStatus === AvailabilityStatus.NO_RESPONSE ? 'Pending Poll' : member.currentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <code className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {member.dmSpaceName || 'UNREGISTERED'}
                  </code>
                </td>
                <td className="px-6 py-6 text-right">
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
                    Edit Enrollment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-800">Enrollment Notice</h4>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">
            The Google Chat API requires users to explicitly register by direct messaging the bot at least once. 
            If a space ID is missing, please ensure the user has typed <strong>'register'</strong> in a DM to AvailabilityIQ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Roster;
