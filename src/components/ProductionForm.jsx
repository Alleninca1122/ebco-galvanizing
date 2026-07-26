import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Send, 
  Plus, 
  Trash2, 
  UserCheck, 
  Clock, 
  Calendar 
} from 'lucide-react';

export default function ProductionForm() {
  const [activeTab, setActiveTab] = useState('loading'); // loading, process
  const [shift, setShift] = useState('Morning Shift');
  const [operatorId, setOperatorId] = useState('7222');
  
  // Header / Common States
  const [rackMethod, setRackMethod] = useState('');
  const [loadId, setLoadId] = useState('');

  // Customer Jobs State
  const [jobs, setJobs] = useState([
    {
      id: 1,
      customerName: '',
      customerOrder: '',
      customerBatch: '',
      items: [
        {
          id: 1,
          workpieceType: '',
          qty: '',
          unit: 'pcs',
          totalWeight: '',
          operator: '7222',
          hangingStyle: 'Individual Hanging',
          points: '1 & 2 Points',
          point1Spec: '12 Gauge Wire',
          point1Strands: '3',
          point2Spec: '12 Gauge Wire',
          point2Strands: '3'
        }
      ]
    }
  ]);

  // Handle adding new job block
  const handleAddJob = () => {
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        customerName: '',
        customerOrder: '',
        customerBatch: '',
        items: [
          {
            id: Date.now() + 1,
            workpieceType: '',
            qty: '',
            unit: 'pcs',
            totalWeight: '',
            operator: operatorId,
            hangingStyle: 'Individual Hanging',
            points: '1 & 2 Points',
            point1Spec: '12 Gauge Wire',
            point1Strands: '3',
            point2Spec: '12 Gauge Wire',
            point2Strands: '3'
          }
        ]
      }
    ]);
  };

  // Handle adding new item line within a job
  const handleAddItem = (jobId) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          items: [
            ...job.items,
            {
              id: Date.now(),
              workpieceType: '',
              qty: '',
              unit: 'pcs',
              totalWeight: '',
              operator: operatorId,
              hangingStyle: 'Individual Hanging',
              points: '1 & 2 Points',
              point1Spec: '12 Gauge Wire',
              point1Strands: '3',
              point2Spec: '12 Gauge Wire',
              point2Strands: '3'
            }
          ]
        };
      }
      return job;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Full Production Entry:', {
      shift,
      operatorId,
      rackMethod,
      loadId,
      jobs
    });
    alert('Production Load Entry Saved Successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      {/* Top Global Navigation Bar */}
      <header className="bg-[#111827] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 text-slate-950 font-black px-2 py-1 rounded text-sm tracking-wider">
            EBCO
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              EBCO Galvanizing System
            </h1>
            <p className="text-[11px] text-slate-400">
              Integrated Shop-Floor Tracking Solution
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('loading')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'loading'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Step 01: Loading Station
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'process'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Steps 02-04: Process Portal
          </button>
        </div>

        {/* User / Shift Indicator */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <div className="text-right">
              <div className="text-slate-200 font-medium">{shift}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>ID: {operatorId}</span>
              </div>
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Step 01 Banner */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">
              Step 01: Loading Station
            </span>
            <h2 className="text-2xl font-extrabold text-white">New Load Entry</h2>
          </div>
          <div className="text-right text-xs text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Sunday, Jul 26, 2026</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
            <span className="text-emerald-400 font-medium">{shift}</span>
          </div>
        </div>

        {/* SOP Operating Guidelines Card */}
        <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4" />
            <span>SOP Operating Guidelines</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-slate-200">1. Tie Wire Knotting</div>
              <p className="text-[11px] text-slate-400">
                Wrap wire around workpiece body at least 3 full turns. Do not over-twist knots.
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="text-xs font-bold text-slate-200">2. Drainage & Venting Angle</div>
              <p className="text-[11px] text-slate-400">
                Maintain a 15° - 30° tilt angle for smooth zinc drainage. Ensure vent holes are open on all hollow structures.
              </p>
            </div>
          </div>
        </div>

        {/* Form Main Area */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Rack Selector & Load ID Block */}
          <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Rack # / Loading Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={rackMethod}
                onChange={(e) => {
                  setRackMethod(e.target.value);
                  if (e.target.value && !loadId) {
                    setLoadId(`LOAD-${Date.now().toString().slice(-6)}`);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              >
                <option value="">-- Select Rack # or Method --</option>
                <option value="Rack A">Rack A</option>
                <option value="Rack B">Rack B</option>
                <option value="Rack C">Rack C</option>
                <option value="Basket">Basket</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Load ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                placeholder="Select Rack # first..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Auto-generated. Editable if needed.</p>
            </div>
          </div>

          {/* Customer Jobs Section Header */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Loaded Material Breakdown ({jobs.length} Job{jobs.length > 1 ? 's' : ''})
            </h3>
            <button
              type="button"
              onClick={handleAddJob}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Customer Job
            </button>
          </div>

          {/* Render Job Cards */}
          {jobs.map((job, jobIdx) => (
            <div key={job.id} className="bg-[#111827]/80 border border-sky-950/60 rounded-xl p-5 shadow-xl space-y-4">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Job #{jobIdx + 1}</span>
                {jobs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setJobs(jobs.filter(j => j.id !== job.id))}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Customer Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Steel / West Coast Fab"
                    value={job.customerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setJobs(jobs.map(j => j.id === job.id ? { ...j, customerName: val } : j));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customer Order # <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 302364"
                    value={job.customerOrder}
                    onChange={(e) => {
                      const val = e.target.value;
                      setJobs(jobs.map(j => j.id === job.id ? { ...j, customerOrder: val } : j));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customer Batch # <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #5, IF first batch enter #1"
                    value={job.customerBatch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setJobs(jobs.map(j => j.id === job.id ? { ...j, customerBatch: val } : j));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Workpiece Items Title & Add Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Workpiece Items on This Job
                </span>
                <button
                  type="button"
                  onClick={() => handleAddItem(job.id)}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Workpiece Line
                </button>
              </div>

              {/* Workpiece Items Lines */}
              {job.items.map((item, itemIdx) => (
                <div key={item.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Workpiece Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.workpieceType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJobs(jobs.map(j => j.id === job.id ? {
                            ...j,
                            items: j.items.map(it => it.id === item.id ? { ...it, workpieceType: val } : it)
                          } : j));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option value="Structural Beam">Structural Beam</option>
                        <option value="Pipe / Tube">Pipe / Tube</option>
                        <option value="Plate / Bracket">Plate / Bracket</option>
                        <option value="Custom Assembly">Custom Assembly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Qty <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.qty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJobs(jobs.map(j => j.id === job.id ? {
                            ...j,
                            items: j.items.map(it => it.id === item.id ? { ...it, qty: val } : it)
                          } : j));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        readOnly
                        className="w-full bg-slate-950/50 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Total Weight (lb)</label>
                      <input
                        type="text"
                        placeholder="Total lbs"
                        value={item.totalWeight}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJobs(jobs.map(j => j.id === job.id ? {
                            ...j,
                            items: j.items.map(it => it.id === item.id ? { ...it, totalWeight: val } : it)
                          } : j));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Operator</label>
                      <input
                        type="text"
                        value={item.operator}
                        readOnly
                        className="w-full bg-slate-950/50 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Hanging & Rigging Config */}
                  <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-400 font-bold">⚙️ Hanging & Rigging for Line #{itemIdx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded">
                          ● Individual Hanging
                        </span>
                        <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] px-2 py-0.5 rounded">
                          String Hanging (串挂)
                        </span>
                        <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[10px] px-2 py-0.5 rounded font-mono">
                          1 Point
                        </span>
                        <span className="bg-sky-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono">
                          1 & 2 Points
                        </span>
                      </div>
                    </div>

                    {/* Point Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Point 1 Spec *</div>
                          <div className="font-semibold text-slate-200">{item.point1Spec}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Strands / Lines *</div>
                          <div className="font-mono text-sky-400 font-bold">4-5 / 3</div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Point 2 Spec *</div>
                          <div className="font-semibold text-slate-200">{item.point2Spec}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Strands / Lines *</div>
                          <div className="font-mono text-sky-400 font-bold">4-5 / 3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm shadow-lg shadow-sky-500/10 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              CONFIRM & COMPLETE LOADING ENTRY
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}