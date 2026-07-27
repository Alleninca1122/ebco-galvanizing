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
  { id: 'HOOK', label: '🪝 HOOK (Standard Hook)' },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `RACK_${i + 1}`,
    label: `🧺 RACK ${i + 1}`
  }))
];

// Preset Rigging Wire Specifications
const RIGGING_SPECS = [
  { id: 'WIRE_14', label: '14# Wire (Light)' },
  { id: 'WIRE_12', label: '12# Wire (Standard)' },
  { id: 'WIRE_10', label: '10# Wire (Heavy)' },
  { id: 'CHAIN_QUICK', label: 'Chain + Quick Link' }
];

export default function GalvanizingWorksheet({ currentUser, onSubmit }) {
  // Form Level States
  const [operatorSignoffId, setOperatorSignoffId] = useState('');
  const [isFormBlocked, setIsFormBlocked] = useState(false);

  // Jobs Array State
  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      jobNo: '',
      rackType: 'HOOK',
      workpieces: [
        {
          id: Date.now() + 1,
          workpieceType: '',
          quantity: '1',
          unit: 'pcs',
          weightLb: '',
          hangingMode: 'INDIVIDUAL',
          hangingPoints: '1',
          point1SpecId: 'WIRE_12',
          point1Strands: '1',
          point2SpecId: 'WIRE_12',
          point2Strands: '1'
        }
      ]
    }
  ]);

  // Handlers for Job & Workpiece Changes
  const handleJobChange = (jobIndex, field, value) => {
    const updated = [...jobs];
    updated[jobIndex][field] = value;
    setJobs(updated);
  };

  const handleWorkpieceChange = (jobIndex, wpIndex, field, value) => {
    const updated = [...jobs];
    updated[jobIndex].workpieces[wpIndex][field] = value;
    setJobs(updated);
  };

  const addJobRow = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        jobNo: '',
        rackType: 'HOOK',
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '1',
            unit: 'pcs',
            weightLb: '',
            hangingMode: 'INDIVIDUAL',
            hangingPoints: '1',
            point1SpecId: 'WIRE_12',
            point1Strands: '1',
            point2SpecId: 'WIRE_12',
            point2Strands: '1'
          }
        ]
      }
    ]);
  };

  const removeJobRow = (jobIndex) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter((_, idx) => idx !== jobIndex));
    }
  };

  const addWorkpieceRow = (jobIndex) => {
    const updated = [...jobs];
    updated[jobIndex].workpieces.push({
      id: Date.now(),
      workpieceType: '',
      quantity: '1',
      unit: 'pcs',
      weightLb: '',
      hangingMode: 'INDIVIDUAL',
      hangingPoints: '1',
      point1SpecId: 'WIRE_12',
      point1Strands: '1',
      point2SpecId: 'WIRE_12',
      point2Strands: '1'
    });
    setJobs(updated);
  };

  const removeWorkpieceRow = (jobIndex, wpIndex) => {
    const updated = [...jobs];
    if (updated[jobIndex].workpieces.length > 1) {
      updated[jobIndex].workpieces = updated[jobIndex].workpieces.filter((_, idx) => idx !== wpIndex);
      setJobs(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormBlocked) return;
    
    const formData = {
      operatorSignoffId,
      jobs,
      submittedAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form Submitted Successfully:', formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-slate-950 text-slate-100 min-h-screen font-sans">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header & Add Job Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-cyan-400">
              ⚡ Hot-Dip Galvanizing SOP & Rigging Worksheet
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Job Workpiece Entry & Safety Rigging Verification
            </p>
          </div>
          <button
            type="button"
            onClick={addJobRow}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <span>➕</span> Add Another Job
          </button>
        </div>

        {/* 2. JOBS LIST */}
        <div className="space-y-6">
          {jobs.map((job, jobIndex) => (
            <div key={job.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
              
              {/* Job Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="px-2.5 py-1 bg-cyan-950 text-cyan-400 text-xs font-mono font-bold rounded border border-cyan-800">
                    JOB #{jobIndex + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Job No. *"
                    value={job.jobNo}
                    onChange={(e) => handleJobChange(jobIndex, 'jobNo', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500 w-full sm:w-48"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400 whitespace-nowrap">Rack / Fixture:</label>
                    <select
                      value={job.rackType}
                      onChange={(e) => handleJobChange(jobIndex, 'rackType', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {RACK_OPTIONS.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {jobs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJobRow(jobIndex)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/40 rounded border border-rose-900/60"
                      title="Delete whole job"
                    >
                      🗑️ Delete Job
                    </button>
                  )}
                </div>
              </div>

              {/* Workpieces Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    📦 Workpieces & Rigging Setup
                  </h3>
                  <button
                    type="button"
                    onClick={() => addWorkpieceRow(jobIndex)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/60"
                  >
                    <span>➕</span> Add Workpiece Line
                  </button>
                </div>

                {job.workpieces.map((wp, wpIndex) => {
                  const qty = parseFloat(wp.quantity) || 0;
                  const totalW = parseFloat(wp.weightLb) || 0;
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