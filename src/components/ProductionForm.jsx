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
  { value: 'HOOK', label: '🪝 Hook / Direct Sling (No Rack)' },
  ...Array.from({ length: 30 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return { value: num, label: `Rack #${num}` };
  })
];

// Rigging Specifications (SWL per strand in lbs)
const RIGGING_SPECS = [
  { id: '14_WIRE', label: '14 Gauge Wire', type: 'WIRE', swl: 50 },
  { id: '12_WIRE', label: '12 Gauge Wire', type: 'WIRE', swl: 75 },
  { id: '10_WIRE', label: '10 Gauge Wire', type: 'WIRE', swl: 150 },
  { id: '38_CHAIN', label: '3/8" High Test Chain', type: 'CHAIN', swl: 4000 },
  { id: '12_CHAIN', label: '1/2" High Test Chain', type: 'CHAIN', swl: 6500 },
  { id: 'CLAMP', label: 'Heavy Duty Lifting Clamp', type: 'CLAMP', swl: 10000 },
];

// Surface Condition Ratings
const RUST_GRADES = ['None (A)', 'Mild (B)', 'Moderate (C)', 'Severe Heavy Scale (D)'];
const OIL_PAINT_GRADES = ['Clean (None)', 'Light Oil', 'Heavy Oil/Grease', 'Paint Present (Needs Grind)'];

