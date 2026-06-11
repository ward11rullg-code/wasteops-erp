"use client";

import { useEffect, useState } from "react";

interface Vehicle {
  id: number;
  vehicleNumber: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
  capacityTons: string | null;
  fuelType: string | null;
  status: string | null;
  mileage: number | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  insuranceExpiry: string | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  maintenance: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  out_of_service: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  retired: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

const fuelIcons: Record<string, string> = {
  diesel: "⛽",
  CNG: "🌿",
  electric: "⚡",
  hybrid: "🔋",
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    vehicleNumber: "", type: "", make: "", model: "", year: "",
    licensePlate: "", capacityTons: "", fuelType: "diesel", status: "active",
    mileage: "", lastMaintenanceDate: "", nextMaintenanceDate: "", insuranceExpiry: "",
  });

  const fetchVehicles = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/vehicles?${params}`);
    const data = await res.json();
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [statusFilter]);

  const handleSave = async () => {
    const body = { ...form, year: form.year ? parseInt(form.year) : null, mileage: form.mileage ? parseInt(form.mileage) : null };
    if (editingVehicle) {
      await fetch(`/api/vehicles/${editingVehicle.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowModal(false);
    setEditingVehicle(null);
    setForm({ vehicleNumber: "", type: "", make: "", model: "", year: "", licensePlate: "", capacityTons: "", fuelType: "diesel", status: "active", mileage: "", lastMaintenanceDate: "", nextMaintenanceDate: "", insuranceExpiry: "" });
    fetchVehicles();
  };

  const handleEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({
      vehicleNumber: v.vehicleNumber, type: v.type, make: v.make || "", model: v.model || "",
      year: v.year?.toString() || "", licensePlate: v.licensePlate || "", capacityTons: v.capacityTons || "",
      fuelType: v.fuelType || "diesel", status: v.status || "active", mileage: v.mileage?.toString() || "",
      lastMaintenanceDate: v.lastMaintenanceDate || "", nextMaintenanceDate: v.nextMaintenanceDate || "",
      insuranceExpiry: v.insuranceExpiry || "",
    });
    setShowModal(true);
  };

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === "active").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
    outOfService: vehicles.filter(v => v.status === "out_of_service").length,
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Fleet Management</h1>
          <p className="text-slate-500 mt-1">Track and manage your vehicle fleet</p>
        </div>
        <button onClick={() => { setEditingVehicle(null); setForm({ vehicleNumber: "", type: "", make: "", model: "", year: "", licensePlate: "", capacityTons: "", fuelType: "diesel", status: "active", mileage: "", lastMaintenanceDate: "", nextMaintenanceDate: "", insuranceExpiry: "" }); setShowModal(true); }} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Vehicles</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.maintenance}</p>
          <p className="text-xs text-slate-500">In Maintenance</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.outOfService}</p>
          <p className="text-xs text-slate-500">Out of Service</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        {["", "active", "maintenance", "out_of_service"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {s === "" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Vehicle Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => {
            const sc = statusConfig[v.status || "active"] || statusConfig.active;
            return (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{v.vehicleNumber}</h3>
                    <p className="text-sm text-slate-500">{v.make} {v.model} {v.year}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {v.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium">{v.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity</span>
                    <span className="font-medium">{v.capacityTons} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fuel</span>
                    <span className="font-medium">{fuelIcons[v.fuelType || ""] || "⛽"} {v.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mileage</span>
                    <span className="font-medium">{v.mileage?.toLocaleString() || "—"} mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">License</span>
                    <span className="font-medium font-mono text-xs">{v.licensePlate || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Service</span>
                    <span className={`font-medium ${v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) < new Date() ? "text-red-600" : ""}`}>
                      {v.nextMaintenanceDate ? new Date(v.nextMaintenanceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => handleEdit(v)} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingVehicle ? "Edit Vehicle" : "New Vehicle"}</h2>
              <button onClick={() => { setShowModal(false); setEditingVehicle(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number</label>
                <input type="text" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="e.g., Rear Loader" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                <input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label>
                <input type="text" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (tons)</label>
                <input type="text" value={form.capacityTons} onChange={(e) => setForm({ ...form, capacityTons: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mileage</label>
                <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Maintenance</label>
                <input type="date" value={form.lastMaintenanceDate} onChange={(e) => setForm({ ...form, lastMaintenanceDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Maintenance</label>
                <input type="date" value={form.nextMaintenanceDate} onChange={(e) => setForm({ ...form, nextMaintenanceDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button onClick={() => { setShowModal(false); setEditingVehicle(null); }} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
