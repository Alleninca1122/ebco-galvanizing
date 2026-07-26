import React, { useState } from 'react';
import { ShieldAlert, BookOpen, AlertCircle, CheckCircle2, Info, Send } from 'lucide-react';

export default function ProductionForm() {
  const [stage, setStage] = useState('pre-treatment');
  const [formData, setFormData] = useState({
    rackId: '',
    operator: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Production Record:', { stage, ...formData });
    alert('Production record saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          HDG Shop-Floor SOP & Production Entry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Hot-Dip Galvanizing Process Control & Defect Prevention System
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Interactive SOP Guidelines */}
        <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-semibold border-b border-slate-800 pb-2">
            <BookOpen className="w-5 h-5" />
            <h2>Stage Operating Guidelines (SOP)</h2>
          </div>

          {stage === 'pre-treatment' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  🧪 1. Degreasing & Acid Pickling
                </div>
                <p className="text-[11px] text-slate-300">
                  Verify surface oil removal and rust scale clearance. Ensure proper water rinsing between acid bath and flux tank to prevent contamination.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  💧 2. Fluxing Bath Parameters
                </div>
                <p className="text-[11px] text-slate-300">
                  Target Baume: 12 - 18° Bé. Keep pH between 3.5 and 4.5. Fe content must remain strictly below 0.5% (5 g/L).
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  📐 3. Hanging Angle & Wire Calculation
                </div>
                <p className="text-[11px] text-slate-300">
                  Maintain <strong>15° - 30° tilt angle</strong>. Adjust wire/chain length differential between Point 1 & Point 2 based on span distance (L_wire).
                </p>
              </div>
            </div>
          )}

          {stage === 'galvanizing' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  🔥 1. Kettle Temperature & Immersion
                </div>
                <p className="text-[11px] text-slate-300">
                  Optimal kettle temp: 445°C - 455°C. Lower rack smoothly to prevent splatter and thermal shock.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  ⏱️ 2. Withdrawal Speed Control
                </div>
                <p className="text-[11px] text-slate-300">
                  Slow withdrawal allows proper liquid zinc drainage, minimizing excess build-up and runs.
                </p>
              </div>
            </div>
          )}

          {stage === 'inspection' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  🔍 1. Visual & Thickness Check
                </div>
                <p className="text-[11px] text-slate-300">
                  Inspect for bare spots, pimples, or ash inclusion. Verify coating thickness meets minimum specs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Production Logging Form */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h2>Production Execution Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stage Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Select Process Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="pre-treatment">1. Pre-Treatment & Racking</option>
                <option value="galvanizing">2. Galvanizing Kettle</option>
                <option value="inspection">3. Inspection & Post-Treatment</option>
              </select>
            </div>

            {/* Rack ID */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Rack / Lot ID
              </label>
              <input
                type="text"
                placeholder="e.g. RACK-2026-0701"
                value={formData.rackId}
                onChange={(e) => setFormData({ ...formData, rackId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Operator Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Operator / Inspector Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Stage Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Process Notes & Defect Logs
              </label>
              <textarea
                rows={3}
                placeholder="Record any anomalies or specific measurements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Save Record
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}