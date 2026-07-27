import React, { useState } from 'react';

// 常量定义
const WORKPIECE_TYPES = [
  'Structural Steel',
  'Pipes / Tubes',
  'Plates / Sheets',
  'Custom Fabrications',
  'Small Parts / Hardware'
];

const QTY_UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'lbs', label: 'Pounds (lbs)' }
];

const RIGGING_SPECS = [
  { id: 'wire_1_16', label: '1/16" Steel Wire (100 lbs)' },
  { id: 'wire_3_32', label: '3/32" Steel Wire (200 lbs)' },
  { id: 'wire_1_8', label: '1/8" Steel Wire (400 lbs)' },
  { id: 'chain_1_4', label: '1/4" Alloy Chain (1200 lbs)' },
  { id: 'custom_hook', label: 'Custom Rack Hook' }
];

export default function GalvanizingRackingForm({ currentUser }) {
  // 1. 状态定义
  const [rackId, setRackId] = useState('');
  const [loadId, setLoadId] = useState('');
  const [operatorSignoffId, setOperatorSignoffId] = useState('');

  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      customerName: '',
      orderNumber: '',
      batchNumber: '',
      oilPaintLevel: 'None / Clean',
      rustLevel: 'Light / Normal',
      safetyChecklist: {
        ventingHoles: false,
        drainageHoles: false,
        hangingAngle: false,
        topClearance: false,
        immersionDepth: false
      },
      workpieces: [
        {
          id: Date.now() + 1,
          workpieceType: '',
          quantity: '',
          unit: 'pcs',
          weightLb: '',
          hangingMode: 'INDIVIDUAL',
          hangingPoints: '1',
          point1SpecId: 'wire_1_16',
          point1Strands: '1',
          point2SpecId: 'wire_1_16',
          point2Strands: '1'
        }
      ]
    }
  ]);

  // 2. 事件处理函数
  const handleJobChange = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex][field] = value;
    setJobs(updatedJobs);
  };

  const handleSurfaceAssessmentChange = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex][field] = value;
    setJobs(updatedJobs);
  };

  const handleSafetyCheckToggle = (jobIndex, checkKey) => {
    const updatedJobs = [...jobs];
    const currentVal = updatedJobs[jobIndex].safetyChecklist[checkKey];
    updatedJobs[jobIndex].safetyChecklist[checkKey] = !currentVal;
    setJobs(updatedJobs);
  };

  const handleWorkpieceChange = (jobIndex, wpIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces[wpIndex][field] = value;
    setJobs(updatedJobs);
  };

  const addWorkpieceRow = (jobIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.push({
      id: Date.now(),
      workpieceType: '',
      quantity: '',
      unit: 'pcs',
      weightLb: '',
      hangingMode: 'INDIVIDUAL',
      hangingPoints: '1',
      point1SpecId: 'wire_1_16',
      point1Strands: '1',
      point2SpecId: 'wire_1_16',
      point2Strands: '1'
    });
    setJobs(updatedJobs);
  };

  const removeWorkpieceRow = (jobIndex, wpIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.splice(wpIndex, 1);
    setJobs(updatedJobs);
  };

  const addJobCard = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        customerName: '',
        orderNumber: '',
        batchNumber: '',
        oilPaintLevel: 'None / Clean',
        rustLevel: 'Light / Normal',
        safetyChecklist: {
          ventingHoles: false,
          drainageHoles: false,
          hangingAngle: false,
          topClearance: false,
          immersionDepth: false
        },
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '',
            unit: 'pcs',
            weightLb: '',
            hangingMode: 'INDIVIDUAL',
            hangingPoints: '1',
            point1SpecId: 'wire_1_16',
            point1Strands: '1',
            point2SpecId: 'wire_1_16',
            point2Strands: '1'
          }
        ]
      }
    ]);
  };

  const removeJobCard = (jobIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs.splice(jobIndex, 1);
    setJobs(updatedJobs);
  };

  // 3. 安全规则校验逻辑：检查是否有未完成的 Safety Check
  const isFormBlocked = jobs.some((job) => {
    const checks = job.safetyChecklist;
    return !checks.ventingHoles || !checks.drainageHoles || !checks.hangingAngle || !checks.topClearance || !checks.immersionDepth;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormBlocked) {
      alert('Cannot submit: Please ensure all Job Safety Checklist items are verified.');
      return;
    }
    const formData = {
      rackId,
      loadId,
      operatorSignoffId,
      jobs
    };
    console.log('Submitting Galvanizing Racking Data:', formData);
    alert('Racking entry submitted successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen font-sans space-y-6">
      
      {/* 1. SOP Reference Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
          📋 Standard Operating Procedure (SOP) Checklist
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">1. Pre-Assessment</span>
            <p className="text-slate-400 text-[11px]">Inspect surface condition, oil levels, heavy rust, and sealed hollow sections.</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">2. Venting & Drainage</span>
            <p className="text-slate-400 text-[11px]">Ensure adequate vent holes exist at top/bottom to prevent explosion & air pockets.</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">3. Rigging & Angles</span>
            <p className="text-slate-400 text-[11px]">Verify wire gauge against weight. Hang workpieces at optimal drainage angle.</p>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">4. Rack Clearance</span>
            <p className="text-slate-400 text-[11px]">Maintain required top clearance and maximum bath immersion depth constraints.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Rack & Load Identification Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            🏷️ Rack & Load Identification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rack ID / Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. RACK-A-12"
                value={rackId}
                onChange={(e) => setRackId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Load Batch ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. LOAD-2026-081"
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Jobs Section */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              📦 Associated Jobs on Rack
            </h2>
            <button
              type="button"
              onClick={addJobCard}
              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              + Add Customer Job Card
            </button>
          </div>

          {jobs.map((job, jobIndex) => (
            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md relative">
              
              {/* Job Card Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-400">Job #{jobIndex + 1}</span>
                {jobs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJobCard(jobIndex)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Remove Job
                  </button>
                )}
              </div>

              {/* Job Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Customer Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={job.customerName}
                    onChange={(e) => handleJobChange(jobIndex, 'customerName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Order # <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    placeholder="Order Number"
                    value={job.orderNumber}
                    onChange={(e) => handleJobChange(jobIndex, 'orderNumber', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Batch #</label>
                  <input
                    type="text"
                    placeholder="Batch Number"
                    value={job.batchNumber}
                    onChange={(e) => handleJobChange(jobIndex, 'batchNumber', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Surface Assessment UI */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Surface Assessment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Oil / Paint Level</label>
                    <select
                      value={job.oilPaintLevel}
                      onChange={(e) => handleSurfaceAssessmentChange(jobIndex, 'oilPaintLevel', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="None / Clean">None / Clean</option>
                      <option value="Light Oil">Light Oil</option>
                      <option value="Heavy Paint/Lacquer (Requires Stripping)">Heavy Paint/Lacquer (Requires Stripping)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Rust Level</label>
                    <select
                      value={job.rustLevel}
                      onChange={(e) => handleSurfaceAssessmentChange(jobIndex, 'rustLevel', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Light / Normal">Light / Normal</option>
                      <option value="Heavy Scale (Extended Pickling)">Heavy Scale (Extended Pickling)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Safety Checklist */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Job Safety Checklist</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSafetyCheckToggle(jobIndex, 'ventingHoles')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      job.safetyChecklist.ventingHoles
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>1. Hollow Cavity Vent Holes</span>
                    <span>{job.safetyChecklist.ventingHoles ? '✓' : '✗'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSafetyCheckToggle(jobIndex, 'drainageHoles')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      job.safetyChecklist.drainageHoles
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>2. Pickle Fluid Drainage Holes</span>
                    <span>{job.safetyChecklist.drainageHoles ? '✓' : '✗'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSafetyCheckToggle(jobIndex, 'hangingAngle')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      job.safetyChecklist.hangingAngle
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>3. Hanging Drainage Angle</span>
                    <span>{job.safetyChecklist.hangingAngle ? '✓' : '✗'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSafetyCheckToggle(jobIndex, 'topClearance')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      job.safetyChecklist.topClearance
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>4. Rack Top Clearance</span>
                    <span>{job.safetyChecklist.topClearance ? '✓' : '✗'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSafetyCheckToggle(jobIndex, 'immersionDepth')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      job.safetyChecklist.immersionDepth
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>5. Max Immersion Depth</span>
                    <span>{job.safetyChecklist.immersionDepth ? '✓' : '✗'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Workpieces List */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    🛠️ Workpieces Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={() => addWorkpieceRow(jobIndex)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-[11px] font-bold px-2.5 py-1 rounded transition-all"
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
        </div>

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
              placeholder="Enter your Employee ID (e.g. 2324)"
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
              ? '🚫 CANNOT SUBMIT: FIX SAFETY HAZARDS ABOVE'
              : '✍️ Confirm & Sign-off →'}
          </button>
        </div>

      </form>
    </div>
  );
}