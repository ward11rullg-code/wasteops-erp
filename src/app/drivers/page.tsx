"use client";

import { useEffect, useState } from "react";

interface Driver {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  cdlClass: string | null;
  hireDate: string | null;
  isActive: boolean | null;
  currentVehicleId: number | null;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", email: "", phone: "",
    licenseNumber: "", licenseExpiry: "", cdlClass: "B", hireDate: "", isActive: true,
  });

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSave = async () => {
    if (editingDriver) {
      await fetch(`/api/customers/${editingDriver.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => {});
    }
    await fetch("/api/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false);
    setEditingDriver(null);
    setForm({ employeeId: "", firstName: "", lastName: "", email: "", phone: "", licenseNumber: "", licenseExpiry: "", cdlClass: "B", hireDate: "", isActive: true });
    fetchDrivers();
  };

  const isLicenseExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expDate = new Date(date);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return expDate < threeMonths;
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Drivers</h1>
          <p className="text-slate-500 mt-1">Manage drivers and CDL certifications</p>
        </div>
        <button onClick={() => { setEditingDriver(null); setForm({ employeeId: "", firstName: "", lastName: "", email: "", phone: "", licenseNumber: "", licenseExpiry: "", cdlClass: "B", hireDate: "", isActive: true }); setShowModal(true); }}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{drivers.length}</p>
          <p className="text-xs text-slate-500">Total Drivers</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{drivers.filter(d => d.isActive).length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{drivers.filter(d => d.cdlClass === "A").length}</p>
          <p className="text-xs text-slate-500">CDL Class A</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry)).length}</p>
          <p className="text-xs text-slate-500">License Expiring Soon</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">CDL Class</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">License #</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">License Expiry</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Hire Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">No drivers found</td></tr>
            ) : (
              drivers.map(d => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                        {d.firstName[0]}{d.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{d.firstName} {d.lastName}</p>
                        <p className="text-xs text-slate-400">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{d.employeeId}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${d.cdlClass === "A" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      Class {d.cdlClass}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{d.licenseNumber || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`${isLicenseExpiringSoon(d.licenseExpiry) ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                      {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      {isLicenseExpiringSoon(d.licenseExpiry) && " ⚠️"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{d.phone || "—"}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {d.hireDate ? new Date(d.hireDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${d.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingDriver ? "Edit Driver" : "New Driver"}</h2>
              <button onClick={() => { setShowModal(false); setEditingDriver(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry</label>
                <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CDL Class</label>
                <select value={form.cdlClass} onChange={(e) => setForm({ ...form, cdlClass: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label>
                <input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button onClick={() => { setShowModal(false); setEditingDriver(null); }} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
