import React, { useState } from 'react';

// =================================================================
// 模拟当前车间在制架子（Active Racks）的数据库状态
// 实际运行中这里通过 Supabase/API 读取
// =================================================================
const INITIAL_ACTIVE_RACKS = {
  '01': {
    rackNo: '01',
    status: 'IN_PROGRESS',
    loadingData: {
      timestamp: '2026-07-26 08:30',
      operator: 'John (Loading Worker)',
      totalWeight: '3.20',
      items: [
        { customer: 'ABC Steel', batch: 'B-2026-01', material: 'Tube', qty: 15, isRush: true },
        { customer: 'XYZ Metal', batch: 'PO-8821', material: 'Angle', qty: 20, isRush: false }
      ]
    },
    picklingData: null, // 尚未酸洗 -> 下一步是 Pickling
    dippingData: null,
    unloadingData: null
  },
  '05': {
    rackNo: '05',
    status: 'IN_PROGRESS',
    loadingData: {
      timestamp: '2026-07-26 09:00',
      operator: 'Dave (Loading Worker)',
      totalWeight: '4.10',
      items: [
        { customer: 'Apex Fab', batch: 'BATCH-99', material: 'Pipe', qty: 50, isRush: false }
      ]
    },
    picklingData: {
      timestamp: '2026-07-26 09:40',
      operator: 'Mike (Pickler)',
      acidTank: 'Acid Tank #2',
      durationMins: '45'
    },
    dippingData: null, // 酸洗已做，浸锌未做 -> 下一步是 Dipping
    unloadingData: null
  }
};

