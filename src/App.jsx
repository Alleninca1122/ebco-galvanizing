import React, { useState, useEffect, useRef } from 'react';
import ProductionForm from './components/ProductionForm';
import AdminEmployeeManager from './components/AdminEmployeeManager';
import ForceChangePinModal from './components/ForceChangePinModal';
import { supabase } from './utils/supabaseClient';

export default function App() {
  const [currentOperator, setCurrentOperator] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [operators, setOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [showForceChangePin, setShowForceChangePin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // 定时器引用：用于无操作自动登出
  const idleTimerRef = useRef(null);

  // 1. 获取所有激活状态的操作员列表
  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('is_active', true);
    if (!error && data) {
      setOperators(data);
    }
  };

  // 2. 无操作自动登出逻辑 (Idle Timeout - 4小时)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    // 如果当前有员工登录，开启 4 小时 (4 * 60 * 60 * 1000 ms) 倒计时
    if (currentOperator) {
      idleTimerRef.current = setTimeout(() => {
        handleLogout('timeout');
      }, 4 * 60 * 60 * 1000); // 4 小时无操作自动登出
    }
  };

  // 监听键盘、鼠标、触摸操作，重置静置倒计时
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => resetIdleTimer();

    if (currentOperator) {
      resetIdleTimer();
      events.forEach((event) => window.addEventListener(event, handleUserActivity));
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
    };
  }, [currentOperator]);

  // 3. 处理 PIN 登录验证
  const handleLogin = async (e) => {
    e.preventDefault();
    const op = operators.find((o) => o.id === selectedOperatorId);
    if (!op) {
      alert('Please select an operator');
      return;
    }

    if (op.pin === pinInput) {
      // 校验成功，记录登录状态
      setCurrentOperator(op);
      setPinInput('');

      // 如果使用的仍是初始默认密码 1234，强迫修改 PIN
      if (op.pin === '1234') {
        setShowForceChangePin(true);
      }
    } else {
      alert('Incorrect PIN');
      setPinInput('');
    }
  };

  // 4. 登出/注销逻辑 (Logout)
  const handleLogout = (reason = 'manual') => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setCurrentOperator(null);
    setSelectedOperatorId('');
    setPinInput('');
    setShowAdmin(false);

    if (reason === 'timeout') {
      alert('System automatically logged out due to 4 hours of inactivity.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* 顶部导航与状态条 */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">EBCO Galvanizing System</h1>
        
        {currentOperator && (
          <div className="flex items-center gap-4">
            <span className="text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              Operator: <strong className="text-emerald-400">{currentOperator.name}</strong> ({currentOperator.role})
            </span>

            {/* Admin 管理界面切换按钮 */}
            {currentOperator.role === 'admin' && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-sm transition"
              >
                {showAdmin ? 'Back to Form' : 'Employee Mgmt'}
              </button>
            )}

            {/* 手动登出 / 切换操作员按钮 */}
            <button
              onClick={() => handleLogout('manual')}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-semibold transition"
            >
              Exit / Switch Operator
            </button>
          </div>
        )}
      </header>

      {/* 主体界面：未登录时显示锁屏 PIN 输入框 */}
      {!currentOperator ? (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Operator Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Operator</label>
              <select
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">-- Choose Name --</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Enter PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full border p-2.5 rounded-lg bg-slate-50 text-center tracking-widest text-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="****"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        /* 已登录状态：根据点击显示管理后台或操作表单 */
        <main className="p-6">
          {showAdmin && currentOperator.role === 'admin' ? (
            <AdminEmployeeManager />
          ) : (
            <ProductionForm currentOperator={currentOperator} />
          )}
        </main>
      )}

      {/* 第一次登录强制改密码弹窗 */}
      {showForceChangePin && (
        <ForceChangePinModal
          operator={currentOperator}
          onClose={() => setShowForceChangePin(false)}
        />
      )}
    </div>
  );
}