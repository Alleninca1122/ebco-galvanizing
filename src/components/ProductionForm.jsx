import React, { useState } from 'react';

export default function ProductionForm() {
  const [rackMethod, setRackMethod] = useState('');
  const [loadId, setLoadId] = useState('');
  const [jobs, setJobs] = useState([
    {
      id: 1,
      customerName: '',
      customerOrder: '',
      customerBatch: '',
      // SOP & Safety Checks per Job
      hasHollowSections: false,
      hasSufficientVenting: true,
      fieldVentingDone: false,
      angleCompliant: true,
      minClearancePass: true, // >= 50cm
      maxClearancePass: true, // <= 400cm
      surfaceCondition: 'None', // None, Mild, Moderate, Severe
      operatorId: '',
      isSigned: false,
      workpieces: [
        {
          id: 1,
          type: '',
          qty: '',
          unit: 'PCS',
          totalWeight: '',
          hangingType: '1-Point',
          point1Spec: '12 Gauge Wire',
          point1Strands: '3',
          point2Spec: '12 Gauge Wire',
          point2Strands: '3'
        }
      ]
    }
  ]);

  // Handle Rack change & auto load ID
  const handleRackChange = (e) => {
    const val = e.target.value;
    setRackMethod(val);
    if (val) {
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      setLoadId(`LD-${dateStr}-${val.replace(/\s+/g, '').toUpperCase().slice(0, 4)}-01`);
    } else {
      setLoadId('');
    }
  };

  // Job Safety Verification updates
  const updateJobSafety = (jobIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex][field] = value;
    setJobs(updatedJobs);
  };

  // Add/Remove Workpiece/Job handlers
  const addWorkpiece = (jobIndex) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces.push({
      id: Date.now(),
      type: '',
      qty: '',
      unit: 'PCS',
      totalWeight: '',
      hangingType: '1-Point',
      point1Spec: '12 Gauge Wire',
      point1Strands: '3',
      point2Spec: '12 Gauge Wire',
      point2Strands: '3'
    });
    setJobs(updatedJobs);
  };

  const addJob = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        customerName: '',
        customerOrder: '',
        customerBatch: '',
        hasHollowSections: false,
        hasSufficientVenting: true,
        fieldVentingDone: false,
        angleCompliant: true,
        minClearancePass: true,
        maxClearancePass: true,
        surfaceCondition: 'None',
        operatorId: '',
        isSigned: false,
        workpieces: [
          {
            id: Date.now(),
            type: '',
            qty: '',
            unit: 'PCS',
            totalWeight: '',
            hangingType: '1-Point',
            point1Spec: '12 Gauge Wire',
            point1Strands: '3',
            point2Spec: '12 Gauge Wire',
            point2Strands: '3'
          }
        ]
      }
    ]);
  };

  // Global Safety Gate check
  const checkGlobalSafety = () => {
    for (let j of jobs) {
      if (j.hasHollowSections && !j.hasSufficientVenting && !j.fieldVentingDone) return false;
      if (!j.angleCompliant || !j.minClearancePass || !j.maxClearancePass) return false;
      if (!j.isSigned) return false;
    }
    return true;
  };

  const isFormValid = checkGlobalSafety() && rackMethod && loadId;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div>
            <h1 className="text-xl font-bold tracking-wide text-cyan-400">EBCO Galvanizing System</h1>
            <p className="text-xs text-slate-400">Shop-Floor Loading & Safety Compliance Portal</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-cyan-950 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-800 font-mono">
              Shift: Morning | Station #01
            </span>
          </div>
        </header>

        {/* Global SOP Operating Guidelines (4 Steps) */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>📋</span> Standard Operating Guidelines (SOP Checklist)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Step 1 */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block">1. Hollow Sections & Venting</span>
              <p className="text-slate-300">
                Inspect for enclosed cavities. Ensure vent holes exist at highest & lowest diagonal points to prevent explosion risk in 450°C zinc bath.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block">2. Surface Condition</span>
              <p className="text-slate-300">
                Grade contaminants: <strong>None</strong>, <strong>Mild</strong>, <strong>Moderate</strong>, or <strong>Severe</strong> (oil/paint/heavy rust). Marks determine acid pickling time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block">3. Drainage Angle & Rigging</span>
              <p className="text-slate-300">
                Maintain 15°–30° tilt for efficient zinc flow. Adjust wire/chain length differential based on rigging point distance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block">4. Clearance Constraints</span>
              <p className="text-slate-300">
                <strong>Min Drop Clearance:</strong> ≥ 50 cm (Prevents bath bottom contact).<br/>
                <strong>Max Drop Clearance:</strong> ≤ 400 cm (Prevents crane collision during cross-bay transfer).
              </p>
            </div>

          </div>
        </section>

        {/* Rack Selection & Load ID Generation */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">RACK # / LOADING METHOD *</label>
            <select
              value={rackMethod}
              onChange={handleRackChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Select Rack # or Method --</option>
              <option value="Rack A-12">Rack A-12 (Heavy Structural)</option>
              <option value="Rack B-05">Rack B-05 (Pipe & Hollow)</option>
              <option value="Spinner Basket">Spinner Basket (Small Parts)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">LOAD ID *</label>
            <input
              type="text"
              readOnly
              value={loadId}
              placeholder="Auto-generated based on Rack..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-2.5 text-sm text-cyan-400 font-mono"
            />
          </div>
        </section>

        {/* Customer Jobs Breakdown */}
        {jobs.map((job, jobIdx) => (
          <section key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-cyan-400 text-sm">JOB #{jobIdx + 1} BREAKDOWN</h3>
              {jobs.length > 1 && (
                <button
                  onClick={() => setJobs(jobs.filter((_, idx) => idx !== jobIdx))}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove Job
                </button>
              )}
            </div>

            {/* Customer Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Steel Fab"
                  value={job.customerName}
                  onChange={(e) => {
                    const updated = [...jobs];
                    updated[jobIdx].customerName = e.target.value;
                    setJobs(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer Order #</label>
                <input
                  type="text"
                  placeholder="e.g. 182384"
                  value={job.customerOrder}
                  onChange={(e) => {
                    const updated = [...jobs];
                    updated[jobIdx].customerOrder = e.target.value;
                    setJobs(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer Batch #</label>
                <input
                  type="text"
                  placeholder="e.g. #1"
                  value={job.customerBatch}
                  onChange={(e) => {
                    const updated = [...jobs];
                    updated[jobIdx].customerBatch = e.target.value;
                    setJobs(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Job Safety & SOP Compliance Gatekeeper */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>⚠️</span> Job #{jobIdx + 1} Safety & Quality Verification
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Hollow & Venting */}
                <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>1. Enclosed Cavities Present?</span>
                    <button
                      onClick={() => updateJobSafety(jobIdx, 'hasHollowSections', !job.hasHollowSections)}
                      className={`px-3 py-1 rounded text-xs font-bold ${job.hasHollowSections ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {job.hasHollowSections ? 'YES' : 'NO'}
                    </button>
                  </div>

                  {job.hasHollowSections && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between items-center">
                        <span>2. Sufficient Vent Holes?</span>
                        <button
                          onClick={() => updateJobSafety(jobIdx, 'hasSufficientVenting', !job.hasSufficientVenting)}
                          className={`px-3 py-1 rounded text-xs font-bold ${job.hasSufficientVenting ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                        >
                          {job.hasSufficientVenting ? 'YES' : 'NO'}
                        </button>
                      </div>

                      {!job.hasSufficientVenting && (
                        <div className="flex justify-between items-center">
                          <span className="text-rose-400">3. Field Venting Drilled On-Site?</span>
                          <button
                            onClick={() => updateJobSafety(jobIdx, 'fieldVentingDone', !job.fieldVentingDone)}
                            className={`px-3 py-1 rounded text-xs font-bold ${job.fieldVentingDone ? 'bg-emerald-600 text-white' : 'bg-rose-900 text-rose-200'}`}
                          >
                            {job.fieldVentingDone ? 'COMPLETED' : 'PENDING'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Surface Condition & Angle */}
                <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Surface Condition / Contaminants:</span>
                    <select
                      value={job.surfaceCondition}
                      onChange={(e) => updateJobSafety(jobIdx, 'surfaceCondition', e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200"
                    >
                      <option value="None">None (Clean Steel)</option>
                      <option value="Mild">Mild (Light Oil/Rust)</option>
                      <option value="Moderate">Moderate (Medium Oil/Mill Scale)</option>
                      <option value="Severe">Severe (Heavy Paint/Rust)</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span>Hanging Drainage Angle Compliant (15°-30°)?</span>
                    <button
                      onClick={() => updateJobSafety(jobIdx, 'angleCompliant', !job.angleCompliant)}
                      className={`px-3 py-1 rounded text-xs font-bold ${job.angleCompliant ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                    >
                      {job.angleCompliant ? 'YES' : 'NO'}
                    </button>
                  </div>
                </div>

                {/* 3. Clearance Constraints */}
                <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span>Min Drop Clearance ≥ 50 cm (Prevents Bottom Touch)?</span>
                      <button
                        onClick={() => updateJobSafety(jobIdx, 'minClearancePass', !job.minClearancePass)}
                        className={`px-3 py-1 rounded text-xs font-bold ${job.minClearancePass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                      >
                        {job.minClearancePass ? 'PASS' : 'FAIL'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Max Drop Clearance ≤ 400 cm (Prevents Collision)?</span>
                      <button
                        onClick={() => updateJobSafety(jobIdx, 'maxClearancePass', !job.maxClearancePass)}
                        className={`px-3 py-1 rounded text-xs font-bold ${job.maxClearancePass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                      >
                        {job.maxClearancePass ? 'PASS' : 'FAIL'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Digital Signature */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Operator Badge # Signature:</span>
                  <input
                    type="text"
                    placeholder="Enter Operator ID"
                    value={job.operatorId}
                    onChange={(e) => updateJobSafety(jobIdx, 'operatorId', e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs px-2.5 py-1.5 rounded text-cyan-300 font-mono focus:border-cyan-500"
                  />
                  <button
                    disabled={!job.operatorId}
                    onClick={() => updateJobSafety(jobIdx, 'isSigned', !job.isSigned)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      job.isSigned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-800 disabled:text-slate-600'
                    }`}
                  >
                    {job.isSigned ? 'SIGNED ✓' : 'CONFIRM SIGNATURE'}
                  </button>
                </div>

                {!job.isSigned && (
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    ⚠️ Signature required for job submission.
                  </span>
                )}
              </div>
            </div>

            {/* Workpiece Items Sub-Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Workpiece Items on Job #{jobIdx + 1}</span>
                <button
                  onClick={() => addWorkpiece(jobIdx)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded border border-slate-700"
                >
                  + Add Workpiece Line
                </button>
              </div>

              {job.workpieces.map((wp, wpIdx) => (
                <div key={wp.id} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="Workpiece Type"
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs"
                    />
                    <select className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs">
                      <option>PCS</option>
                      <option>LBS</option>
                      <option>KG</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Total Weight"
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={wp.hangingType}
                        onChange={(e) => {
                          const updated = [...jobs];
                          updated[jobIdx].workpieces[wpIdx].hangingType = e.target.value;
                          setJobs(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-cyan-400 w-full"
                      >
                        <option value="1-Point">1-Point Hanging</option>
                        <option value="2-Point">2-Point Hanging</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Add Another Customer Job Button */}
        <button
          onClick={addJob}
          className="w-full bg-slate-900 border border-dashed border-slate-700 hover:border-cyan-500 text-cyan-400 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          + Add Another Customer Job to Load
        </button>

        {/* Submit Safety Gate */}
        <button
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isFormValid
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isFormValid ? '🔓 CONFIRM & COMPLETE LOADING ENTRY →' : '🔒 SAFETY GATE LOCKED (COMPLETE VERIFICATION & SIGNATURE)'}
        </button>

      </div>
    </div>
  );
}