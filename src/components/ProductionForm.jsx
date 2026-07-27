import React, { useState } from 'react';

// Standard Galvanizing Workpiece Types
const WORKPIECE_TYPES = [
  'Anchor', 'Angle', 'Beam', 'Bracket', 'Frame', 
  'Grating', 'Ladder', 'Mesh', 'Pipe', 'Plate', 
  'Pole', 'Railing', 'Rebar', 'Rod', 'Tube', 'Washer', 'Others'
];

// Quantity Unit Options
const QTY_UNITS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'bag', label: 'bag' },
  { value: 'box', label: 'box' }
];

// Hook Option on top, followed by 30 Fixed Racks
const RACK_OPTIONS = [
  { id: 'HOOK', label: '🪝 Hook (Direct / Hoist)' },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `RACK_${i + 1}`,
    label: `Rack #${i + 1}`
  }))
];

// Rigging Specs
const RIGGING_SPECS = [
  { id: 'WIRE_16', label: '#16 Wire' },
  { id: 'WIRE_14', label: '#14 Wire' },
  { id: 'WIRE_12', label: '#12 Wire' },
  { id: 'WIRE_10', label: '#10 Wire' },
  { id: 'CHAIN_3_8', label: '3/8" Chain' },
  { id: 'CHAIN_1_2', label: '1/2" Chain' }
];

// Initial State Templates
const createInitialWorkpiece = () => ({
  id: Date.now() + Math.random(),
  workpieceType: '',
  quantity: 1,
  unit: 'pcs',
  weightLb: '',
  hangingMode: 'INDIVIDUAL', // INDIVIDUAL | STRING
  hangingPoints: '1',      // '1' | '2'
  point1SpecId: 'WIRE_14',
  point1Strands: 1,
  point2SpecId: 'WIRE_14',
  point2Strands: 1
});

const createInitialJob = () => ({
  id: Date.now() + Math.random(),
  customerName: '',
  jobNumber: '',
  workpieces: [createInitialWorkpiece()]
});

