import React, { useState } from 'react';
import ProductionForm from './components/ProductionForm';
import NextStepProcessPortal from './components/NextStepProcessPortal';
import AdminEmployeeManager from './components/AdminEmployeeManager';

export default function App() {
  // 1. 模拟登录用户（实际开发中接 Supabase 登录状态）
  // 岗位 Role 可选: 'OPERATOR_LOADING' | 'OPERATOR_PROCESS' | 'FOREMAN'
  const [user, setUser] = useState({
    id: 'OP-101',
    name: 'John Doe',
    role: 'OPERATOR_PROCESS' 
  });

  // 2. 根据用户角色初始化默认显示的页面
  const getDefaultTab = (role) => {
    if (role === 'OPERATOR_LOADING') return 'loading';
    return 'process'; // 酸洗/浸锌/卸架工人与班长默认进工序台
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab(user.role));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
      {/* 顶部导航控制栏 */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <h1 className="text-lg font-bold text-cyan-400 font-mono tracking-wide">
            EBCO Galvanizing System
          </h1>
          
          {/* 页面切换按钮 */}
          <nav className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('loading')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                activeTab === 'loading' 
                  ? 'bg-cyan-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Step 01: Loading (挂件)
            </button>

            <button
              onClick={() => setActiveTab('process')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                activeTab === 'process' 
                  ? 'bg-cyan-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Steps 02-04: Process Portal (工序作业台)
            </button>

            {/* 班长 / 管理员专属菜单 */}
            {user.role === 'FOREMAN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  activeTab === 'admin' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin (员工管理)
              </button>
            )}
          </nav>
        </div>

        {/* 右侧当前操作员信息 */}
        <div className="text-xs text-right">
          <span className="text-slate-400 block">Logged in as:</span>
          <span className="font-mono text-cyan-300 font-bold">
            👤 {user.name} ({user.role})
          </span>
        </div>
      </header>

      {/* 动态渲染对应组件 */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'loading' && <ProductionForm currentUser={user} />}
        {activeTab === 'process' && <NextStepProcessPortal currentUser={user} />}
        {activeTab === 'admin' && <AdminEmployeeManager />}
      </main>
    </div>
  );
}