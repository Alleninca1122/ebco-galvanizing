import React, { useState } from 'react';

// ==========================================
// EBCO_GALV_PRODUCTION_FORM_V2
// ==========================================

const WORKPIECE_TYPES = [
  'Structural Steel Beam',
  'Channel / Angle Iron',
  'Hollow Structural Section (HSS)',
  'Plate / Flange',
  'Custom Fabrication / Weldment',
  'Handrail / Grating'
];

const QTY_UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'bundles', label: 'Bundles' },
  { value: 'sets', label: 'Sets' }
];

const RIGGING_SPECS = [
  { id: 'wire_rope_3_8', label: '3/8" Wire Rope' },
  { id: 'wire_rope_1_2', label: '1/2" Wire Rope' },
  { id: 'alloy_chain_3_8', label: '3/8" Alloy Chain' },
  { id: 'high_temp_strap', label: 'High-Temp Webbing Strap' }
];

const SURFACE_LEVELS = [
  { value: 'None', label: 'None' },
  { value: 'Light', label: 'Light' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Heavy', label: 'Heavy' }
];

export default function EbcoGalvProductionFormV2() {
  // 模拟当前登录用户
  const currentUser = { id: '7222' };

  // 表单状态管理
  const [jobs, setJobs] = useState([
    {
      customerName: 'Acme Steel Corp',
      orderNumber: 'ORD-2026-901',
      batchNumber: 'BATCH-01',
      rackNumber: 'RACK-A4',
      loadId: 'LD-7222-01',
      workpieces: [
        {
          id: 'wp-1',
          workpieceType: '',
          quantity: '10',
          unit: 'pcs',
          weightLb: '500',
          oilPaintLevel: '',
          rustLevel: '',
          cavity: false,
          ventingDrainage: false,
          angleRequirement: false,
          topClearance: false,
          hangingMode: 'INDIVIDUAL',
          hangingPoints: '1',
          point1SpecId: 'wire_rope_3_8',
          point1Strands: '2',
          point2SpecId: 'wire_rope_3_8',
          point2Strands: '2'
        }
      ]
    }
  ]);

  const [operatorSignoffId, setOperatorSignoffId] = useState('');

  // 辅助函数：更新工件字段
  const handleWorkpieceChange = (jobIndex, wpIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces[wpIndex][field] = value;
    setJobs(updatedJobs);
  };

  // 辅助函数：更新Job基础字段
  const handleJobChange = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex][field] = value;
    setJobs(updatedJobs);
  };

  // 添加工件行
  const addWorkpieceRow = (jobIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.push({
      id: `wp-${Date.now()}`,
      workpieceType: '',
      quantity: '1',
      unit: 'pcs',
      weightLb: '',
      oilPaintLevel: '',
      rustLevel: '',
      cavity: false,
      ventingDrainage: false,
      angleRequirement: false,
      topClearance: false,
      hangingMode: 'INDIVIDUAL',
      hangingPoints: '1',
      point1SpecId: 'wire_rope_3_8',
      point1Strands: '2',
      point2SpecId: 'wire_rope_3_8',
      point2Strands: '2'
    });
    setJobs(updatedJobs);
  };

  // 删除工件行
  const removeWorkpieceRow = (jobIndex, wpIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.splice(wpIndex, 1);
    setJobs(updatedJobs);
  };

  // 一键重置 Auto ID
  const handleResetLoadId = (jobIndex) => {
    handleJobChange(jobIndex, 'loadId', `LD-${currentUser.id}-${Math.floor(Math.random() * 900 + 100)}`);
  };

  // 简易安全阻断逻辑检查：检查是否有未填写的必选项
  const isFormBlocked = !operatorSignoffId || jobs.some(job => 
    job.workpieces.some(wp => !wp.workpieceType || !wp.oilPaintLevel || !wp.rustLevel)
  );

  return (
    <div className="max-w-5xl mx-auto bg-slate-950 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-2xl font-sans">
      
      {/* 头部标题 */}
      <div className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            🏭 EBCO Hot-Dip Galvanizing Production & SOP Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard Operating Procedure (SOP) & Rigging Safety Compliance Form V2
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          Operator ID: <span className="font-bold">{currentUser.id}</span>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted successfully!'); }} className="space-y-6">

        {/* 1. 4-Step SOP 指南参考网格 UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 1</span>
            <h4 className="text-xs font-semibold text-slate-200">孔位开孔 (Venting)</h4>
            <p className="text-[11px] text-slate-400 mt-1">Ensure correct gas/air venting & drainage holes.</p>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 2</span>
            <h4 className="text-xs font-semibold text-slate-200">表面评估 (Surface)</h4>
            <p className="text-[11px] text-slate-400 mt-1">Record oil/paint/rust to determine bath immersion times.</p>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 3</span>
            <h4 className="text-xs font-semibold text-slate-200">倾角要求 (Angle)</h4>
            <p className="text-[11px] text-slate-400 mt-1">Optimize dipping angle to prevent air pockets.</p>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 4</span>
            <h4 className="text-xs font-semibold text-slate-200">尺寸间隙 (Clearance)</h4>
            <p className="text-[11px] text-slate-400 mt-1">Verify top clearance & max depth limits.</p>
          </div>
        </div>

        {/* 循环 Job 模块 */}
        {jobs.map((job, jobIndex) => (
          <div key={jobIndex} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4">
            
            {/* Customer Job 模块基础布局 & Rack / Load ID 绑定控制 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 pb-3 border-b border-slate-800">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={job.customerName}
                  onChange={(e) => handleJobChange(jobIndex, 'customerName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Order #</label>
                <input
                  type="text"
                  value={job.orderNumber}
                  onChange={(e) => handleJobChange(jobIndex, 'orderNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Batch #</label>
                <input
                  type="text"
                  value={job.batchNumber}
                  onChange={(e) => handleJobChange(jobIndex, 'batchNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rack #</label>
                <input
                  type="text"
                  value={job.rackNumber}
                  onChange={(e) => handleJobChange(jobIndex, 'rackNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] text-slate-400">Load ID</label>
                  <button
                    type="button"
                    onClick={() => handleResetLoadId(jobIndex)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                  >
                    Auto ID
                  </button>
                </div>
                <input
                  type="text"
                  value={job.loadId}
                  onChange={(e) => handleJobChange(jobIndex, 'loadId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Workpieces 列表 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Workpiece Lines ({job.workpieces.length})
                </h3>
                <button
                  type="button"
                  onClick={() => addWorkpieceRow(jobIndex)}
                  className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-lg hover:bg-cyan-900 transition-all font-bold"
                >
                  + Add Workpiece Line
                </button>
              </div>

              {job.workpieces.map((wp, wpIndex) => {
                const qty = parseFloat(wp.quantity) || 0;
                const totalW = parseFloat(wp.weightLb) || 0;
                const unitW = qty > 0 ? (totalW / qty).toFixed(1) : 0;

                return (
                  <div key={wp.id} className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-3 relative">
                    
                    {/* Top Bar: Basic Workpiece Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="md:col-span-1">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Workpiece Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={wp.workpieceType}
                          onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'workpieceType', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                          required
                        >
                          <option value="">-- Select --</option>
                          {WORKPIECE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Qty <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={wp.quantity}
                          onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Unit</label>
                        <select
                          value={wp.unit}
                          onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'unit', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                        >
                          {QTY_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] text-slate-400">Total Weight (lb)</label>
                          {unitW > 0 && (
                            <span className="text-[10px] text-cyan-400 font-mono font-bold">
                              {unitW} lb/pc
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder="Total lbs"
                          value={wp.weightLb}
                          onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'weightLb', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] text-slate-400 mb-1">Operator</label>
                          <input
                            type="text"
                            disabled
                            value={currentUser?.id || '7222'}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-cyan-400 font-bold cursor-not-allowed"
                          />
                        </div>
                        {job.workpieces.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWorkpieceRow(jobIndex, wpIndex)}
                            className="mt-4 text-xs text-rose-400 hover:text-rose-300 font-bold px-1"
                            title="Delete line"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Surface Evaluation Checklist Component (Modified per requirements) */}
                    <div className="pt-2.5 border-t border-slate-800/80 bg-slate-950/40 p-2.5 rounded-md space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800/60">
                        <div>
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            🔍 Surface Inspection & Pickling Time Evaluation
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Inspect oil, paint, and rust levels (None / Light / Medium / Heavy). Record these values to determine precise degreasing and acid immersion durations for pickling operators.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Oil / Paint Level <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={wp.oilPaintLevel}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'oilPaintLevel', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                            required
                          >
                            <option value="">-- Select --</option>
                            {SURFACE_LEVELS.map(lvl => (
                              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Rust Level <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={wp.rustLevel}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'rustLevel', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                            required
                          >
                            <option value="">-- Select --</option>
                            {SURFACE_LEVELS.map(lvl => (
                              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 4-Step Switches (Cavity, Venting/Drainage, Angle, Top Clearance) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition-all ${wp.cavity ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={wp.cavity}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'cavity', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Cavity Present</span>
                        </label>
                        <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition-all ${wp.ventingDrainage ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={wp.ventingDrainage}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'ventingDrainage', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Venting / Drainage OK</span>
                        </label>
                        <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition-all ${wp.angleRequirement ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={wp.angleRequirement}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'angleRequirement', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Angle Requirement</span>
                        </label>
                        <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition-all ${wp.topClearance ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={wp.topClearance}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'topClearance', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Top Clearance & Max Depth</span>
                        </label>
                      </div>
                    </div>

                    {/* Rigging & Hanging Setup for THIS Workpiece */}
                    <div className="pt-2.5 border-t border-slate-800/80 bg-slate-950/40 p-2.5 rounded-md space-y-2">
                      
                      {/* Top Mode Selection */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800/60">
                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                          ⚙️ Hanging & Rigging for {wp.workpieceType || `Line #${wpIndex + 1}`}
                        </span>

                        <div className="flex items-center gap-3">
                          <div className="inline-flex bg-slate-900 p-0.5 rounded border border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleWorkpieceChange(jobIndex, wpIndex, 'hangingMode', 'INDIVIDUAL')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                wp.hangingMode !== 'STRING'
                                  ? 'bg-cyan-600 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🎯 Individual Hanging
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWorkpieceChange(jobIndex, wpIndex, 'hangingMode', 'STRING')}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                wp.hangingMode === 'STRING'
                                  ? 'bg-cyan-600 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              ⛓️ String Hanging
                            </button>
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleWorkpieceChange(jobIndex, wpIndex, 'hangingPoints', '1')}
                              className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                wp.hangingPoints === '1'
                                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              }`}
                            >
                              📍 1 Point
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWorkpieceChange(jobIndex, wpIndex, 'hangingPoints', '2')}
                              className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                wp.hangingPoints === '2'
                                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              }`}
                            >
                              📍📍 2 Points
                            </button>
                          </div>
                        </div>
                      </div>

                      {wp.hangingMode === 'STRING' && (
                        <div className="text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-900/60 px-2 py-1 rounded">
                          💡 <strong>String Mode Active:</strong> All {qty || 'N'} {wp.unit || 'pcs'} are chained together; total weight ({totalW || 0} lbs) is loaded onto the top rigging points.
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded border border-slate-800">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              {wp.hangingPoints === '2' ? 'Point 1 Spec *' : 'Hanging Spec *'}
                            </label>
                            <select
                              value={wp.point1SpecId}
                              onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'point1SpecId', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-100"
                              required
                            >
                              {RIGGING_SPECS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Strands / Lines *</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 3"
                              value={wp.point1Strands}
                              onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'point1Strands', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              required
                            />
                          </div>
                        </div>

                        {wp.hangingPoints === '2' && (
                          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded border border-slate-800">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Point 2 Spec *</label>
                              <select
                                value={wp.point2SpecId}
                                onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'point2SpecId', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-100"
                                required
                              >
                                {RIGGING_SPECS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Strands / Lines *</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 3"
                                value={wp.point2Strands}
                                onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'point2Strands', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {/* 3. SIGN-OFF & SUBMIT SECTION */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          
          {/* Employee ID Sign-off Input Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase">
              ✍️ Employee Sign-off / Responsibility Confirmation <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Please enter your Employee ID as a digital sign-off confirming that all SOP checks and rigging safety requirements have been verified.
            </p>
            <input
              type="text"
              placeholder="Enter your Employee ID (e.g. 7222)"
              value={operatorSignoffId}
              onChange={(e) => setOperatorSignoffId(e.target.value)}
              className="w-full md:w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isFormBlocked}
            className={`w-full py-3.5 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all ${
              isFormBlocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer'
            }`}
          >
            {isFormBlocked
              ? '🚫 CANNOT SUBMIT: COMPLETE REQUIRED SELECTORS ABOVE'
              : '✍️ Confirm & Sign-off →'}
          </button>
        </div>

      </form>
    </div>
  );
}