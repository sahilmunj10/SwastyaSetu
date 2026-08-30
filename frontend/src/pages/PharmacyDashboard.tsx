import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Medicine } from '../types';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  TrendingDown, 
  Building2, 
  Calendar 
} from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restock modal
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [addQuantity, setAddQuantity] = useState('200');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await api.getMedicines();
      setMedicines(res.medicines || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;
    setUpdating(true);
    try {
      const newQty = selectedMed.quantity + Number(addQuantity);
      await api.updateMedicineStock(selectedMed.id, {
        quantity: newQty,
        isAvailable: newQty > 0
      });
      setSuccessMsg(`Restocked ${selectedMed.name} (+${addQuantity} units). Total stock: ${newQty}.`);
      setSelectedMed(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesLowStock = !lowStockOnly || m.isLowStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockItems = medicines.filter(m => m.isLowStock);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading Pharmacy Inventory...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Toast */}
      {successMsg && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Public Health Pharmacy & Drug Inventory
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {user?.facilityName || 'Essential Drugs Store'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name || 'Pharmacist'} (Pharmacy Officer)
          </h1>
          <p className="text-xs text-slate-300">
            Total Monitored Drug SKUs: <strong className="text-white">{medicines.length}</strong> • Low-Stock Warnings: <strong className="text-amber-300">{lowStockItems.length}</strong>
          </p>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Critical Drug Stock-Out Warning (Immediate Indent Required):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockItems.map(m => (
              <div key={m.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{m.name} ({m.strength})</div>
                  <div className="text-slate-500 text-[11px]">{m.facility?.name}</div>
                  <div className="text-[10px] text-red-700 font-bold mt-1">
                    Remaining: {m.quantity} units (Threshold: {m.reorderThreshold})
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMed(m)}
                  className="px-3 py-1.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-lg text-[11px] shadow transition shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-600" />
              <span>Public Healthcare Medicine Inventory</span>
            </h3>
            <p className="text-xs text-slate-500">Essential drug supplies across primary and secondary government hospitals</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drug..."
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Antihypertensive">Antihypertensive</option>
              <option value="Maternal Health">Maternal Health</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotics">Antibiotics</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Medicine Name</th>
                <th className="p-3.5">Category & Form</th>
                <th className="p-3.5">Facility Location</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-700">No medicines found in inventory</div>
                    <p className="text-[11px] text-slate-400">Add stock items from the central pharmacy warehouse indent.</p>
                  </td>
                </tr>
              ) : filteredMedicines.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.genericName} • {m.strength}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{m.category}</div>
                    <div className="text-[10px] text-slate-500">{m.dosageForm}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-slate-700">{m.facility?.name}</div>
                    <div className="text-[10px] text-slate-400">Batch: {m.batchNumber}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-mono font-bold text-sm text-slate-900">{m.quantity} units</div>
                    <div className="text-[10px] text-slate-500">Threshold: {m.reorderThreshold}</div>
                  </td>

                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      m.quantity === 0
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : m.isLowStock
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {m.quantity === 0 ? '🔴 Out of Stock' : m.isLowStock ? '🟡 Low Stock' : '🟢 Available'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedMed(m)}
                      className="px-3 py-1.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-lg text-[11px] transition"
                    >
                      Update Stock
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Restock Modal */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-slate-900 space-y-4">
            
            <div className="bg-gov-navy text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gov-blue rounded-xl">
                  <Pill className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Restock Medication</h3>
                  <p className="text-xs text-slate-300">{selectedMed.name} ({selectedMed.strength})</p>
                </div>
              </div>
              <button onClick={() => setSelectedMed(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRestock} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Stock in Store</label>
                <div className="font-bold text-lg font-mono text-slate-900">{selectedMed.quantity} units</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Add Quantity (Units Received from Central Indent) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedMed(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  {updating ? 'Saving...' : 'Update & Confirm Stock'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