export default function ProductionForm({ currentUser, supabase }) {
  // Global Rack & Load Session
  const [rackNo, setRackNo] = useState('');
  const [loadId, setLoadId] = useState('');
  const [autoLoadId, setAutoLoadId] = useState(''); 
  const [isGeneratingLoadId, setIsGeneratingLoadId] = useState(false);

  // Formatted Current Date & Day of Week
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Jobs List with Safety Checklist & Sign-off added
  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      customerName: '',
      customerOrderNo: '',
      customerBatchNo: '',
      // Surface Assessment
      rustGrade: 'Mild (B)',
      oilPaintGrade: 'Clean (None)',
      // Job Level Safety Checklist
      hasHollowSections: 'NO', // 'YES' | 'NO'
      hasSufficientVenting: 'YES', // 'YES' | 'NO' | 'N/A'
      drilledOnSiteIfLacking: 'YES', // 'YES' | 'NO' | 'N/A'
      angleCompliant: 'YES', // 'YES' | 'NO'
      minTopClearanceOk: 'YES', // >= 50cm
      maxDropDepthOk: 'YES', // <= 400cm
      // Sign-off
      signedOperatorId: currentUser?.id || '',
      isSigned: false,
      workpieces: [
        {
          id: Date.now() + 1,
          workpieceType: '',
          quantity: '',
          unit: 'pcs',
          weightLb: '', 
          hangingMode: 'INDIVIDUAL', // 'INDIVIDUAL' or 'STRING'
          hangingPoints: '2',
          point1SpecId: '12_WIRE',
          point1Strands: '',
          point2SpecId: '12_WIRE',
          point2Strands: ''
        }
      ]
    }
  ]);

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

  const handleResetLoadId = () => {
    if (autoLoadId) {
      setLoadId(autoLoadId);
    }
  };

  const handleJobFieldChange = (jobIndex, field, value) => {
    const updated = [...jobs];
    updated[jobIndex][field] = value;
    setJobs(updated);
  };

  const handleSignJob = (jobIndex) => {
    const updated = [...jobs];
    const currentSign = updated[jobIndex].signedOperatorId.trim();
    if (!currentSign) {
      alert("Please enter your Operator ID before signing.");
      return;
    }
    updated[jobIndex].isSigned = true;
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
        rustGrade: 'Mild (B)',
        oilPaintGrade: 'Clean (None)',
        hasHollowSections: 'NO',
        hasSufficientVenting: 'YES',
        drilledOnSiteIfLacking: 'YES',
        angleCompliant: 'YES',
        minTopClearanceOk: 'YES',
        maxDropDepthOk: 'YES',
        signedOperatorId: currentUser?.id || '',
        isSigned: false,
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '',
            unit: 'pcs',
            weightLb: '',
            hangingMode: 'INDIVIDUAL',
            hangingPoints: '2',
            point1SpecId: '12_WIRE',
            point1Strands: '',
            point2SpecId: '12_WIRE',
            point2Strands: ''
          }
        ]
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
      weightLb: '',
      hangingMode: 'INDIVIDUAL',
      hangingPoints: '2',
      point1SpecId: '12_WIRE',
      point1Strands: '',
      point2SpecId: '12_WIRE',
      point2Strands: ''
    });
    setJobs(updated);
  };

  const removeWorkpieceRow = (jobIndex, wpIndex) => {
    const updated = [...jobs];
    if (updated[jobIndex].workpieces.length === 1) return;
    updated[jobIndex].workpieces = updated[jobIndex].workpieces.filter((_, i) => i !== wpIndex);
    setJobs(updated);
  };

  const getShiftDisplay = () => {
    const rawShift = currentUser?.shift || 'Evening';
    return rawShift.toLowerCase().includes('shift') ? rawShift : `${rawShift} Shift`;
  };

  // Safety Verification Check (Rigging + SOP Safety Non-negotiables)
  const checkSafetyDeficiencies = () => {
    let deficiencies = [];
    let criticalViolations = [];

    jobs.forEach((job, jIdx) => {
      const jobLabel = `Job #${jIdx + 1} (${job.customerName || 'Unnamed Customer'})`;

      // 1. Critical SOP Safety Rules
      if (job.hasHollowSections === 'YES') {
        if (job.hasSufficientVenting === 'NO' && job.drilledOnSiteIfLacking === 'NO') {
          criticalViolations.push(`${jobLabel}: Hollow sections lack vent holes and were NOT drilled on site! (EXPLOSION RISK IN ZINC KETTLE)`);
        }
      }
      if (job.angleCompliant === 'NO') {
        criticalViolations.push(`${jobLabel}: Hanging angle does not meet drainage requirements.`);
      }
      if (job.minTopClearanceOk === 'NO') {
        criticalViolations.push(`${jobLabel}: Top Clearance is less than 50 cm. (Item will not fully submerge)`);
      }
      if (job.maxDropDepthOk === 'NO') {
        criticalViolations.push(`${jobLabel}: Max Drop Depth exceeds 400 cm. (Risk of collision or bottoming out)`);
      }
      if (!job.isSigned) {
        criticalViolations.push(`${jobLabel}: Operator safety sign-off / confirmation signature is missing.`);
      }

      // 2. Rigging Wire Strand Capacity Warnings
      job.workpieces.forEach((wp, wIdx) => {
        const totalW = parseFloat(wp.weightLb) || 0;
        const qty = parseInt(wp.quantity, 10) || 1;
        const unitW = totalW / qty;
        const pts = parseInt(wp.hangingPoints, 10) || 1;

        const loadPerPt = wp.hangingMode === 'STRING' ? (totalW / pts) : (unitW / pts);

        const p1Obj = RIGGING_SPECS.find(r => r.id === wp.point1SpecId) || RIGGING_SPECS[0];
        const p1Req = Math.max(1, Math.ceil(loadPerPt / p1Obj.swl));
        const p1User = parseInt(wp.point1Strands, 10) || 0;
        if (p1Obj.type === 'WIRE' && p1User > 0 && p1User < p1Req) {
          deficiencies.push(`${jobLabel} Line #${wIdx + 1}: Point 1 wire count (${p1User}) is lower than recommended (${p1Req}).`);
        }

        if (pts === 2) {
          const p2Obj = RIGGING_SPECS.find(r => r.id === wp.point2SpecId) || RIGGING_SPECS[0];
          const p2Req = Math.max(1, Math.ceil(loadPerPt / p2Obj.swl));
          const p2User = parseInt(wp.point2Strands, 10) || 0;
          if (p2Obj.type === 'WIRE' && p2User > 0 && p2User < p2Req) {
            deficiencies.push(`${jobLabel} Line #${wIdx + 1}: Point 2 wire count (${p2User}) is lower than recommended (${p2Req}).`);
          }
        }
      });
    });

    return { deficiencies, criticalViolations };
  };

  const { deficiencies, criticalViolations } = checkSafetyDeficiencies();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rackNo || !loadId.trim()) {
      alert('Please select a Rack # or Loading Method first.');
      return;
    }

    // Block submission on Critical Safety Violations
    if (criticalViolations.length > 0) {
      alert(
        `⛔ CRITICAL SAFETY VIOLATION PREVENTED SUBMISSION:\n\n` +
        criticalViolations.map(c => `• ${c}`).join('\n') +
        `\n\nAll safety items (Venting, Clearances, Operator Signature) must be resolved before proceeding.`
      );
      return;
    }

    // Warning alert for minor rigging warnings
    if (deficiencies.length > 0) {
      const isConfirmed = window.confirm(
        `⚠️ RIGGING CAPACITY WARNING:\n\n` +
        deficiencies.join('\n') +
        `\n\nPlease confirm if you want to proceed with these wire strand values?`
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
        createdAt: new Date().toISOString()
      },
      jobs: jobs.map(job => ({
        customerName: job.customerName,
        customerOrderNo: job.customerOrderNo,
        customerBatchNo: job.customerBatchNo || '#1',
        surfaceInspection: {
          rustGrade: job.rustGrade,
          oilPaintGrade: job.oilPaintGrade
        },
        safetyChecklist: {
          hasHollowSections: job.hasHollowSections,
          hasSufficientVenting: job.hasSufficientVenting,
          drilledOnSiteIfLacking: job.drilledOnSiteIfLacking,
          angleCompliant: job.angleCompliant,
          minTopClearanceOk: job.minTopClearanceOk,
          maxDropDepthOk: job.maxDropDepthOk
        },
        signature: {
          signedByOperatorId: job.signedOperatorId,
          signedAt: new Date().toISOString()
        },
        workpieces: job.workpieces.map(wp => {
          const totalW = parseInt(wp.weightLb, 10) || 0;
          const qty = parseInt(wp.quantity, 10) || 0;
          const unitW = qty > 0 ? Math.round(totalW / qty) : 0;
          return {
            workpieceType: wp.workpieceType,
            quantity: qty,
            unit: wp.unit || 'pcs',
            totalWeightLb: totalW,
            unitWeightLb: unitW,
            rigging: {
              hangingMode: wp.hangingMode,
              hangingPoints: parseInt(wp.hangingPoints, 10),
              point1: { spec: wp.point1SpecId, strands: parseInt(wp.point1Strands, 10) || 0 },
              point2: wp.hangingPoints === '2' ? { spec: wp.point2SpecId, strands: parseInt(wp.point2Strands, 10) || 0 } : null
            }
          };
        })
      }))
    };

    console.log('Submitting Production Load Payload:', payload);
    alert(`Load [${loadId.trim()}] recorded successfully!`);

    // Reset Form
    setRackNo('');
    setLoadId('');
    setAutoLoadId('');
    setJobs([
      {
        id: Date.now(),
        customerName: '',
        customerOrderNo: '',
        customerBatchNo: '',
        rustGrade: 'Mild (B)',
        oilPaintGrade: 'Clean (None)',
        hasHollowSections: 'NO',
        hasSufficientVenting: 'YES',
        drilledOnSiteIfLacking: 'YES',
        angleCompliant: 'YES',
        minTopClearanceOk: 'YES',
        maxDropDepthOk: 'YES',
        signedOperatorId: currentUser?.id || '',
        isSigned: false,
        workpieces: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            quantity: '',
            unit: 'pcs',
            weightLb: '',
            hangingMode: 'INDIVIDUAL',
            hangingPoints: '2',
            point1SpecId: '12_WIRE',
            point1Strands: '',
            point2SpecId: '12_WIRE',
            point2Strands: ''
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

        {/* SOP OPERATING GUIDELINES CARD (EXPANDED) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <span className="text-sm">📋</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              HDG SHOP-FLOOR SOP OPERATING GUIDELINES
            </h3>
          </div>

          {criticalViolations.length > 0 && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                ⛔ CRITICAL SAFETY ALERT: Cannot proceed until resolved
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-200/90 space-y-0.5">
                {criticalViolations.map((v, idx) => (
                  <li key={idx}>{v}</li>
                ))}
              </ul>
            </div>
          )}

          {deficiencies.length > 0 && criticalViolations.length === 0 && (
            <div className="p-3 bg-amber-950/70 border border-amber-800 rounded-lg text-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                ⚠️ NOTICE: Wire strand count below reference value
              </div>
              <p className="text-[11px] text-amber-200/90">
                One or more workpiece lines have wire strand counts below theoretical recommendation.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Rule 1: Hollow Venting */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1">
                💥 1. Hollow Sections Venting Check
              </div>
              <p className="text-[11px] text-slate-300">
                Check hollow tubes/frames for <strong>Vent & Drain holes</strong>. Minimum hole size must be ~25%-30% of internal section diameter at highest and lowest points. If lacking, <strong>MUST drill on site before loading!</strong>
              </p>
            </div>

            {/* Rule 2: Surface Contamination */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                🧪 2. Surface Contamination & Paint
              </div>
              <p className="text-[11px] text-slate-300">
                Inspect for heavy rust (Scale D), heavy grease, or <strong>paint/weld slag</strong>. Acid pickling DOES NOT remove paint; flag items for mechanical grinding/blast pretreatment.
              </p>
            </div>

            {/* Rule 3: Hanging Angle */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1">
                📐 3. Hanging Angle & Wire Calculation
              </div>
              <p className="text-[11px] text-slate-300">
                Maintain <strong>15° - 30° tilt angle</strong>. Adjust wire/chain length differential between Point 1 & Point 2 based on span distance ($L_{wire} = L_{span} \times \tan\theta$).
              </p>
            </div>

            {/* Rule 4: Tank Depth & Overhead Clearances */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1">
                📏 4. Top & Bottom Clearance Rules
              </div>
              <p className="text-[11px] text-slate-300">
                • <strong>Top Clearance (Min 50 cm)</strong>: Ensures total immersion below acid/zinc surface.<br/>
                • <strong>Max Drop Depth (Max 400 cm)</strong>: Prevents crane travel collisions and tank bottoming.
              </p>
            </div>
          </div>
        </div>

        {/* 1. RACK & LOAD ID BOX */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-800/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              {/* Basic Job Details */}
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

              {/* Surface Assessment Sub-Panel */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    🔍 Rust / Mill Scale Grade (锈蚀程度)
                  </label>
                  <select
                    value={job.rustGrade}
                    onChange={(e) => handleJobFieldChange(jobIndex, 'rustGrade', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {RUST_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    🛢️ Oil / Paint Contamination (油污/油漆)
                  </label>
                  <select
                    value={job.oilPaintGrade}
                    onChange={(e) => handleJobFieldChange(jobIndex, 'oilPaintGrade', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {OIL_PAINT_GRADES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* NEW: Job-Level Safety & Process Compliance Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    🛡️ Safety & Process Compliance Checklist (Job #{jobIndex + 1})
                  </span>
                  <span className="text-[10px] text-slate-400">Mandatory Inspection</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Q1: Hollow sections */}
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">1. Has hollow sections / tubes?</span>
                      <select
                        value={job.hasHollowSections}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'hasHollowSections', e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded px-2 py-0.5"
                      >
                        <option value="NO">NO</option>
                        <option value="YES">YES</option>
                      </select>
                    </div>

                    {job.hasHollowSections === 'YES' && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-[11px]">2. Has sufficient vent/drain holes?</span>
                          <select
                            value={job.hasSufficientVenting}
                            onChange={(e) => handleJobFieldChange(jobIndex, 'hasSufficientVenting', e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded px-2 py-0.5"
                          >
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                          </select>
                        </div>

                        {job.hasSufficientVenting === 'NO' && (
                          <div className="flex justify-between items-center bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                            <span className="text-rose-300 text-[11px]">3. Drilled sufficient holes on site?</span>
                            <select
                              value={job.drilledOnSiteIfLacking}
                              onChange={(e) => handleJobFieldChange(jobIndex, 'drilledOnSiteIfLacking', e.target.value)}
                              className="bg-slate-900 border border-rose-700 text-rose-300 font-bold text-xs rounded px-2 py-0.5"
                            >
                              <option value="YES">YES (Fixed)</option>
                              <option value="NO">NO (UNSAFE)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Q2: Angle & Clearances */}
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">4. Tilt angle within 15° - 30°?</span>
                      <select
                        value={job.angleCompliant}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'angleCompliant', e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded px-2 py-0.5"
                      >
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">5. Min Top Clearance ≥ 50 cm?</span>
                      <select
                        value={job.minTopClearanceOk}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'minTopClearanceOk', e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded px-2 py-0.5"
                      >
                        <option value="YES">YES (≥ 50cm)</option>
                        <option value="NO">NO (&lt; 50cm)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">6. Max Drop Depth ≤ 400 cm?</span>
                      <select
                        value={job.maxDropDepthOk}
                        onChange={(e) => handleJobFieldChange(jobIndex, 'maxDropDepthOk', e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded px-2 py-0.5"
                      >
                        <option value="YES">YES (≤ 400cm)</option>
                        <option value="NO">NO (&gt; 400cm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Operator Signature Block */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Operator Sign-Off:</span>
                    <input
                      type="text"
                      placeholder="Enter Operator ID"
                      value={job.signedOperatorId}
                      onChange={(e) => handleJobFieldChange(jobIndex, 'signedOperatorId', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono w-36 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSignJob(jobIndex)}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                        job.isSigned
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                          : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-slate-950'
                      }`}
                    >
                      {job.isSigned ? '✓ Signed & Verified' : 'Confirm & Sign'}
                    </button>
                  </div>
                  {!job.isSigned && (
                    <span className="text-[10px] text-rose-400 font-semibold">
                      * Signature required prior to submission
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Workpiece Lines */}
              <div className="pt-2 space-y-4">
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

                {job.workpieces.map((wp, wpIndex) => {
                  const totalW = parseFloat(wp.weightLb) || 0;
                  const qty = parseInt(wp.quantity, 10) || 0;
                  const unitW = qty > 0 && totalW > 0 ? Math.round(totalW / qty) : 0;

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
                        
                        {/* Top Mode Selection: Individual vs String Hanging */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800/60">
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            ⚙️ Hanging & Rigging for {wp.workpieceType || `Line #${wpIndex + 1}`}
                          </span>

                          <div className="flex items-center gap-3">
                            {/* Hanging Mode Switch */}
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
                                ⛓️ String Hanging (串挂)
                              </button>
                            </div>

                            {/* Single vs Two Points Toggle */}
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

                        {/* String hanging hint message */}
                        {wp.hangingMode === 'STRING' && (
                          <div className="text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-900/60 px-2 py-1 rounded">
                            💡 <strong>String Mode Active:</strong> All {qty || 'N'} {wp.unit || 'pcs'} are chained together; total weight ({totalW || 0} lbs) is loaded onto the top rigging points.
                          </div>
                        )}

                        {/* Rigging Dropdowns for Point 1 & Point 2 */}
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