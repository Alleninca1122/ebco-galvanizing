import React, { useState } from 'react';

// Standard Galvanizing Workpiece Types
const WORKPIECE_TYPES = [
  'Anchor', 'Angle', 'Beam', 'Bracket', 'Frame', 
  'Grating', 'Ladder', 'Mesh', 'Pipe', 'Plate', 
  'Pole', 'Railing', 'Rebar', 'Rod', 'Tube', 'Washer', 'Others'
];

// Quantity Unit Options (Pure English)
const QTY_UNITS = [
  { value: 'pcs', label: 'pcs' },
  { value: 'bag', label: 'bag' },
  { value: 'box', label: 'box' }
];

// Hook Option on top, followed by 30 Fixed Racks
const RACK_OPTIONS = [
  { value: 'HOOK', label: '🪝 Hook / Direct Sling (No Rack)' },
  ...Array.from({ length: 30 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return { value: num, label: `Rack #${num}` };
  })
];

// [ADD-ONLY]: Rigging Specifications
const RIGGING_SPECS = [
  { id: '14_WIRE', label: '14 Gauge Wire', type: 'WIRE', swl: 50 },
  { id: '12_WIRE', label: '12 Gauge Wire', type: 'WIRE', swl: 75 },
  { id: '10_WIRE', label: '10 Gauge Wire', type: 'WIRE', swl: 150 },
  { id: '38_CHAIN', label: '3/8" High Test Chain', type: 'CHAIN', swl: 4000 },
  { id: '12_CHAIN', label: '1/2" High Test Chain', type: 'CHAIN', swl: 6500 },
  { id: 'CLAMP', label: 'Heavy Duty Lifting Clamp', type: 'CLAMP', swl: 10000 },
];

