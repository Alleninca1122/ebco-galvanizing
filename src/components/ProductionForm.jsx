import React, { useState } from 'react';

// Workpiece Types
const WORKPIECE_TYPES = [
  'Anchor', 'Angle', 'Beam', 'Bracket', 'Frame', 
  'Grating', 'Ladder', 'Mesh', 'Pipe', 'Plate', 
  'Pole', 'Railing', 'Rebar', 'Rod', 'Tube', 'Washer', 'Others'
];

// Rigging Spec Options (Pure English)
const RIGGING_SPECS = [
  { id: '14_WIRE', label: '14 Gauge Wire', type: 'WIRE', swl: 50 },
  { id: '12_WIRE', label: '12 Gauge Wire', type: 'WIRE', swl: 75 },
  { id: '10_WIRE', label: '10 Gauge Wire', type: 'WIRE', swl: 150 },
  { id: '38_CHAIN', label: '3/8" High Test Chain', type: 'CHAIN', swl: 4000 },
  { id: '12_CHAIN', label: '1/2" High Test Chain', type: 'CHAIN', swl: 6500 },
  { id: 'CLAMP', label: 'Heavy Duty Lifting Clamp', type: 'CLAMP', swl: 10000 },
];

const QTY_UNITS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'bag', label: 'bag' },
  { value: 'box', label: 'box' }
];

const RACK_OPTIONS = [
  { value: 'HOOK', label: '🪝 Hook / Direct Sling (No Rack)' },
  ...Array.from({ length: 30 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return { value: num, label: `Rack #${num}` };
  })
];