export default function NextStepProcessPortal({ currentUser }) {
  // 1. 当前登录用户（默认回退参数）
  const operator = currentUser || { id: 'OP-102', name: 'Mike Ross', role: 'OPERATOR_PROCESS' };

  // 2. 状态定义
  const [activeRacks, setActiveRacks] = useState(INITIAL_ACTIVE_RACKS);
  const [inputRackNo, setInputRackNo] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentAutoStage, setCurrentAutoStage] = useState(''); // 自动决定的工序
  const [searchError, setSearchError] = useState('');

  // 3. 表单数据状态
  const [formData, setFormData] = useState({
    acidTank: 'Acid Tank #1',
    soakDurationMins: '40',
    zincTemp: '450',
    dipDurationSecs: '240',
    defectQty: '0',
    notes: ''
  });

  // -----------------------------------------------------------------
  // 防呆逻辑：格式化架号输入 (如输入 '1' 或 ' 1 ' 自动规范化为 '01')
  // -----------------------------------------------------------------
  const formatRackInput = (val) => {
    if (!val) return '';
    const clean = val.trim();
    if (/^\d{1}$/.test(clean)) {
      return clean.padStart(2, '0');
    }
    return clean;
  };

  // -----------------------------------------------------------------
  // 核心逻辑：输入架号后，系统根据数据库记录自动推导“下一步未完成工序”
  // -----------------------------------------------------------------
  const determineNextStage = (rackRecord) => {
    if (!rackRecord.picklingData) {
      return 'PICKLING'; // Step 02: 酸洗前处理
    } else if (!rackRecord.dippingData) {
      return 'DIPPING';  // Step 03: 浸锌
    } else if (!rackRecord.unloadingData) {
      return 'UNLOADING';// Step 04: 卸架与质检
    } else {
      return 'COMPLETED';// 已全部完成
    }
  };

  // 检索架号事件
  const handleSearchRack = (targetRack) => {
    const queryKey = formatRackInput(targetRack || inputRackNo);
    setInputRackNo(queryKey);
    setSearchError('');

    if (!queryKey) {
      setSearchError('⚠️ Please enter or select a Rack ID.');
      return;
    }
    
    const record = activeRacks[queryKey];

    if (record) {
      setSelectedRack(record);
      const nextStage = determineNextStage(record);
      setCurrentAutoStage(nextStage);
    } else {
      setSelectedRack(null);
      setCurrentAutoStage('');
      setSearchError(`❌ Rack #${queryKey} is not active or empty. (未找到架号 ${queryKey} 或该架当前处于空闲状态)`);
    }
  };

  // 提交记录并自动更新流转状态
  const handleSubmitProcess = () => {
    if (!selectedRack || !currentAutoStage) return;

    const rackNo = selectedRack.rackNo;
    const updatedRack = { ...selectedRack };

    if (currentAutoStage === 'PICKLING') {
      updatedRack.picklingData = {
        timestamp: new Date().toLocaleString(),
        operator: operator.name,
        acidTank: formData.acidTank,
        durationMins: formData.soakDurationMins,
        notes: formData.notes
      };
    } else if (currentAutoStage === 'DIPPING') {
      updatedRack.dippingData = {
        timestamp: new Date().toLocaleString(),
        operator: operator.name,
        zincTemp: formData.zincTemp,
        dipDurationSecs: formData.dipDurationSecs,
        notes: formData.notes
      };
    } else if (currentAutoStage === 'UNLOADING') {
      updatedRack.unloadingData = {
        timestamp: new Date().toLocaleString(),
        operator: operator.name,
        defectQty: formData.defectQty,
        notes: formData.notes
      };
      updatedRack.status = 'COMPLETED'; // 标记完工释放架子
    }

    setActiveRacks(prev => ({ ...prev, [rackNo]: updatedRack }));
    
    alert(`✅ Step [${currentAutoStage}] successfully recorded for Rack #${rackNo}!`);

    // 提交后重置，准备输入下一个架号
    setSelectedRack(null);
    setInputRackNo('');
    setFormData({
      acidTank: 'Acid Tank #1',
      soakDurationMins: '40',
      zincTemp: '450',
      dipDurationSecs: '240',
      defectQty: '0',
      notes: ''
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-slate-900 text-slate-100 rounded-xl shadow-2xl font-sans">
      
      {/* 顶部 Header：显示系统身份与当前操作员 */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Galvanizing Tracking Protocol
          </span>
          <h2 className="text-xl font-bold text-white">Execution Station (工序作业台)</h2>
        </div>
        
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Operator (操作员):</span>
          <span className="text-xs font-bold text-cyan-300 font-mono">
            👤 {operator.name} [{operator.id}]
          </span>
        </div>
      </div>

      {/* 核心架号检索区 (支持下拉选择 + 自动补零输入框) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* 下拉选择活跃架号 */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 whitespace-nowrap">
              Active Racks:
            </label>
            <select
              value={selectedRack?.rackNo || ''}
              onChange={(e) => {
                if (e.target.value) {
                  setInputRackNo(e.target.value);
                  handleSearchRack(e.target.value);
                }
              }}
              className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Choose Active Rack --</option>
              {Object.keys(activeRacks).map((rackNo) => (
                <option key={rackNo} value={rackNo}>
                  Rack #{rackNo} ({determineNextStage(activeRacks[rackNo])})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-600 text-xs hidden sm:inline">OR</span>

          {/* 手动输入框 */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 whitespace-nowrap">
              Input #:
            </label>
            <input
              type="text"
              placeholder="e.g. 1, 05"
              value={inputRackNo}
              onChange={(e) => setInputRackNo(e.target.value)}
              onBlur={() => setInputRackNo(formatRackInput(inputRackNo))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchRack()}
              className="w-24 bg-slate-900 border-2 border-cyan-500 text-cyan-300 font-mono font-bold text-center text-lg rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={() => handleSearchRack()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase rounded-lg shadow-lg cursor-pointer transition-all"
            >
              Load
            </button>
          </div>
        </div>

        {/* 测试快捷按钮 */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Demo:</span>
          <button onClick={() => handleSearchRack('01')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded font-mono">#01</button>
          <button onClick={() => handleSearchRack('05')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded font-mono">#05</button>
        </div>
      </div>

      {/* 错误信息显示 */}
      {searchError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-sm mb-6">
          {searchError}
        </div>
      )}

      {/* 架号载入成功后的响应式双栏布局 */}
      {selectedRack && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧：该架号的前序历史追溯 (7栏) */}
          <div className="lg:col-span-7 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                📋 Rack #{selectedRack.rackNo} Progress History
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                Next Action: <strong className="text-cyan-300">{currentAutoStage}</strong>
              </span>
            </div>

            {/* 1. Step 01: 初始挂件明细 */}
            <div className="mb-3 bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex justify-between text-slate-400 mb-2">
                <span className="font-bold text-slate-200">Step 01: Loading (挂件)</span>
                <span className="font-mono">{selectedRack.loadingData.timestamp}</span>
              </div>
              <div className="space-y-1">
                {selectedRack.loadingData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                    <div>
                      <strong className="text-slate-200">{item.customer}</strong>
                      <span className="text-slate-400 ml-2">[{item.material}]</span>
                      <span className="text-slate-500 ml-2">{item.batch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isRush && <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1 py-0.5 rounded font-bold">RUSH</span>}
                      <span className="font-mono font-bold text-cyan-300">{item.qty} pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Step 02: 酸洗状态 */}
            <div className="mb-3 bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Step 02: Pickling (酸洗前处理)</span>
                {selectedRack.picklingData ? (
                  <span className="text-emerald-400 font-mono font-bold">✓ PASSED</span>
                ) : (
                  <span className="text-amber-400 font-mono">⏳ PENDING</span>
                )}
              </div>
              {selectedRack.picklingData && (
                <p className="text-slate-400 mt-1">
                  Tank: {selectedRack.picklingData.acidTank} | Time: {selectedRack.picklingData.durationMins} mins | By: {selectedRack.picklingData.operator}
                </p>
              )}
            </div>

            {/* 3. Step 03: 浸锌状态 */}
            <div className="mb-3 bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Step 03: Dipping (浸锌)</span>
                {selectedRack.dippingData ? (
                  <span className="text-emerald-400 font-mono font-bold">✓ PASSED</span>
                ) : (
                  <span className="text-amber-400 font-mono">⏳ PENDING</span>
                )}
              </div>
              {selectedRack.dippingData && (
                <p className="text-slate-400 mt-1">
                  Temp: {selectedRack.dippingData.zincTemp}°C | Time: {selectedRack.dippingData.dipDurationSecs}s | By: {selectedRack.dippingData.operator}
                </p>
              )}
            </div>

            {/* 4. Step 04: 卸架与质检 */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Step 04: QC & Unloading (卸架质检)</span>
                {selectedRack.unloadingData ? (
                  <span className="text-emerald-400 font-mono font-bold">✓ COMPLETED</span>
                ) : (
                  <span className="text-amber-400 font-mono">⏳ PENDING</span>
                )}
              </div>
            </div>

          </div>

          {/* 右侧：自动匹配出的当前待执行表单 (5栏) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-cyan-800/80 flex flex-col justify-between">
            <div>
              
              <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">Action Required</span>
                  <h3 className="text-base font-bold text-white">
                    {currentAutoStage === 'PICKLING' && '⚡ Perform Step 02: Pickling'}
                    {currentAutoStage === 'DIPPING' && '🔥 Perform Step 03: Dipping'}
                    {currentAutoStage === 'UNLOADING' && '📦 Perform Step 04: QC & Unloading'}
                    {currentAutoStage === 'COMPLETED' && '🎉 All Steps Completed'}
                  </h3>
                </div>
                <span className="text-xs bg-cyan-950 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded border border-cyan-800">
                  Rack #{selectedRack.rackNo}
                </span>
              </div>

              {/* 动态装载对应工序的输入项 */}
              {currentAutoStage === 'PICKLING' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Acid Tank Selected (选择酸槽):</label>
                    <select
                      value={formData.acidTank}
                      onChange={(e) => setFormData({ ...formData, acidTank: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    >
                      <option>Acid Tank #1 (HCl 12%)</option>
                      <option>Acid Tank #2 (HCl 15%)</option>
                      <option>Acid Tank #3 (Degreasing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Soak Duration in Mins (酸洗时长/分钟):</label>
                    <input
                      type="number"
                      value={formData.soakDurationMins}
                      onChange={(e) => setFormData({ ...formData, soakDurationMins: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {currentAutoStage === 'DIPPING' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Zinc Kettle Temp (锌锅温度 °C):</label>
                    <input
                      type="number"
                      value={formData.zincTemp}
                      onChange={(e) => setFormData({ ...formData, zincTemp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Dipping Duration in Secs (浸锌秒数):</label>
                    <input
                      type="number"
                      value={formData.dipDurationSecs}
                      onChange={(e) => setFormData({ ...formData, dipDurationSecs: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {currentAutoStage === 'UNLOADING' && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/50 rounded text-emerald-300">
                    <p className="font-semibold">Final Step: Unload & Release Rack</p>
                    <p className="text-[11px] text-emerald-400/80 mt-1">Submitting will mark Rack #{selectedRack.rackNo} as EMPTY for the next loading cycle.</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Defect / Re-galvanize Pcs (瑕疵/需重镀件数):</label>
                    <input
                      type="number"
                      value={formData.defectQty}
                      onChange={(e) => setFormData({ ...formData, defectQty: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {currentAutoStage !== 'COMPLETED' && (
                <div className="mt-3">
                  <label className="block text-slate-400 text-xs mb-1">Operator Notes (备注):</label>
                  <textarea
                    placeholder="Optional notes..."
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  ></textarea>
                </div>
              )}

            </div>

            {/* 提交按钮 */}
            {currentAutoStage !== 'COMPLETED' ? (
              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={handleSubmitProcess}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg cursor-pointer transition-all"
                >
                  Confirm & Save Step [{currentAutoStage}] →
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded text-center text-xs text-slate-400 mt-4">
                This rack has finished all processing steps.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}