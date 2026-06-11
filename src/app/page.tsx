"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface DashboardData {
  totalCustomers: number;
  vehicleCounts: { status: string; count: number }[];
  totalDrivers: number;
  orderCounts: { status: string; count: number }[];
  revenue: { totalBilled: number; totalPaid: number; totalOutstanding: number };
  totalRoutes: number;
  totalFacilities: number;
  recentOrders: {
    id: number;
    orderNumber: string;
    status: string;
    scheduledDate: string;
    customerName: string | null;
    weightTons: string | null;
  }[];
  recyclingData: {
    date: string;
    totalReceivedTons: string;
    totalRecycledTons: string;
    totalLandfillTons: string;
    diversionRate: string;
    facilityName: string | null;
  }[];
  wasteBreakdown: {
    name: string | null;
    category: string | null;
    totalWeight: string;
    orderCount: number;
  }[];
  overdueInvoices: number;
  todaysOrders: number;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
  cancelled: "#ef4444",
  pending: "#8b5cf6",
};

const VEHICLE_COLORS: Record<string, string> = {
  active: "#10b981",
  maintenance: "#f59e0b",
  out_of_service: "#ef4444",
  retired: "#6b7280",
};

const PIE_COLORS = ["#059669", "#0891b2", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setSeeded(true);
    await fetch("/api/seed", { method: "POST" });
    await fetchData();
    setSeeded(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || data.totalCustomers === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to EcoTrack ERP</h2>
          <p className="text-slate-500 mb-6 max-w-md">Get started by loading the demo data. This will populate your waste management system with sample customers, vehicles, routes, orders, and more.</p>
          <button
            onClick={handleSeed}
            disabled={seeded}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeded ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Loading Demo Data...
              </span>
            ) : (
              "Load Demo Data"
            )}
          </button>
        </div>
      </div>
    );
  }

  const totalVehicles = data.vehicleCounts.reduce((sum, v) => sum + v.count, 0);
  const totalOrders = data.orderCounts.reduce((sum, o) => sum + o.count, 0);
  const completedOrders = data.orderCounts.find((o) => o.status === "completed")?.count || 0;
  const scheduledOrders = data.orderCounts.find((o) => o.status === "scheduled")?.count || 0;
  const inProgressOrders = data.orderCounts.find((o) => o.status === "in_progress")?.count || 0;

  const recyclingChartData = data.recyclingData
    .reverse()
    .map((r) => ({
      month: new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      recycled: parseFloat(r.totalRecycledTons),
      landfill: parseFloat(r.totalLandfillTons),
      rate: parseFloat(r.diversionRate),
    }));

  const wastePieData = data.wasteBreakdown
    .filter((w) => w.name)
    .map((w) => ({
      name: w.name!,
      value: parseFloat(w.totalWeight),
    }));

  const vehiclePieData = data.vehicleCounts.map((v) => ({
    name: v.status.replace(/_/g, " "),
    value: v.count,
  }));

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Waste management operations overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await fetch("/api/seed", { method: "POST" });
              fetchData();
            }}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Refresh Data
          </button>
          <span className="text-sm text-slate-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Customers"
          value={data.totalCustomers}
          icon="👥"
          color="bg-blue-50 text-blue-600"
          subtitle="Active contracts"
        />
        <KPICard
          title="Fleet Size"
          value={totalVehicles}
          icon="🚛"
          color="bg-emerald-50 text-emerald-600"
          subtitle={`${data.vehicleCounts.find((v) => v.status === "active")?.count || 0} active`}
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(data.revenue.totalBilled)}
          icon="💰"
          color="bg-amber-50 text-amber-600"
          subtitle={`${formatCurrency(data.revenue.totalOutstanding)} outstanding`}
        />
        <KPICard
          title="Active Routes"
          value={data.totalRoutes}
          icon="🗺️"
          color="bg-purple-50 text-purple-600"
          subtitle={`${data.totalDrivers} drivers`}
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SmallKPI title="Total Orders" value={totalOrders} />
        <SmallKPI title="Completed" value={completedOrders} color="text-emerald-600" />
        <SmallKPI title="In Progress" value={inProgressOrders} color="text-amber-600" />
        <SmallKPI title="Scheduled" value={scheduledOrders} color="text-blue-600" />
        <SmallKPI title="Overdue Invoices" value={data.overdueInvoices} color="text-red-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recycling Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recycling vs Landfill Trend</h3>
          {recyclingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recyclingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} tons`,
                    name === "recycled" ? "Recycled" : "Landfill",
                  ]}
                />
                <Legend />
                <Bar dataKey="recycled" fill="#10b981" radius={[4, 4, 0, 0]} name="Recycled" />
                <Bar dataKey="landfill" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Landfill" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">No data available</div>
          )}
        </div>

        {/* Waste Breakdown Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Waste Composition</h3>
          {wastePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wastePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {wastePieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()} tons`]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Order #</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Weight</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono text-xs font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-2">{order.customerName}</td>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(order.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 px-2">{order.weightTons ? `${order.weightTons} tons` : "—"}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Fleet Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Fleet Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={vehiclePieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {vehiclePieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.name === "active"
                        ? VEHICLE_COLORS.active
                        : entry.name === "maintenance"
                        ? VEHICLE_COLORS.maintenance
                        : entry.name === "out of service"
                        ? VEHICLE_COLORS.out_of_service
                        : VEHICLE_COLORS.retired
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {data.vehicleCounts.map((vc) => (
              <div key={vc.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        vc.status === "active"
                          ? VEHICLE_COLORS.active
                          : vc.status === "maintenance"
                          ? VEHICLE_COLORS.maintenance
                          : VEHICLE_COLORS.out_of_service,
                    }}
                  />
                  <span className="capitalize">{vc.status.replace(/_/g, " ")}</span>
                </div>
                <span className="font-semibold">{vc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-1">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function SmallKPI({ title, value, color }: { title: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color || "text-slate-800"}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{title}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    pending: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-50 text-slate-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
