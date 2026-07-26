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
  { id: 'CLAMP', label: 'Heavy Duty Lifting Clamp', type: 'CLAMP', swl: 10000 }
];

// Surface Condition Ratings (Updated for Caustic Bath + Manual Grinding)
const RUST_GRADES = ['None (A)', 'Mild (B)', 'Moderate (C)', 'Severe Heavy Scale (D)'];
const OIL_PAINT_GRADES = [
  'Clean (None)',
  'Light Oil / Grease (Goes to Caustic Bath)',
  'Heavy Grease (Needs Caustic Pre-soak)',
  'Paint / Weld Slag (Needs Manual Grinding)'
];

export default function ProductionForm({ currentUser, supabase }) {
  // Global Rack & Load Session
  const [rackNo, setRackNo] = useState('');
  const [loadId, setLoadId] = useState('');
  const [autoLoadId, setAutoLoadId] = useState('');
  const [isGeneratingLoadId, setIsGeneratingLoadId] = useState(false);

  // Form Reset
  const resetForm = () => {
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

  // Jobs List State
  const [jobs, setJobs] = useState([
    {
      id: Date.now(),
      customerName: '',
      customerOrderNo: '',
      customerBatchNo: '',
      rustGrade: 'Mild (B)',
      oilPaintGrade: 'Clean (None)',
      // Job Level Safety Checklist
      hasHollowSections: 'NO', // 'YES' | 'NO'
      hasSufficientVenting: 'YES', // 'YES' | 'NO'
      drilledOnSiteIfLacking: 'YES', // 'YES' | 'NO'
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

  // Safety Verification Check
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

      // 2. Rigging Strand Capacity Warnings
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rackNo || !loadId.trim()) {
      alert('Please select a Rack # or Loading Method first.');
      return;
    }

    const { deficiencies, criticalViolations } = checkSafetyDeficiencies();

    if (criticalViolations.length > 0) {
      alert(
        `⛔ CRITICAL SAFETY VIOLATION PREVENTED SUBMISSION:\n\n` +
        criticalViolations.join('\n') +
        `\n\nAll safety items (Venting, Clearances, Operator Signature) must be resolved before proceeding.`
      );
      return;
    }

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
        entryDate: new Date().toISOString()
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
        workpieces: job.workpieces
      }))
    };

    console.log('Submitting Payload:', payload);
    alert('Entry successfully recorded!');
    resetForm();
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl font-sans text-slate-100">
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SOP OPERATING GUIDELINES CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-sm">📋</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              HDG SHOP-FLOOR SOP OPERATING GUIDELINES
            </h3>
          </div>

          {/* Rule 1: Hollow Venting */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              🚨 1. Hollow Sections Venting Check
            </div>
            <p className="text-[11px] text-slate-300">
              Check hollow tubes/frames for <strong>Vent & Drain holes</strong> (~25%-30% section area at ends). If lacking, <strong>MUST drill on site before dipping</strong>.
            </p>
          </div>

          {/* Rule 2: Surface Contamination */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1">
              🧼 2. Surface Contamination (Caustic / Grinding)
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Oil/Grease/Strong:</strong> Route rack to <strong>Caustic Degreasing Tank (碱洗槽)</strong>.<br />
              <strong>Paint / Weld Slag/Strong:</strong> Acid/Caustic will NOT remove paint. <strong>MUST perform manual grinding (打磨) on site.</strong>
            </p>
          </div>

          {/* Rule 3: Hanging Angle & Wire */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1">
              📐 3. Hanging Angle & Wire Calculation
            </div>
            <p className="text-[11px] text-slate-300">
              Maintain <strong>15° - 30° tilt angle</strong>. Adjust wire/chain length differential between Point 1 & Point 2 based on span distance ($L_{\text{wire}}$).
            </p>
          </div>

          {/* Rule 4: Tank Depth & Overhead Clearances */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1">
              📏 4. Top & Bottom Clearance Rules
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Top Clearance (Min 50 cm):</strong> Ensures total immersion below acid/zinc surface.<br />
              <strong>Max Drop Depth (Max 400 cm):</strong> Prevents crane travel collisions and tank bottoming.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            Confirm & Complete Loading Entry +
          </button>
        </div>
      </form>
    </div>
  );
}