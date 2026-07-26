import React, { useState } from 'react';
import ProductionForm from './components/ProductionForm';
import NextStepProcessPortal from './components/NextStepProcessPortal';

export default function App() {
  // 1. Authentication State (Default null to force login)
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('loading'); // 'loading' | 'process'

  // 2. Login Form State
  const [shift, setShift] = useState('Morning');
  const [empCode, setEmpCode] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle Login Event (Dynamically creates session based on entered Code & Shift)
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const trimmedCode = empCode.trim();
    if (!trimmedCode || !pin) {
      setLoginError('Please enter both Employee Code and Security PIN.');
      return;
    }

    // Role Routing Logic based on entered Code/PIN
    let role = 'OPERATOR_LOADING';
    if (trimmedCode.toLowerCase().includes('proc') || pin === '8888') {
      role = 'OPERATOR_PROCESS';
    }

    // Dynamic Employee Session Object (No hardcoded demo fallback)
    const userData = {
      id: trimmedCode.toUpperCase(),
      name: trimmedCode.toUpperCase(),
      role: role,
      shift: shift
    };

    setCurrentUser(userData);

    // Auto-navigate based on role
    if (role === 'OPERATOR_PROCESS') {
      setActiveTab('process');
    } else {
      setActiveTab('loading');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmpCode('');
    setPin('');
  };

  // =================================================================
  // VIEW 1: Clean English Login Screen
  // =================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              EBCO Galvanizing Operations
            </span>
            <h1 className="text-2xl font-extrabold text-white">Shop-Floor Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in to manage rack processing</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Shift Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Shift</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShift('Morning')}
                  className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    shift === 'Morning'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ☀️ Morning Shift
                </button>
                <button
                  type="button"
                  onClick={() => setShift('Evening')}
                  className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    shift === 'Evening'
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🌙 Evening Shift
                </button>
              </div>
            </div>

            {/* Employee Code */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Employee Code</label>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Security PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Security PIN</label>
              <input
                type="password"
                placeholder="••••"
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-cyan-300 font-mono tracking-widest focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300 text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition-all mt-2"
            >
              Access System →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =================================================================
  // VIEW 2: Clean English Main Station Dashboard
  // =================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4">
      
      {/* Header Bar */}
      <header className="max-w-6xl mx-auto mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">EBCO Galvanizing System</h1>
          <p className="text-xs text-slate-400">Integrated Shop-Floor Tracking Solution</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('loading')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'loading'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 01: Loading Station
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'process'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Steps 02-04: Process Portal
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">{currentUser.shift} Shift</span>
            <span className="text-xs font-bold text-cyan-300 font-mono">👤 {currentUser.id}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900 hover:text-rose-200 text-slate-300 text-xs font-bold rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'loading' ? (
          <ProductionForm currentUser={currentUser} />
        ) : (
          <NextStepProcessPortal currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}