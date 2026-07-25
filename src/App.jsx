import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getCurrentShiftByTime } from './utils/shiftHelper';
import { ForceChangePinModal } from './components/ForceChangePinModal';
import ProductionForm from './components/ProductionForm';
import AdminEmployeeManager from './components/AdminEmployeeManager';

export default function App() {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedShift, setSelectedShift] = useState(getCurrentShiftByTime());
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);
  const [currentView, setCurrentView] = useState('terminal');

  const fetchRecentLogs = async () => {
    try {
      const { data } = await supabase
        .from('production_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setRecentLogs(data);
    } catch (err) {
      console.log('Using local state or network delay');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRecentLogs();
    }
  }, [currentUser]);

  const LOCAL_USERS = [
    { employee_id: '1001', name: 'Ragunathan Sundaram', preferred_name: 'Ragu', role: 'Operator', pin: '1111', must_change_pin: false },
    { employee_id: '2001', name: 'Michael Scott', preferred_name: 'Mike', role: 'Shift Supervisor', pin: '8888', must_change_pin: false },
    { employee_id: '9001', name: 'Plant Administrator', preferred_name: 'Admin', role: 'Plant Manager', pin: '0000', must_change_pin: false },
  ];

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!employeeId || pin.length !== 4) {
      setLoginError('Please enter valid Employee ID and 4-digit PIN');
      return;
    }

    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pin', pin)
        .single();

      if (data) {
        setCurrentUser({ ...data, active_shift: selectedShift });
      } else {
        const localUser = LOCAL_USERS.find(u => u.employee_id === employeeId && u.pin === pin);
        if (localUser) {
          setCurrentUser({ ...localUser, active_shift: selectedShift });
        } else {
          setLoginError('Invalid Employee ID or PIN');
        }
      }
    } catch (err) {
      const localUser = LOCAL_USERS.find(u => u.employee_id === employeeId && u.pin === pin);
      if (localUser) {
        setCurrentUser({ ...localUser, active_shift: selectedShift });
      } else {
        setLoginError('Invalid Employee ID or PIN');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-cyan-400">EBCO Galvanizing</h1>
            <p className="text-slate-400 text-xs">Shop Floor Production Terminal</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Active Shift</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedShift('Morning Shift')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                  selectedShift === 'Morning Shift'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>🌅 Morning Shift</span>
                <span className="text-[10px] font-normal opacity-80">05:30 - 14:00</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShift('Evening Shift')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                  selectedShift === 'Evening Shift'
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>🌙 Evening Shift</span>
                <span className="text-[10px] font-normal opacity-80">14:00 - 22:30</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. 1001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-xl border border-slate-600 font-mono text-base focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">4-Digit PIN</label>
              <input
                type="password"
                maxLength="4"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-xl border border-slate-600 font-mono text-center text-xl tracking-widest focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {loginError && <p className="text-red-400 text-xs text-center font-medium">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg active:scale-95"
            >
              Confirm Shift & Login →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {currentUser.must_change_pin && (
        <ForceChangePinModal
          currentUser={currentUser}
          onPinUpdated={() => setCurrentUser({ ...currentUser, must_change_pin: false })}
        />
      )}

      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-base font-bold text-cyan-400">EBCO Galvanizing - Production Terminal</h1>
          <p className="text-xs text-slate-400">
            Operator: <span className="text-white font-semibold">{currentUser.preferred_name || currentUser.name}</span> ({currentUser.role}) | Shift:{' '}
            <span className={`font-bold ${currentUser.active_shift === 'Morning Shift' ? 'text-amber-300' : 'text-indigo-300'}`}>
              {currentUser.active_shift}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(currentUser.role === 'Plant Manager' || currentUser.role === 'Shift Supervisor') && (
            <button
              onClick={() => setCurrentView(currentView === 'terminal' ? 'admin' : 'terminal')}
              className="bg-cyan-800 hover:bg-cyan-700 text-cyan-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-600 transition"
            >
              {currentView === 'terminal' ? '⚙️ Admin Portal' : '🏭 Terminal Portal'}
            </button>
          )}

          <button
            onClick={() => setCurrentUser(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs border border-slate-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {currentView === 'admin' ? (
          <AdminEmployeeManager />
        ) : (
          <ProductionForm
            currentUser={currentUser}
            activeShift={currentUser.active_shift}
            recentLogs={recentLogs}
            onRefreshLogs={fetchRecentLogs}
          />
        )}
      </main>
    </div>
  );
}