export default function ProductionForm({ currentUser, supabase }) {
  // Global Rack & Load ID
  const [rackNo, setRackNo] = useState('');
  const [loadId, setLoadId] = useState('');

  // --- RIGGING SETUP (1-Point or 2-Point) ---
  const [hangingPoints, setHangingPoints] = useState('2'); // '1' or '2'

  // Point 1 Setup
  const [point1SpecId, setPoint1SpecId] = useState('12_WIRE');
  const [point1Strands, setPoint1Strands] = useState('');

  // Point 2 Setup (Only used if hangingPoints === '2')
  const [point2SpecId, setPoint2SpecId] = useState('12_WIRE');
  const [point2Strands, setPoint2Strands] = useState('');

  // Sign-off State
  const [signOffOperatorId, setSignOffOperatorId] = useState(currentUser?.id || '');
  const [weightConfirmed, setWeightConfirmed] = useState(false);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });

  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      customerName: '',
      customerOrderNo: '',
      customerBatchNo: '',
      workpieces: [
        { id: Date.now() + 1, workpieceType: '', quantity: '', unit: 'pcs', weightLb: '' }
      ]
    }
  ]);

  const handleRackSelect = (selectedVal) => {
    setRackNo(selectedVal);
    if (selectedVal) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dailySeq = Math.floor(Math.random() * 5) + 1;

      let generated = selectedVal === 'HOOK' 
        ? `H00-${year}${month}${day}-${dailySeq}`
        : `R${selectedVal}-${year}${month}${day}-${dailySeq}`;

      setLoadId(generated);
    } else {
      setLoadId('');
    }
  };

  // Handlers for dynamic input fields
  const handleJobFieldChange = (jobIndex, field, value) => {
    const updated = [...jobs];
    updated[jobIndex][field] = value;
    setJobs(updated);
  };

  const addJobRow = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        customerName: '',
        customerOrderNo: '',
        customerBatchNo: '',
        workpieces: [{ id: Date.now() + 1, workpieceType: '', quantity: '', unit: 'pcs', weightLb: '' }]
      }
    ]);
  };

  const removeJobRow = (jobIndex) => {
    if (jobs.length === 1) return;
    setJobs(jobs.filter((_, i) => i !== jobIndex));
  };

  const handleWorkpieceChange = (jobIndex, wpIndex, field, value) => {
    const updated = [...jobs];
    updated[jobIndex].workpieces[wpIndex][field] = value;
    setJobs(updated);
  };

  const addWorkpieceRow = (jobIndex) => {
    const updated = [...jobs];
    updated[jobIndex].workpieces.push({
      id: Date.now(),
      workpieceType: '',
      quantity: '',
      unit: 'pcs',
      weightLb: ''
    });
    setJobs(updated);
  };

  const removeWorkpieceRow = (jobIndex, wpIndex) => {
    const updated = [...jobs];
    if (updated[jobIndex].workpieces.length === 1) return;
    updated[jobIndex].workpieces = updated[jobIndex].workpieces.filter((_, i) => i !== wpIndex);
    setJobs(updated);
  };

  // Calculate Max Unit Weight
  const getMaxUnitWeight = () => {
    let maxSingleWeight = 0;
    let hasMissingWeight = false;

    jobs.forEach(job => {
      job.workpieces.forEach(wp => {
        const w = parseFloat(wp.weightLb);
        const q = parseInt(wp.quantity, 10) || 1;
        if (!wp.weightLb || isNaN(w) || w <= 0) {
          hasMissingWeight = true;
        } else {
          const unitWeight = w / q;
          if (unitWeight > maxSingleWeight) maxSingleWeight = unitWeight;
        }
      });
    });

    return { maxSingleWeight, hasMissingWeight };
  };

  const { maxSingleWeight, hasMissingWeight } = getMaxUnitWeight();

  const getSpecObj = (id) => RIGGING_SPECS.find(r => r.id === id) || RIGGING_SPECS[0];

  const p1Obj = getSpecObj(point1SpecId);
  const p2Obj = getSpecObj(point2SpecId);

  const pointsCount = parseInt(hangingPoints, 10);
  const loadPerPoint = maxSingleWeight / pointsCount;

  // Theoretical required strands per point
  const p1ReqStrands = Math.max(1, Math.ceil(loadPerPoint / p1Obj.swl));
  const p2ReqStrands = Math.max(1, Math.ceil(loadPerPoint / p2Obj.swl));

  const p1UserCount = parseInt(point1Strands, 10) || 0;
  const p2UserCount = parseInt(point2Strands, 10) || 0;

  // Check if wire strands are below theoretical requirement
  const isP1Deficient = p1Obj.type === 'WIRE' && p1UserCount > 0 && p1UserCount < p1ReqStrands;
  const isP2Deficient = pointsCount === 2 && p2Obj.type === 'WIRE' && p2UserCount > 0 && p2UserCount < p2ReqStrands;
  const isAnyDeficient = isP1Deficient || isP2Deficient;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rackNo || !loadId.trim()) {
      alert('Please select a Rack # or Loading Method first.');
      return;
    }

    if (hasMissingWeight) {
      alert('SAFETY BLOCKED: Physical weight measurement is mandatory for all items.');
      return;
    }

    if (!point1Strands || p1UserCount <= 0) {
      alert('Please enter actual strands/lines used for Hanging Point #1.');
      return;
    }

    if (pointsCount === 2 && (!point2Strands || p2UserCount <= 0)) {
      alert('Please enter actual strands/lines used for Hanging Point #2.');
      return;
    }

    if (!weightConfirmed) {
      alert('SAFETY BLOCKED: You must check the confirmation box acknowledging scale weight accuracy.');
      return;
    }

    if (!signOffOperatorId.trim()) {
      alert('SIGNATURE REQUIRED: Please enter your Operator ID to sign off.');
      return;
    }

    // Pure English Confirmation Warning if wire strands are below reference value
    if (isAnyDeficient) {
      const isConfirmed = window.confirm(
        `⚠️ WARNING: Tie wire strand count is less than the theoretical reference value.\n\nPlease verify that your entered Weight, Hanging Setup, and Wire Strand counts are accurate.\n\nClick "OK" to acknowledge and proceed, or "Cancel" to modify.`
      );

      if (!isConfirmed) return;
    }

    executeSubmission();
  };

  const executeSubmission = () => {
    const payload = {
      global: {
        loadId: loadId.trim(),
        rackNo: rackNo === 'HOOK' ? 'HOOK' : `Rack #${rackNo}`,
        signedByOperatorId: signOffOperatorId.trim(),
        hangingPoints: pointsCount,
        point1: { spec: p1Obj.label, strandsUsed: p1UserCount },
        point2: pointsCount === 2 ? { spec: p2Obj.label, strandsUsed: p2UserCount } : null,
        createdAt: new Date().toISOString()
      },
      jobs
    };

    console.log('Submitting Payload:', payload);
    alert(`Load [${loadId.trim()}] recorded successfully by Operator ID: ${signOffOperatorId.trim()}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-sans text-slate-100 p-2">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4 shadow-lg">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
            Step 01: Loading Station Portal
          </span>
          <h2 className="text-xl font-extrabold text-white">New Load Entry & Rigging Sign-off</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-300">📅 {currentDateFormatted}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: SOP STANDARDS & DYNAMIC NOTICE (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-4 space-y-4">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="text-lg">📋</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  SOP Operating Guidelines
                </h3>
              </div>

              {/* Dynamic Warning (Pure English): Only shown if wire strands < theoretical value */}
              {isAnyDeficient && (
                <div className="p-4 bg-amber-950/50 border border-amber-800 rounded-xl text-amber-200 text-xs leading-relaxed space-y-2">
                  <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    ⚠️ NOTICE: Wire count below reference value
                  </div>
                  <p className="text-xs text-amber-200/90">
                    Please double-check your inputted scale weight, hanging setup, and wire strand counts before submitting.
                  </p>
                </div>
              )}

              {/* Standard Operating Guidelines */}
              <div className="text-xs text-slate-400 space-y-3 pt-2">
                <div className="font-bold text-slate-300 uppercase text-[11px] tracking-wider">
                  Mandatory Execution Rules
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">1. Tie Wire Knotting</div>
                  <p className="text-[11px] text-slate-400">Wrap wire around workpiece body at least <strong>3 full turns</strong>. Do not over-twist knots.</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">2. Drainage & Venting Angle</div>
                  <p className="text-[11px] text-slate-400">Maintain a <strong>15° - 30° tilt angle</strong> for smooth zinc drainage. Ensure vent holes are open on all hollow structures.</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: DATA ENTRY & RIGGING SELECTION (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Rack & Load ID */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Rack # / Loading Method <span className="text-rose-400">*</span>
                </label>
                <select
                  value={rackNo}
                  onChange={(e) => handleRackSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                  required
                >
                  <option value="">-- Select Rack # or Method --</option>
                  {RACK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Load ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Select Rack first..."
                  value={loadId}
                  onChange={(e) => setLoadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* 2. Material Breakdown */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Loaded Material Breakdown ({jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'})
                </span>
                <button
                  type="button"
                  onClick={addJobRow}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                  + Add Another Job
                </button>
              </div>

              {jobs.map((job, jobIndex) => (
                <div key={job.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs font-bold text-cyan-400 font-mono">Job #{jobIndex + 1}</span>
                    {jobs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJobRow(jobIndex)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Remove Job
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. ABC Steel"
                        value={job.customerName}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'customerName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Customer Order # *</label>
                      <input
                        type="text"
                        placeholder="e.g. 102384"
                        value={job.customerOrderNo}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'customerOrderNo', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Customer Batch # *</label>
                      <input
                        type="text"
                        placeholder="e.g. #1"
                        value={job.customerBatchNo}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'customerBatchNo', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Workpiece Items */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Workpiece Items on this Job</span>
                      <button
                        type="button"
                        onClick={() => addWorkpieceRow(jobIndex)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        + Add Workpiece Line
                      </button>
                    </div>

                    {job.workpieces.map((wp, wpIndex) => (
                      <div key={wp.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 items-center">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Workpiece Type *</label>
                          <select
                            value={wp.workpieceType}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'workpieceType', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                            required
                          >
                            <option value="">-- Select --</option>
                            {WORKPIECE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Qty *</label>
                          <input
                            type="number"
                            min="1"
                            value={wp.quantity}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'quantity', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Unit</label>
                          <select
                            value={wp.unit}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'unit', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-100"
                          >
                            {QTY_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-amber-400 font-bold mb-0.5">Scale Weight (lb) *</label>
                          <input
                            type="number"
                            step="any"
                            value={wp.weightLb}
                            onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'weightLb', e.target.value)}
                            className="w-full bg-slate-900 border border-amber-500/60 rounded px-2 py-1 text-xs font-mono text-amber-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end items-center pt-2 sm:pt-0">
                          {job.workpieces.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWorkpieceRow(jobIndex, wpIndex)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* 3. RIGGING SETUP (Point Count & Independent Point Specs) */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-cyan-900/60 shadow-xl space-y-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span>⛓️</span>
                <span>Operator Rigging & Hanging Method</span>
              </div>

              {/* Single / Two Points Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Hanging Points Count <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHangingPoints('1')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      hangingPoints === '1' 
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📍 Single Point Hanging
                  </button>
                  <button
                    type="button"
                    onClick={() => setHangingPoints('2')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      hangingPoints === '2' 
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📍📍 Two Points Hanging
                  </button>
                </div>
              </div>

              {/* Point #1 Setup */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-300 block">
                  {hangingPoints === '2' ? 'Point #1 Rigging Specification' : 'Single Point Rigging Specification'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Spec / Type *</label>
                    <select
                      value={point1SpecId}
                      onChange={(e) => setPoint1SpecId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      required
                    >
                      {RIGGING_SPECS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Actual Strands / Lines Used *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 3"
                      value={point1Strands}
                      onChange={(e) => setPoint1Strands(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Point #2 Setup (Only rendered if hangingPoints === '2') */}
              {hangingPoints === '2' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-cyan-300 block">Point #2 Rigging Specification</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Spec / Type *</label>
                      <select
                        value={point2SpecId}
                        onChange={(e) => setPoint2SpecId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        required
                      >
                        {RIGGING_SPECS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Actual Strands / Lines Used *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        value={point2Strands}
                        onChange={(e) => setPoint2Strands(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 4. SIGN-OFF & SUBMIT */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={weightConfirmed}
                  onChange={(e) => setWeightConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-500 bg-slate-900 cursor-pointer"
                  required
                />
                <span className="text-xs text-slate-300">
                  I confirm scale weights are accurate and I take full responsibility for the rigging execution.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Operator ID Signature <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7222"
                    value={signOffOperatorId}
                    onChange={(e) => setSignOffOperatorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer mt-5 sm:mt-0"
                >
                  Confirm & Complete Loading Entry →
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}