export default function ProductionForm({ currentUser, supabase }) {
  // Global Rack & Load Session
  const [rackNo, setRackNo] = useState('');
  const [loadId, setLoadId] = useState('');
  const [autoLoadId, setAutoLoadId] = useState(''); 
  const [isGeneratingLoadId, setIsGeneratingLoadId] = useState(false);

  // [ADD-ONLY]: Rigging & Hanging Setup State
  const [hangingPoints, setHangingPoints] = useState('2');
  const [point1SpecId, setPoint1SpecId] = useState('12_WIRE');
  const [point1Strands, setPoint1Strands] = useState('');
  const [point2SpecId, setPoint2SpecId] = useState('12_WIRE');
  const [point2Strands, setPoint2Strands] = useState('');

  // Formatted Current Date & Day of Week
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Jobs List - Initialized workpieceType with empty string ''
  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      customerName: '',
      customerOrderNo: '',
      customerBatchNo: '',
      workpieces: [
        {
          id: Date.now() + 1,
          workpieceType: '',
          quantity: '',
          unit: 'pcs',
          weightLb: ''
        }
      ]
    }
  ]);

  /**
   * Fetches total load count created today to determine next daily sequence number (1, 2, 3...)
   */
  const getNextDailySequence = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (!supabase) {
      return Math.floor(Math.random() * 5) + 1;
    }

    try {
      const { count, error } = await supabase
        .from('production_loads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${todayStr}T00:00:00`);

      if (error) throw error;
      return (count || 0) + 1;
    } catch (err) {
      console.warn('Could not fetch daily load count from Supabase, falling back to 1:', err);
      return 1;
    }
  };

  /**
   * Handles Rack/Hook Selection & Auto-generates Load ID:
   * Hook -> H00-YYYYMMDD-1
   * Rack -> R01-YYYYMMDD-2
   */
  const handleRackSelect = async (selectedVal) => {
    setRackNo(selectedVal);

    if (selectedVal) {
      setIsGeneratingLoadId(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const dailySeq = await getNextDailySequence();

      let generated = '';
      if (selectedVal === 'HOOK') {
        generated = `H00-${year}${month}${day}-${dailySeq}`;
      } else {
        generated = `R${selectedVal}-${year}${month}${day}-${dailySeq}`;
      }

      setAutoLoadId(generated);
      setLoadId(generated);
      setIsGeneratingLoadId(false);
    } else {
      setLoadId('');
      setAutoLoadId('');
    }
  };

  // Reset Load ID back to auto-generated default
  const handleResetLoadId = () => {
    if (autoLoadId) {
      setLoadId(autoLoadId);
    }
  };

  // --- JOB HANDLERS ---
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
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '',
            unit: 'pcs',
            weightLb: ''
          }
        ]
      }
    ]);
  };

  const removeJobRow = (jobIndex) => {
    if (jobs.length === 1) return;
    setJobs(jobs.filter((_, i) => i !== jobIndex));
  };

  // --- WORKPIECE ROW HANDLERS ---
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

  // Format shift label neatly
  const getShiftDisplay = () => {
    const rawShift = currentUser?.shift || 'Evening';
    return rawShift.toLowerCase().includes('shift') ? rawShift : `${rawShift} Shift`;
  };

  // [ADD-ONLY]: Rigging Logic Calculations
  const getMaxUnitWeight = () => {
    let maxSingleWeight = 0;
    jobs.forEach(job => {
      job.workpieces.forEach(wp => {
        const w = parseFloat(wp.weightLb);
        const q = parseInt(wp.quantity, 10) || 1;
        if (w > 0) {
          const unitW = w / q;
          if (unitW > maxSingleWeight) maxSingleWeight = unitW;
        }
      });
    });
    return maxSingleWeight;
  };

  const maxUnitWeight = getMaxUnitWeight();
  const pointsCount = parseInt(hangingPoints, 10);
  const loadPerPoint = maxUnitWeight / pointsCount;

  const p1Obj = RIGGING_SPECS.find(r => r.id === point1SpecId) || RIGGING_SPECS[0];
  const p2Obj = RIGGING_SPECS.find(r => r.id === point2SpecId) || RIGGING_SPECS[0];

  const p1ReqStrands = Math.max(1, Math.ceil(loadPerPoint / p1Obj.swl));
  const p2ReqStrands = Math.max(1, Math.ceil(loadPerPoint / p2Obj.swl));

  const p1UserCount = parseInt(point1Strands, 10) || 0;
  const p2UserCount = parseInt(point2Strands, 10) || 0;

  const isP1Deficient = p1Obj.type === 'WIRE' && p1UserCount > 0 && p1UserCount < p1ReqStrands;
  const isP2Deficient = pointsCount === 2 && p2Obj.type === 'WIRE' && p2UserCount > 0 && p2UserCount < p2ReqStrands;
  const isAnyDeficient = isP1Deficient || isP2Deficient;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rackNo || !loadId.trim()) {
      alert('Please select a Rack # or Loading Method first.');
      return;
    }

    // [ADD-ONLY]: Verification prompt when wire strand count is less than reference value
    if (isAnyDeficient) {
      const isConfirmed = window.confirm(
        `⚠️ WARNING: Tie wire strand count is less than the theoretical reference value.\n\nPlease verify that your entered Weight, Hanging Setup, and Wire Strand counts are accurate.\n\nClick "OK" to acknowledge and proceed, or "Cancel" to modify.`
      );
      if (!isConfirmed) return;
    }

    const payload = {
      global: {
        loadId: loadId.trim(),
        rackNo: rackNo === 'HOOK' ? 'HOOK' : `Rack #${rackNo}`,
        operatorId: currentUser?.id || 'UNKNOWN',
        shift: getShiftDisplay(),
        entryDate: currentDateFormatted,
        createdAt: new Date().toISOString(),
        // [ADD-ONLY]: Rigging Data Attached to Payload
        hangingPoints: pointsCount,
        point1: { spec: p1Obj.label, strandsUsed: p1UserCount },
        point2: pointsCount === 2 ? { spec: p2Obj.label, strandsUsed: p2UserCount } : null
      },
      jobs: jobs.map(job => ({
        customerName: job.customerName,
        customerOrderNo: job.customerOrderNo,
        customerBatchNo: job.customerBatchNo || '#1',
        workpieces: job.workpieces.map(wp => ({
          workpieceType: wp.workpieceType,
          quantity: parseInt(wp.quantity, 10) || 0,
          unit: wp.unit || 'pcs',
          weightLb: parseInt(wp.weightLb, 10) || 0
        }))
      }))
    };

    console.log('Submitting Production Load Payload:', payload);
    alert(`Load [${loadId.trim()}] recorded successfully!`);

    // Reset Form
    setRackNo('');
    setLoadId('');
    setAutoLoadId('');
    setPoint1Strands('');
    setPoint2Strands('');
    setJobs([
      {
        id: Date.now(),
        customerName: '',
        customerOrderNo: '',
        customerBatchNo: '',
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '',
            unit: 'pcs',
            weightLb: ''
          }
        ]
      }
    ]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl font-sans text-slate-100">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
            Step 01: Loading Station
          </span>
          <h2 className="text-xl font-extrabold text-white">New Load Entry</h2>
        </div>

        {/* Header Right: Date & Shift */}
        <div className="text-right space-y-0.5">
          <div className="text-xs font-semibold text-slate-300">
            📅 {currentDateFormatted}
          </div>
          <div className="text-xs font-bold text-cyan-300 font-mono">
            🕒 {getShiftDisplay()}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* [ADD-ONLY]: SOP OPERATING GUIDELINES CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <span className="text-sm">📋</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              SOP OPERATING GUIDELINES
            </h3>
          </div>

          {/* Dynamic Warning Alert */}
          {isAnyDeficient && (
            <div className="p-3 bg-amber-950/70 border border-amber-800 rounded-lg text-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                ⚠️ NOTICE: Wire count below reference value
              </div>
              <p className="text-[11px] text-amber-200/90">
                Please double-check your inputted scale weight, hanging setup, and wire strand counts before submitting.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">1. Tie Wire Knotting</div>
              <p className="text-[11px] text-slate-400">
                Wrap wire around workpiece body at least <strong>3 full turns</strong>. Do not over-twist knots.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">2. Drainage & Venting Angle</div>
              <p className="text-[11px] text-slate-400">
                Maintain a <strong>15° - 30° tilt angle</strong> for smooth zinc drainage. Ensure vent holes are open on all hollow structures.
              </p>
            </div>
          </div>
        </div>

        {/* 1. RACK & LOAD ID BOX */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-800/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rack # / Hook Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Rack # / Loading Method <span className="text-rose-400">*</span>
              </label>
              <select
                value={rackNo}
                onChange={(e) => handleRackSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-cyan-300 font-mono font-bold text-base focus:outline-none focus:border-cyan-400"
                required
              >
                <option value="">-- Select Rack # or Method --</option>
                {RACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Load ID */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Load ID <span className="text-rose-400">*</span>
                </label>
                {autoLoadId && loadId !== autoLoadId && (
                  <button
                    type="button"
                    onClick={handleResetLoadId}
                    className="text-[10px] text-cyan-400 hover:underline uppercase font-bold"
                  >
                    Reset Auto ID
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder={
                  isGeneratingLoadId 
                    ? "Generating Load ID..." 
                    : rackNo 
                    ? "Enter custom ID" 
                    : "Select Rack # first..."
                }
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-cyan-300 font-mono font-bold text-base focus:outline-none focus:border-cyan-400"
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Auto-generated. Editable if needed.
              </span>
            </div>
          </div>
        </div>

        {/* 2. JOB BREAKDOWN SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Loaded Material Breakdown ({jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'})
            </span>
            <button
              type="button"
              onClick={addJobRow}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              + Add Another Customer Job
            </button>
          </div>

          {jobs.map((job, jobIndex) => (
            <div key={job.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
                  Job #{jobIndex + 1}
                </span>
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

              {/* Customer Name, Customer Order #, Customer Batch # */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Customer Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Steel / West Coast Fab"
                    value={job.customerName}
                    onChange={(e) => handleJobFieldChange(jobIndex, 'customerName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Customer Order # <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    pattern="\d*"
                    maxLength={10}
                    placeholder="e.g. 102384"
                    value={job.customerOrderNo}
                    onChange={(e) => handleJobFieldChange(jobIndex, 'customerOrderNo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Customer Batch # <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #5, If first batch enter #1"
                    value={job.customerBatchNo}
                    onChange={(e) => handleJobFieldChange(jobIndex, 'customerBatchNo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Workpiece Lines */}
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Workpiece Items on this Job
                  </span>
                  <button
                    type="button"
                    onClick={() => addWorkpieceRow(jobIndex)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    + Add Workpiece Line
                  </button>
                </div>

                {job.workpieces.map((wp, wpIndex) => (
                  <div key={wp.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 relative group">
                    
                    {/* Workpiece Type */}
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

                    {/* Quantity Value (No Arrow, Clean Input) */}
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

                    {/* Quantity Unit */}
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

                    {/* Weight (lb) (No Arrow, Clean Input) */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Weight (lb)</label>
                      <input
                        type="number"
                        value={wp.weightLb}
                        onChange={(e) => handleWorkpieceChange(jobIndex, wpIndex, 'weightLb', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {/* Loading Operator & Remove Button */}
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
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* [ADD-ONLY]: OPERATOR RIGGING & HANGING METHOD SECTION */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span>
            <span>OPERATOR RIGGING & HANGING METHOD</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Hanging Points Count <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHangingPoints('1')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  hangingPoints === '1' 
                    ? 'bg-slate-900 border-cyan-500 text-cyan-300' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📍</span> Single Point Hanging
              </button>
              <button
                type="button"
                onClick={() => setHangingPoints('2')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  hangingPoints === '2' 
                    ? 'bg-slate-900 border-cyan-500 text-cyan-300' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📍📍</span> Two Points Hanging
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-400 block">
              {hangingPoints === '2' ? 'Point #1 Rigging Specification' : 'Single Point Rigging Specification'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Spec / Type *</label>
                <select
                  value={point1SpecId}
                  onChange={(e) => setPoint1SpecId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>
            </div>
          </div>

          {hangingPoints === '2' && (
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 block">Point #2 Rigging Specification</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Spec / Type *</label>
                  <select
                    value={point2SpecId}
                    onChange={(e) => setPoint2SpecId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            Confirm & Complete Loading Entry →
          </button>
        </div>

      </form>
    </div>
  );
}