import React, { useState, useEffect } from 'react';

export default function ProductionForm() {
  const [rackMethod, setRackMethod] = useState('');
  const [loadId, setLoadId] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // 格式化当前日期（例如：Sunday, Jul 26, 2026）
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      setCurrentDateStr(now.toLocaleDateString('en-US', options));
    };
    updateDateTime();
  }, []);

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
      minClearancePass: true,
      maxClearancePass: true,
      surfaceCondition: 'None',
      operatorId: '',
      isSigned: false,
      workpieces: [
        {
          id: 1,
          type: '',
          qty: '',
          unit: 'PCS',
          totalWeight: '',
          operator: '7222',
          methodMode: 'Individual Hanging', // Individual Hanging vs String Hanging
          hangingType: '1 Point', // 1 Point vs 2 Points
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

  // Workpiece property updates
  const updateWorkpiece = (jobIndex, wpIndex, field, value) => {
    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].workpieces[wpIndex][field] = value;
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
      operator: '7222',
      methodMode: 'Individual Hanging',
      hangingType: '1 Point',
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
            operator: '7222',
            methodMode: 'Individual Hanging',
            hangingType: '1 Point',
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-12">
      {/* 1. Global Navigation Header (还原顶部蓝黑色跨站导航) */}
      <header className="bg-[#0b1329] border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
        <div>
          <h1 className="font-bold text-sm tracking-wider text-white">EBCO Galvanizing System</h1>
          <p className="text-[10px] text-slate-400">Integrated Shop-Floor Tracking Solution</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 gap-1">
          <button className="bg-cyan-500 text-slate-950 px-3 py-1 rounded font-bold">
            Step 01: Loading Station
          </button>
          <button className="text-slate-400 hover:text-slate-200 px-3 py-1 rounded">
            Steps 02-04: Process Portal
          </button>
        </div>

        {/* User Info & Shift */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-slate-300 font-medium">Morning Shift</div>
            <div className="text-[10px] text-cyan-400 font-mono">👤 7222</div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 text-[11px]">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto mt-6 px-4 space-y-4">
        
        {/* 2. Main Card Header (还原 New Load Entry 标题 + 右侧动态日期与星期) */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                STEP 01: LOADING STATION
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">New Load Entry</h2>
            </div>

            {/* 右侧星期日期 + Shift 标志 */}
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-end gap-1.5">
                <span>📅</span> {currentDateStr || 'Sunday, Jul 26, 2026'}
              </div>
              <span className="inline-block bg-cyan-950/80 text-cyan-400 border border-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded">
                ● Morning Shift
              </span>
            </div>
          </div>

          {/* 3. SOP Operating Guidelines (4步指引) */}
          <section className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>📋</span> SOP Operating Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400 block">1. Hollow Sections & Venting</span>
                <p className="text-slate-300 leading-relaxed">
                  Inspect enclosed cavities. Ensure vent holes at diagonal points to prevent 450°C bath explosion.
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400 block">2. Surface Condition</span>
                <p className="text-slate-300 leading-relaxed">
                  Grade contaminants (None/Mild/Moderate/Severe). Marks dictate acid pickling duration.
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400 block">3. Drainage Angle & Rigging</span>
                <p className="text-slate-300 leading-relaxed">
                  Maintain 15°–30° tilt for zinc flow. Adjust wire/chain length differential accordingly.
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400 block">4. Clearance Constraints</span>
                <p className="text-slate-300 leading-relaxed">
                  Min Drop Clearance ≥ 50 cm (No bath contact). Max Drop Clearance ≤ 400 cm (No crane collision).
                </p>
              </div>
            </div>
          </section>

          {/* 4. Rack Selection & Load ID */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">RACK # / LOADING METHOD *</label>
              <select
                value={rackMethod}
                onChange={handleRackChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Select Rack # or Method --</option>
                <option value="Rack A-12">Rack A-12 (Heavy Structural)</option>
                <option value="Rack B-05">Rack B-05 (Pipe & Hollow)</option>
                <option value="Spinner Basket">Spinner Basket (Small Parts)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">LOAD ID *</label>
              <input
                type="text"
                readOnly
                value={loadId}
                placeholder="Select Rack # first..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-400 font-mono"
              />
            </div>
          </section>

          {/* 5. Customer Jobs Section */}
          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                LOADED MATERIAL BREAKDOWN ({jobs.length} JOB)
              </span>
              <button
                onClick={addJob}
                className="text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add Another Customer Job
              </button>
            </div>

            {jobs.map((job, jobIdx) => (
              <div key={job.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-cyan-400 text-xs">JOB #{jobIdx + 1}</h3>
                  {jobs.length > 1 && (
                    <button
                      onClick={() => setJobs(jobs.filter((_, idx) => idx !== jobIdx))}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Job
                    </button>
                  )}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. ABC Steel / West Coast Fab"
                      value={job.customerName}
                      onChange={(e) => {
                        const updated = [...jobs];
                        updated[jobIdx].customerName = e.target.value;
                        setJobs(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Customer Order # *</label>
                    <input
                      type="text"
                      placeholder="e.g. 182384"
                      value={job.customerOrder}
                      onChange={(e) => {
                        const updated = [...jobs];
                        updated[jobIdx].customerOrder = e.target.value;
                        setJobs(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Customer Batch # *</label>
                    <input
                      type="text"
                      placeholder="e.g. #1, if first batch enter #1"
                      value={job.customerBatch}
                      onChange={(e) => {
                        const updated = [...jobs];
                        updated[jobIdx].customerBatch = e.target.value;
                        setJobs(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Job Safety Checklist */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>⚠️</span> JOB #{jobIdx + 1} SAFETY & QUALITY VERIFICATION
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span>1. Enclosed Cavities Present?</span>
                        <button
                          onClick={() => updateJobSafety(jobIdx, 'hasHollowSections', !job.hasHollowSections)}
                          className={`px-2.5 py-0.5 rounded font-bold ${job.hasHollowSections ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
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
                              className={`px-2.5 py-0.5 rounded font-bold ${job.hasSufficientVenting ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                            >
                              {job.hasSufficientVenting ? 'YES' : 'NO'}
                            </button>
                          </div>

                          {!job.hasSufficientVenting && (
                            <div className="flex justify-between items-center">
                              <span className="text-rose-400">3. Field Venting Drilled On-Site?</span>
                              <button
                                onClick={() => updateJobSafety(jobIdx, 'fieldVentingDone', !job.fieldVentingDone)}
                                className={`px-2.5 py-0.5 rounded font-bold ${job.fieldVentingDone ? 'bg-emerald-600 text-white' : 'bg-rose-900 text-rose-200'}`}
                              >
                                {job.fieldVentingDone ? 'COMPLETED' : 'PENDING'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span>Surface Condition / Contaminants:</span>
                        <select
                          value={job.surfaceCondition}
                          onChange={(e) => updateJobSafety(jobIdx, 'surfaceCondition', e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-[11px] rounded px-2 py-0.5 text-slate-200"
                        >
                          <option value="None">None (Clean Steel)</option>
                          <option value="Mild">Mild (Light Oil/Rust)</option>
                          <option value="Moderate">Moderate (Medium Oil/Mill Scale)</option>
                          <option value="Severe">Severe (Heavy Paint/Rust)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span>Hanging Angle Compliant (15°-30°)?</span>
                        <button
                          onClick={() => updateJobSafety(jobIdx, 'angleCompliant', !job.angleCompliant)}
                          className={`px-2.5 py-0.5 rounded font-bold ${job.angleCompliant ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                        >
                          {job.angleCompliant ? 'YES' : 'NO'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex justify-between items-center">
                          <span>Min Drop Clearance ≥ 50 cm (Prevents Bottom Touch)?</span>
                          <button
                            onClick={() => updateJobSafety(jobIdx, 'minClearancePass', !job.minClearancePass)}
                            className={`px-2.5 py-0.5 rounded font-bold ${job.minClearancePass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                          >
                            {job.minClearancePass ? 'PASS' : 'FAIL'}
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>Max Drop Clearance ≤ 400 cm (Prevents Collision)?</span>
                          <button
                            onClick={() => updateJobSafety(jobIdx, 'maxClearancePass', !job.maxClearancePass)}
                            className={`px-2.5 py-0.5 rounded font-bold ${job.maxClearancePass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                          >
                            {job.maxClearancePass ? 'PASS' : 'FAIL'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operator Badge & Signature */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Operator Badge # Signature:</span>
                      <input
                        type="text"
                        placeholder="Enter Operator ID"
                        value={job.operatorId}
                        onChange={(e) => updateJobSafety(jobIdx, 'operatorId', e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-[11px] px-2 py-1 rounded text-cyan-300 font-mono w-32 focus:border-cyan-500"
                      />
                      <button
                        disabled={!job.operatorId}
                        onClick={() => updateJobSafety(jobIdx, 'isSigned', !job.isSigned)}
                        className={`px-3 py-1 rounded font-bold transition-all ${
                          job.isSigned
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-800 disabled:text-slate-600'
                        }`}
                      >
                        {job.isSigned ? 'SIGNED ✓' : 'CONFIRM SIGNATURE'}
                      </button>
                    </div>

                    {!job.isSigned && (
                      <span className="text-amber-400">⚠️ Signature required for job submission.</span>
                    )}
                  </div>
                </div>

                {/* Workpieces Table (还原原有的 Individual/String Hanging + 1 Point / 2 Points 参数框) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      WORKPIECE ITEMS ON THIS JOB
                    </span>
                    <button
                      onClick={() => addWorkpiece(jobIdx)}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded border border-slate-700"
                    >
                      + Add Workpiece Line
                    </button>
                  </div>

                  {job.workpieces.map((wp, wpIdx) => (
                    <div key={wp.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Workpiece Type *</label>
                          <select
                            value={wp.type}
                            onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'type', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                          >
                            <option value="">--Select--</option>
                            <option value="Hollow Beam">Hollow Beam</option>
                            <option value="Pipe / Tube">Pipe / Tube</option>
                            <option value="Plate / Sheet">Plate / Sheet</option>
                            <option value="Small Hardware">Small Hardware</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Qty *</label>
                          <input
                            type="number"
                            value={wp.qty}
                            onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'qty', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Unit</label>
                          <select
                            value={wp.unit}
                            onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'unit', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                          >
                            <option value="PCS">PCS</option>
                            <option value="LBS">LBS</option>
                            <option value="KG">KG</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Total Weight (lb)</label>
                          <input
                            type="number"
                            placeholder="Total lbs"
                            value={wp.totalWeight}
                            onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'totalWeight', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Operator</label>
                          <input
                            type="text"
                            value={wp.operator}
                            readOnly
                            className="w-full bg-slate-950/50 border border-slate-800 rounded p-1.5 text-xs text-slate-400 font-mono"
                          />
                        </div>
                      </div>

                      {/* 绑挂模式选择面板 (1 Point / 2 Points 细节参数) */}
                      <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                            <span className="font-semibold text-slate-300">Hanging & Rigging for Line #{wpIdx + 1}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Individual vs String */}
                            <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5 text-[10px]">
                              <button
                                onClick={() => updateWorkpiece(jobIdx, wpIdx, 'methodMode', 'Individual Hanging')}
                                className={`px-2 py-0.5 rounded font-bold ${wp.methodMode === 'Individual Hanging' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                              >
                                Individual Hanging
                              </button>
                              <button
                                onClick={() => updateWorkpiece(jobIdx, wpIdx, 'methodMode', 'String Hanging')}
                                className={`px-2 py-0.5 rounded font-bold ${wp.methodMode === 'String Hanging' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                              >
                                String Hanging (串挂)
                              </button>
                            </div>

                            {/* 1 Point vs 2 Points */}
                            <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5 text-[10px]">
                              <button
                                onClick={() => updateWorkpiece(jobIdx, wpIdx, 'hangingType', '1 Point')}
                                className={`px-2 py-0.5 rounded font-bold ${wp.hangingType === '1 Point' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                              >
                                1 Point
                              </button>
                              <button
                                onClick={() => updateWorkpiece(jobIdx, wpIdx, 'hangingType', '2 Points')}
                                className={`px-2 py-0.5 rounded font-bold ${wp.hangingType === '2 Points' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                              >
                                2 Points
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hanging Specs Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Point 1 Spec *</label>
                              <select
                                value={wp.point1Spec}
                                onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'point1Spec', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"
                              >
                                <option>12 Gauge Wire</option>
                                <option>10 Gauge Wire</option>
                                <option>3/8 Chain</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Strands / Lines *</label>
                              <select
                                value={wp.point1Strands}
                                onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'point1Strands', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"
                              >
                                <option>e.g. 3</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                              </select>
                            </div>
                          </div>

                          {wp.hangingType === '2 Points' && (
                            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Point 2 Spec *</label>
                                <select
                                  value={wp.point2Spec}
                                  onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'point2Spec', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"
                                >
                                  <option>12 Gauge Wire</option>
                                  <option>10 Gauge Wire</option>
                                  <option>3/8 Chain</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Strands / Lines *</label>
                                <select
                                  value={wp.point2Strands}
                                  onChange={(e) => updateWorkpiece(jobIdx, wpIdx, 'point2Strands', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"
                                >
                                  <option>e.g. 3</option>
                                  <option>1</option>
                                  <option>2</option>
                                  <option>3</option>
                                  <option>4</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Safety Gate Button */}
          <button
            disabled={!isFormValid}
            className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xl transition-all ${
              isFormValid
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isFormValid ? 'CONFIRM & COMPLETE LOADING ENTRY →' : '🔒 COMPLETE SAFETY VERIFICATION & SIGNATURE TO PROCEED'}
          </button>
        </div>
      </main>
    </div>
  );
}