export default function GalvanizingForm({ currentUser }) {
  // --- Form State ---
  const [rackId, setRackId] = useState('');
  const [loadId, setLoadId] = useState('');
  
  // Surface / Preparation Checks
  const [hasPaintOrVarnish, setHasPaintOrVarnish] = useState('NO');
  const [hasHeavyRust, setHasHeavyRust] = useState('NO');
  const [hasOilOrGrease, setHasOilOrGrease] = useState('NO');

  // SOP Safety Checklist
  const [sopVentHoles, setSopVentHoles] = useState(false);
  const [sopDrainHoles, setSopDrainHoles] = useState(false);
  const [sopEnclosedCavity, setSopEnclosedCavity] = useState(false);
  const [sopRiggingSecure, setSopRiggingSecure] = useState(false);

  // Customer Jobs & Workpieces
  const [jobs, setJobs] = useState([createInitialJob()]);

  // Operator Sign-off
  const [operatorSignoffId, setOperatorSignoffId] = useState('');

  // --- Handlers ---
  const handleAddJob = () => {
    setJobs([...jobs, createInitialJob()]);
  };

  const handleRemoveJob = (jobIndex) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter((_, idx) => idx !== jobIndex));
    }
  };

  const handleJobChange = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex][field] = value;
    setJobs(updatedJobs);
  };

  const handleAddWorkpieceRow = (jobIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.push(createInitialWorkpiece());
    setJobs(updatedJobs);
  };

  const handleRemoveWorkpieceRow = (jobIndex, wpIndex) => {
    const updatedJobs = [...jobs];
    if (updatedJobs[jobIndex].workpieces.length > 1) {
      updatedJobs[jobIndex].workpieces = updatedJobs[jobIndex].workpieces.filter((_, idx) => idx !== wpIndex);
      setJobs(updatedJobs);
    }
  };

  const handleWorkpieceChange = (jobIndex, wpIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces[wpIndex][field] = value;
    setJobs(updatedJobs);
  };

  // Block submission if safety issues or enclosed cavities are unchecked
  const isFormBlocked = !sopVentHoles || !sopDrainHoles || sopEnclosedCavity || !sopRiggingSecure;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormBlocked) {
      alert('Cannot submit: Please resolve all SOP safety hazards before proceeding.');
      return;
    }

    const payload = {
      rackId,
      loadId,
      surfacePreparation: {
        hasPaintOrVarnish,
        hasHeavyRust,
        hasOilOrGrease
      },
      sopSafetyCheck: {
        sopVentHoles,
        sopDrainHoles,
        sopEnclosedCavity,
        sopRiggingSecure
      },
      jobs,
      operatorSignoffId,
      submittedAt: new Date().toISOString()
    };

    console.log('Submitted Galvanizing Form Payload:', payload);
    alert('Form submitted successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-cyan-400">
            🔥 GALVANIZING RACK & RIGGING LOG
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard Operating Procedure & Load Safety Verification
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          Operator: <span className="font-bold">{currentUser?.id || '7222'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. RACK & SOP SETUP SECTION */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            📌 Step 1: Rack Assignment & Surface Assessment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Rack Selection */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Rack / Hook ID <span className="text-rose-400">*</span>
              </label>
              <select
                value={rackId}
                onChange={(e) => setRackId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="">-- Select Rack --</option>
                {RACK_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Load ID */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Load / Batch ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. L-2026-088"
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Surface Conditions */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Paint / Varnish?</label>
              <select
                value={hasPaintOrVarnish}
                onChange={(e) => setHasPaintOrVarnish(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="NO">No Paint/Varnish</option>
                <option value="YES">Yes (Requires Blast)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Heavy Rust / Scale?</label>
              <select
                value={hasHeavyRust}
                onChange={(e) => setHasHeavyRust(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="NO">Normal / Light</option>
                <option value="YES">Heavy (Extra Acid)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Oil / Grease?</label>
              <select
                value={hasOilOrGrease}
                onChange={(e) => setHasOilOrGrease(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="NO">Clean Surface</option>
                <option value="YES">Heavy Grease</option>
              </select>
            </div>
          </div>

          {/* SOP Safety Checklist Grid */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              ⚠️ Mandatory SOP Venting & Safety Verification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={sopVentHoles}
                  onChange={(e) => setSopVentHoles(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Vent Holes Verified (High Points)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={sopDrainHoles}
                  onChange={(e) => setSopDrainHoles(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Drain Holes Verified (Low Points)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={sopRiggingSecure}
                  onChange={(e) => setSopRiggingSecure(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Rigging Wire/Chain Tied Securely</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-rose-950/30 p-2 rounded border border-rose-900/50 text-rose-300 hover:border-rose-800">
                <input
                  type="checkbox"
                  checked={sopEnclosedCavity}
                  onChange={(e) => setSopEnclosedCavity(e.target.checked)}
                  className="rounded border-rose-700 text-rose-500 focus:ring-0"
                />
                <span className="font-bold">HAZARD: Unvented Sealed Cavity Exists!</span>
              </label>
            </div>
          </div>
        </div>

        {/* 2. CUSTOMER JOBS & WORKPIECE MAPPING */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              📦 Step 2: Workpieces & Rigging Details
            </h2>
            <button
              type="button"
              onClick={handleAddJob}
              className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded-lg text-xs font-bold transition-all"
            >
              + Add Customer Job
            </button>
          </div>

          {jobs.map((job, jobIndex) => (
            <div key={job.id} className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 space-y-4 relative">
              
              {/* Job Header Inputs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">
                      Customer Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Steel Ltd."
                      value={job.customerName}
                      onChange={(e) => handleJobChange(jobIndex, 'customerName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">
                      Job / Work Order # <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WO-99401"
                      value={job.jobNumber}
                      onChange={(e) => handleJobChange(jobIndex, 'jobNumber', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleAddWorkpieceRow(jobIndex)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700"
                  >
                    + Add Line
                  </button>
                  {jobs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveJob(jobIndex)}
                      className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded text-xs font-semibold border border-rose-800"
                    >
                      Delete Job
                    </button>
                  )}
                </div>
              </div>

              {/* Workpieces Table/Rows */}
              <div className="space-y-3">
                {job.workpieces.map((wp, wpIndex) => {
                  const qty = Number(wp.quantity) || 0;
                  const totalW = Number(wp.weightLb) || 0;
                  const unitW = qty > 0 && totalW > 0 ? (totalW / qty).toFixed(1) : 0;

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