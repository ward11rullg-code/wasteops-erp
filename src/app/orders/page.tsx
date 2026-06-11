"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string | null;
  completedAt: string | null;
  weightTons: string | null;
  containerSize: string | null;
  numberOfContainers: number | null;
  pickupAddress: string | null;
  notes: string | null;
  customerName: string | null;
  driverName: string | null;
  driverLastName: string | null;
  vehicleNumber: string | null;
  wasteTypeName: string | null;
}

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  scheduled: { bg: "bg-blue-50", text: "text-blue-700", icon: "📅" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", icon: "🔄" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", icon: "❌" },
  pending: { bg: "bg-purple-50", text: "text-purple-700", icon: "⏳" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, search]);

  const stats = {
    total: orders.length,
    scheduled: orders.filter(o => o.status === "scheduled").length,
    inProgress: orders.filter(o => o.status === "in_progress").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Collection Orders</h1>
          <p className="text-slate-500 mt-1">Track and manage waste collection jobs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          <p className="text-xs text-slate-500">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
          <p className="text-xs text-slate-500">In Progress</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by order number..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex gap-2">
          {["", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              {s === "" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Order #</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Waste Type</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Driver</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Vehicle</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Containers</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Weight</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-12 text-center text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  Loading...
                </div>
              </td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-slate-400">No orders found</td></tr>
            ) : (
              orders.map(o => {
                const sc = statusConfig[o.status] || statusConfig.pending;
                return (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-700">{o.orderNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-slate-400 max-w-[200px] truncate">{o.pickupAddress}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p>{new Date(o.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      <p className="text-xs text-slate-400">{o.scheduledTime || "—"}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{o.wasteTypeName || "—"}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {o.driverName ? `${o.driverName} ${o.driverLastName}` : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{o.vehicleNumber || "—"}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {o.numberOfContainers ? `${o.numberOfContainers} × ${o.containerSize}` : o.containerSize || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {o.weightTons ? (
                        <span className="font-medium">{o.weightTons} tons</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span>{sc.icon}</span>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
