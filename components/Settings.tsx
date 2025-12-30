
import React, { useState, useEffect } from 'react';
import { BOT_CONFIG } from '../constants';

const Settings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('AIQ_WEBAPP_URL') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${BOT_CONFIG.spreadsheetId}`;

  const saveUrl = () => {
    localStorage.setItem('AIQ_WEBAPP_URL', apiUrl);
    window.location.reload(); // Refresh to trigger fetch in App.tsx
  };

  const testConnection = async () => {
    if (!apiUrl) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (e) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bot Configuration</h2>
        <p className="text-slate-500 font-medium">Operational parameters and data connectivity.</p>
      </div>

      {/* API Connection Hub */}
      <div className="glass-panel p-8 rounded-3xl border-indigo-200 bg-indigo-50/30">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Live Data Source</h3>
            <p className="text-xs text-slate-500 mt-1">Connect your dashboard to the deployed Apps Script Web App.</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${apiUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            {apiUrl ? 'Configured' : 'Offline Mode'}
          </div>
        </div>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="https://script.google.com/macros/s/.../exec"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-mono text-slate-600 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <button 
            onClick={testConnection}
            disabled={isTesting || !apiUrl}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test'}
          </button>
          <button 
            onClick={saveUrl}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Save & Connect
          </button>
        </div>
        
        {testResult === 'success' && <p className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connection successful! Dashboard will now show live data.</p>}
        {testResult === 'error' && <p className="mt-3 text-xs font-bold text-rose-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Connection failed. Check your Web App URL and deployment settings.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Schedule Settings */}
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Automation Schedule</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-slate-800">Morning Poll</p>
                <p className="text-xs text-slate-500">Initial daily contact</p>
              </div>
              <span className="font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg border border-slate-200">{BOT_CONFIG.pollTimes[0]}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-slate-800">Mid-day Reminder</p>
                <p className="text-xs text-slate-500">Non-responder follow-up</p>
              </div>
              <span className="font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg border border-slate-200">{BOT_CONFIG.pollTimes[1]}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div>
                <p className="font-bold text-indigo-900">Leadership Summary</p>
                <p className="text-xs text-indigo-700">Detailed report to management</p>
              </div>
              <span className="font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg border border-slate-200">{BOT_CONFIG.summaryTime}</span>
            </div>
          </div>
        </div>

        {/* Status Definitions */}
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status Glossary</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Available</p>
                <p className="text-xs text-slate-500">User clicked 'Available'. They have explicitly confirmed they are online and task-ready.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Pending Poll</p>
                <p className="text-xs text-slate-500">Poll card was sent, but no button has been clicked. User has not checked in yet.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Limited / Notes</p>
                <p className="text-xs text-slate-500">User is active but has shared specific constraints (e.g. appointments or focus blocks).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
