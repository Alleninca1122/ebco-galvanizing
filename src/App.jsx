import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    work_order_no: '',
    customer_name: '',
    black_weight_kg: '',
    jig_id: '',
    acid_conc_percent: '15',
    zinc_temp_celsius: '450',
    dipping_duration_sec: '180',
    is_quenched: false,
    is_passivated: false,
    finished_weight_kg: '',
    qc_status: 'passed',
    qc_defect_type: '',
    qc_remarks: ''
  });

  const [selectedLogId, setSelectedLogId] = useState('');

  // 刷新生产日志数据
  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('production_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) fetchLogs();
  }, [currentUser]);

  // PIN 码校验登录
  const handlePinSubmit = async (digit) => {
    const newPin = pin + digit;
    if (newPin.length <= 4) {
      setPin(newPin);
    }
    if (newPin.length === 4) {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('pin', newPin)
        .single();

      if (error || !data) {
        setLoginError('PIN 码错误，请重新输入');
        setTimeout(() => setPin(''), 800);
      } else {
        setCurrentUser(data);
        setLoginError('');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPin('');
  };

  // 1. Loading 提交
  const handleLoadingSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('production_logs').insert([{
      work_order_no: formData.work_order_no,
      customer_name: formData.customer_name,
      black_weight_kg: parseFloat(formData.black_weight_kg),
      jig_id: formData.jig_id,
      loading_operator: currentUser.name,
      loading_time: new Date().toISOString(),
      current_station: '02-pickling'
    }]);

    if (!error) {
      alert('01-Loading 提交成功！已流转至 Pickling 工位');
      setFormData({ ...formData, work_order_no: '', customer_name: '', black_weight_kg: '', jig_id: '' });
      fetchLogs();
    } else {
      alert('提交失败: ' + error.message);
    }
  };

  // 2. Pickling 提交
  const handlePicklingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogId) return alert('请选择需要处理的工单');

    const { error } = await supabase.from('production_logs').update({
      acid_conc_percent: parseFloat(formData.acid_conc_percent),
      pickling_operator: currentUser.name,
      pickling_out_time: new Date().toISOString(),
      current_station: '03-dipping'
    }).eq('id', selectedLogId);

    if (!error) {
      alert('02-Pickling 完成！已流转至 Dipping 工位');
      setSelectedLogId('');
      fetchLogs();
    }
  };

  // 3. Dipping 提交
  const handleDippingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogId) return alert('请选择需要处理的工单');

    const { error } = await supabase.from('production_logs').update({
      zinc_temp_celsius: parseFloat(formData.zinc_temp_celsius),
      dipping_duration_sec: parseInt(formData.dipping_duration_sec),
      is_quenched: formData.is_quenched,
      is_passivated: formData.is_passivated,
      dipping_operator: currentUser.name,
      dipping_time: new Date().toISOString(),
      current_station: '04-unloading'
    }).eq('id', selectedLogId);

    if (!error) {
      alert('03-Dipping 完成！已流转至 Unloading 工位');
      setSelectedLogId('');
      fetchLogs();
    }
  };

  // 4. Unloading & QC 提交
  const handleUnloadingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogId) return alert('请选择需要处理的工单');

    const currentLog = logs.find(l => l.id === selectedLogId);
    const finishedKg = parseFloat(formData.finished_weight_kg);
    const zincUsed = finishedKg - (currentLog?.black_weight_kg || 0);

    const { error } = await supabase.from('production_logs').update({
      finished_weight_kg: finishedKg,
      zinc_used_kg: zincUsed > 0 ? zincUsed : 0,
      qc_status: formData.qc_status,
      qc_defect_type: formData.qc_defect_type,
      qc_remarks: formData.qc_remarks,
      unloading_operator: currentUser.name,
      unloading_time: new Date().toISOString(),
      current_station: 'completed',
      status: formData.qc_status === 'passed' ? 'completed' : 'flagged'
    }).eq('id', selectedLogId);

    if (!error) {
      alert('04-Unloading & QC 归档完成！');
      setSelectedLogId('');
      fetchLogs();
    }
  };

  // 未登录界面 (PIN 键盘)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-white">
        <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <h1 className="text-2xl font-bold text-center mb-1 text-blue-400">EBCO Galvanizing</h1>
          <p className="text-xs text-center text-gray-400 mb-6">热镀锌 SOP & 生产跟踪系统</p>
          
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-blue-500 ${pin.length > i ? 'bg-blue-500' : 'bg-transparent'}`}></div>
            ))}
          </div>

          {loginError && <p className="text-red-400 text-xs text-center mb-4">{loginError}</p>}

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handlePinSubmit(num.toString())}
                className="h-14 text-2xl font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl transition active:scale-95"
              >
                {num}
              </button>
            ))}
            <button onClick={() => setPin('')} className="h-14 text-sm font-semibold bg-red-900/50 text-red-300 hover:bg-red-900 rounded-xl">清空</button>
            <button onClick={() => handlePinSubmit('0')} className="h-14 text-2xl font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl">0</button>
            <button onClick={() => setPin(pin.slice(0, -1))} className="h-14 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl">⌫</button>
          </div>
        </div>
      </div>
    );
  }

  // 已登录主界面
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ebco Galvanizing Control</h1>
          <p className="text-xs text-slate-400">当前操作员: <span className="text-blue-400 font-semibold">{currentUser.name}</span> ({currentUser.role})</p>
        </div>
        <button onClick={handleLogout} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-600">切换账号</button>
      </header>

      {/* 主体操作区 */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Admin 界面 */}
        {currentUser.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">📊 厂长全流程大屏 (Admin View)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs text-gray-600 uppercase border-b">
                  <tr>
                    <th className="p-3">工单号</th>
                    <th className="p-3">客户</th>
                    <th className="p-3">黑件重(kg)</th>
                    <th className="p-3">成品重(kg)</th>
                    <th className="p-3">耗锌量(kg)</th>
                    <th className="p-3">当前状态</th>
                    <th className="p-3">QC 结果</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold">{log.work_order_no}</td>
                      <td className="p-3">{log.customer_name}</td>
                      <td className="p-3">{log.black_weight_kg || '-'}</td>
                      <td className="p-3">{log.finished_weight_kg || '-'}</td>
                      <td className="p-3 font-semibold text-blue-600">{log.zinc_used_kg || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{log.current_station}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${log.qc_status === 'passed' ? 'bg-green-100 text-green-700' : log.qc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {log.qc_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 01-Loading 工位 */}
        {(currentUser.assigned_station === '01-loading' || currentUser.role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-blue-700 border-b pb-2">01 - Loading (挂料工位)</h2>
            <form onSubmit={handleLoadingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">工单号 (Work Order #)</label>
                  <input required type="text" value={formData.work_order_no} onChange={e => setFormData({ ...formData, work_order_no: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="例: WO-2026-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">客户名称</label>
                  <input required type="text" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="例: Heavy Metal Inc" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">黑件重量 (Black Weight kg)</label>
                  <input required type="number" step="0.1" value={formData.black_weight_kg} onChange={e => setFormData({ ...formData, black_weight_kg: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">挂具/卡架编号 (Jig ID)</label>
                  <input required type="text" value={formData.jig_id} onChange={e => setFormData({ ...formData, jig_id: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="例: JIG-A04" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow">建立工单并下发 Pickling</button>
            </form>
          </div>
        )}

        {/* 02-Pickling 工位 */}
        {(currentUser.assigned_station === '02-pickling' || currentUser.role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-purple-700 border-b pb-2">02 - Pickling & Pre-treatment (酸洗前处理工位)</h2>
            <form onSubmit={handlePicklingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">选择待酸洗批次</label>
                <select value={selectedLogId} onChange={e => setSelectedLogId(e.target.value)} required className="w-full p-2.5 border rounded-lg">
                  <option value="">-- 请选择工单 --</option>
                  {logs.filter(l => l.current_station === '02-pickling').map(l => (
                    <option key={l.id} value={l.id}>{l.work_order_no} ({l.customer_name}) - {l.black_weight_kg}kg</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">酸液浓度 (Acid Conc %)</label>
                <input required type="number" step="0.1" value={formData.acid_conc_percent} onChange={e => setFormData({ ...formData, acid_conc_percent: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow">完成前处理下发 Dipping</button>
            </form>
          </div>
        )}

        {/* 03-Dipping 工位 */}
        {(currentUser.assigned_station === '03-dipping' || currentUser.role === 'supervisor' || currentUser.role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-amber-700 border-b pb-2">03 - Dipping (浸锌及后处理工位)</h2>
            <form onSubmit={handleDippingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">选择待浸锌批次</label>
                <select value={selectedLogId} onChange={e => setSelectedLogId(e.target.value)} required className="w-full p-2.5 border rounded-lg">
                  <option value="">-- 请选择工单 --</option>
                  {logs.filter(l => l.current_station === '03-dipping').map(l => (
                    <option key={l.id} value={l.id}>{l.work_order_no} ({l.customer_name})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">锌锅温度 (°C)</label>
                  <input required type="number" value={formData.zinc_temp_celsius} onChange={e => setFormData({ ...formData, zinc_temp_celsius: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">浸锌时长 (秒)</label>
                  <input required type="number" value={formData.dipping_duration_sec} onChange={e => setFormData({ ...formData, dipping_duration_sec: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_quenched} onChange={e => setFormData({ ...formData, is_quenched: e.target.checked })} className="w-5 h-5 rounded text-amber-600" />
                  <span className="text-sm font-medium">水淬处理 (Quenching)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_passivated} onChange={e => setFormData({ ...formData, is_passivated: e.target.checked })} className="w-5 h-5 rounded text-amber-600" />
                  <span className="text-sm font-medium">钝化处理 (Passivation)</span>
                </label>
              </div>
              <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow">出锅完成下发 Unloading</button>
            </form>
          </div>
        )}

        {/* 04-Unloading & QC 工位 */}
        {(currentUser.assigned_station === '04-unloading' || currentUser.role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-emerald-700 border-b pb-2">04 - Unloading & QC (卸料与质检工位)</h2>
            <form onSubmit={handleUnloadingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">选择待质检批次</label>
                <select value={selectedLogId} onChange={e => setSelectedLogId(e.target.value)} required className="w-full p-2.5 border rounded-lg">
                  <option value="">-- 请选择工单 --</option>
                  {logs.filter(l => l.current_station === '04-unloading').map(l => (
                    <option key={l.id} value={l.id}>{l.work_order_no} ({l.customer_name}) - 黑件: {l.black_weight_kg}kg</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">成品称重 (Finished Weight kg)</label>
                <input required type="number" step="0.1" value={formData.finished_weight_kg} onChange={e => setFormData({ ...formData, finished_weight_kg: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">QC 判定结果</label>
                  <select value={formData.qc_status} onChange={e => setFormData({ ...formData, qc_status: e.target.value })} className="w-full p-2.5 border rounded-lg">
                    <option value="passed">✅ 合格 (Passed)</option>
                    <option value="rework">⚠️ 返工 (Rework)</option>
                    <option value="rejected">❌ 报废 (Rejected)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">缺陷类型 (若有)</label>
                  <input type="text" value={formData.qc_defect_type} onChange={e => setFormData({ ...formData, qc_defect_type: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="例: 漏镀/锌瘤/灰斑" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow">归档入库</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}