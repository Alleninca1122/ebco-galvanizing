import React, { useState } from 'react';

// Standard Galvanizing Workpiece Types
const WORKPIECE_TYPES = [
  'Anchor', 'Angle', 'Beam', 'Bracket', 'Frame', 
  'Grating', 'Ladder', 'Mesh', 'Pipe', 'Plate', 
  'Pole', 'Railing', 'Rebar', 'Rod', 'Tube', 'Washer', 'Others'
];

// Hook Option on top, followed by 30 Fixed Racks
const RACK_OPTIONS = [
  { value: 'HOOK', label: '🪝 Hook / Direct Sling (No Rack)' },
  ...Array.from({ length: 30 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return { value: num, label: `Rack #${num}` };
  })
];

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

  // Item Breakdown List (Supports multi-customer / multi-item loading)
  const [items, setItems] = useState([
    {
      id: Date.now(),
      customerName: '',
      customerBatchNo: '',
      workpieceType: '',
      quantity: '',
      weightKg: ''
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

  // Item List Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        customerName: '',
        customerBatchNo: '',
        workpieceType: '',
        quantity: '',
        weightKg: ''
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rackNo || !loadId.trim()) {
      alert('Please select a Rack # or Loading Method first.');
      return;
    }

    const payload = {
      global: {
        loadId: loadId.trim(),
        rackNo: rackNo === 'HOOK' ? 'HOOK' : `Rack #${rackNo}`,
        operatorId: currentUser?.id || 'UNKNOWN',
        shift: currentUser?.shift || 'Morning Shift',
        entryDate: currentDateFormatted,
        createdAt: new Date().toISOString()
      },
      items: items.map(item => ({
        customerName: item.customerName,
        customerBatchNo: item.customerBatchNo,
        workpieceType: item.workpieceType,
        quantity: parseInt(item.quantity, 10) || 0,
        weightKg: parseFloat(item.weightKg) || 0.0
      }))
    };

    console.log('Submitting Production Load Payload:', payload);
    alert(`Load [${loadId.trim()}] recorded successfully!`);

    // Reset Form
    setRackNo('');
    setLoadId('');
    setAutoLoadId('');
    setItems([
      {
        id: Date.now(),
        customerName: '',
        customerBatchNo: '',
        workpieceType: '',
        quantity: '',
        weightKg: ''
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

        {/* 右侧：自动显示日期、星期几 与 班次 */}
        <div className="text-right space-y-0.5">
          <div className="text-xs font-semibold text-slate-300">
            📅 {currentDateFormatted}
          </div>
          <div className="text-xs font-bold text-cyan-300 font-mono">
            🕒 {currentUser?.shift || 'Morning Shift'} | Op: {currentUser?.id || 'UNKNOWN'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

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

        {/* 2. ITEM BREAKDOWN SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Loaded Material Breakdown ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              + Add Another Customer Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                <span className="text-xs font-bold text-slate-400">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Customer Name & Customer Batch # */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Customer Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Steel / Ebco Heavy"
                    value={item.customerName}
                    onChange={(e) => handleItemChange(index, 'customerName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Customer Batch # <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B-2026-01 / PO-8821"
                    value={item.customerBatchNo}
                    onChange={(e) => handleItemChange(index, 'customerBatchNo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Workpiece Type, Quantity, Weight, Loading Operator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Workpiece Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={item.workpieceType}
                    onChange={(e) => handleItemChange(index, 'workpieceType', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Select Type --</option>
                    {WORKPIECE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Quantity (Pcs) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={item.weightKg}
                    onChange={(e) => handleItemChange(index, 'weightKg', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Loading Operator</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.id || 'UNKNOWN'}
                    className="w-full bg-slate-900/50 border border-slate-800/80 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 font-bold cursor-not-allowed"
                  />
                </div>
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