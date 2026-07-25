import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { getLogEditPermission } from '../utils/permission';

export default function ProductionForm({ currentUser, activeShift, onRefreshLogs, recentLogs }) {
  const [workOrder, setWorkOrder] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('');
  const [defectType, setDefectType] = useState('None');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Correction State
  const [correctionTarget, setCorrectionTarget] = useState(null);
  const [amendedWeight, setAmendedWeight] = useState('');
  const [amendedDefect, setAmendedDefect] = useState('None');
  const [changeReason, setChangeReason] = useState('');

  // Submit Final Entry
  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!workOrder) {
      alert('Please enter or scan a Work Order number');
      return;
    }

    setSubmitting(true);

    const logEntry = {
      work_order: workOrder,
      customer_name: customerName,
      quantity_pcs: parseInt(quantity, 10) || 1,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      defect_type: defectType,
      remarks: remarks,
      shift_type: activeShift,
      operator_id: currentUser.employee_id,
      operator_name: currentUser.preferred_name || currentUser.name,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('production_logs').insert([logEntry]);
      if (error) throw error;

      alert('✅ Production entry submitted successfully!');
      setWorkOrder('');
      setCustomerName('');
      setQuantity('1');
      setWeightKg('');
      setDefectType('None');
      setRemarks('');
      if (onRefreshLogs) onRefreshLogs();
    } catch (err) {
      alert('⚠️ Error submitting entry: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Append Correction
  const handleAppendCorrection = async (e) => {
    e.preventDefault();
    if (!changeReason) {
      alert('Please select or enter a reason for this correction.');
      return;
    }

    setSubmitting(true);

    try {
      const auditPayload = {
        log_id: correctionTarget.id,
        field_name: 'weight_kg / defect_type',
        old_value: `Weight: ${correctionTarget.weight_kg}kg | Defect: ${correctionTarget.defect_type}`,
        new_value: `Weight: ${amendedWeight}kg | Defect: ${amendedDefect}`,
        reason_for_change: changeReason,
        changed_by_id: currentUser.employee_id,
        changed_by_name: currentUser.preferred_name || currentUser.name,
      };

      await supabase.from('log_audit_history').insert([auditPayload]);

      await supabase
        .from('production_logs')
        .update({
          weight_kg: parseFloat(amendedWeight),
          defect_type: amendedDefect,
          updated_at: new Date().toISOString(),
        })
        .eq('id', correctionTarget.id);

      alert('✅ Correction appended to audit history!');
      setCorrectionTarget(null);
      if (onRefreshLogs) onRefreshLogs();
    } catch (err) {
      alert('⚠️ Error saving correction: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            New Production Entry - {activeShift}
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
            Drafting Mode (Editable before submit)
          </span>
        </div>

        <form onSubmit={handleSubmitEntry} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Order Number * (Scan / Enter)
              </label>
              <input
                type="text"
                required
                placeholder="WO-2026-888"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl font-mono text-base focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ebco Heavy Industries"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (Pcs)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Defect Category</label>
              <select
                value={defectType}
                onChange={(e) => setDefectType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-cyan-500"
              >
                <option value="None">None / Clear Surface</option>
                <option value="Bare Spot">Bare Spot (Uncoated)</option>
                <option value="Zinc Ash/Dross">Zinc Ash / Dross</option>
                <option value="Pimples">Pimples / Heavy Coating</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks & Inspection Notes</label>
            <textarea
              rows="2"
              placeholder="Record mil thickness or surface notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Submitting to Ledger...' : 'Submit Entry to Database'}
          </button>
        </form>
      </div>

      {/* Submitted Logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-2 uppercase tracking-wide">
          Recent Shift Entries & Audit History
        </h3>

        {!recentLogs || recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No entries logged yet for this shift.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const perm = getLogEditPermission(log.created_at, currentUser.role);
              return (
                <div key={log.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">WO: {log.work_order}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {log.weight_kg ? `${log.weight_kg} kg` : 'No Weight'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Logged by: {log.operator_name} at {new Date(log.created_at).toLocaleTimeString()} ({perm.hoursElapsed}h ago)
                    </p>
                  </div>

                  {perm.canEdit ? (
                    <button
                      onClick={() => {
                        setCorrectionTarget(log);
                        setAmendedWeight(log.weight_kg || '');
                        setAmendedDefect(log.defect_type || 'None');
                      }}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      ✏️ Correct Log
                    </button>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full font-semibold">
                      🔒 Locked ({perm.hoursElapsed}h / {perm.allowedHours}h max)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Append Correction Modal */}
      {correctionTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              Append Correction - WO: {correctionTarget.work_order}
            </h3>

            <form onSubmit={handleAppendCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Correct Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amendedWeight}
                  onChange={(e) => setAmendedWeight(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Defect Category</label>
                <select
                  value={amendedDefect}
                  onChange={(e) => setAmendedDefect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="None">None / Clear Surface</option>
                  <option value="Bare Spot">Bare Spot (Uncoated)</option>
                  <option value="Zinc Ash/Dross">Zinc Ash / Dross</option>
                  <option value="Pimples">Pimples / Heavy Coating</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Correction *</label>
                <select
                  required
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="">Select Reason...</option>
                  <option value="Scale calibration error">Scale calibration error</option>
                  <option value="Typo during manual entry">Typo during manual entry</option>
                  <option value="Re-weighed after dross removal">Re-weighed after dross removal</option>
                  <option value="Supervisor audit override">Supervisor audit override</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Append Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}