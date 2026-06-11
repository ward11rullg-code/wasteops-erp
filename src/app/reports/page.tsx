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
  Legend,
} from "recharts";

interface RecyclingMetric {
  id: number;
  date: string;
  totalReceivedTons: string;
  totalRecycledTons: string;
  totalLandfillTons: string;
  diversionRate: string;
  facilityName: string | null;
  wasteTypeName: string | null;
}

interface DashboardData {
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
  orderCounts: { status: string; count: number }[];
  revenue: { totalBilled: number; totalPaid: number; totalOutstanding: number };
}

const COLORS = ["#059669", "#0891b2", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<RecyclingMetric[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/recycling-metrics").then(r => r.json()),
      fetch("/api/dashboard").then(r => r.json()),
    ]).then(([metricsData, dashData]) => {
      setMetrics(metricsData);
      setDashboard(dashData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Prepare recycling chart data grouped by facility
  const facilityGroups = new Map<string, { recycled: number; landfill: number }>();
  metrics.forEach(m => {
    const facility = m.facilityName || "Unknown";
    const existing = facilityGroups.get(facility) || { recycled: 0, landfill: 0 };
    existing.recycled += parseFloat(m.totalRecycledTons || "0");
    existing.landfill += parseFloat(m.totalLandfillTons || "0");
    facilityGroups.set(facility, existing);
  });

  const facilityChartData = Array.from(facilityGroups.entries()).map(([name, data]) => ({
    name: name.replace(/\s+/g, "\n"),
    recycled: Math.round(data.recycled),
    landfill: Math.round(data.landfill),
  }));

  // Prepare trend data
  const trendMap = new Map<string, { received: number; recycled: number; landfill: number }>();
  metrics.forEach(m => {
    const month = new Date(m.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const existing = trendMap.get(month) || { received: 0, recycled: 0, landfill: 0 };
    existing.received += parseFloat(m.totalReceivedTons || "0");
    existing.recycled += parseFloat(m.totalRecycledTons || "0");
    existing.landfill += parseFloat(m.totalLandfillTons || "0");
    trendMap.set(month, existing);
  });

  const trendData = Array.from(trendMap.entries()).map(([month, data]) => ({
    month,
    ...data,
    rate: data.received > 0 ? Math.round((data.recycled / data.received) * 100) : 0,
  }));

  // Order status pie
  const orderPieData = dashboard?.orderCounts.map(o => ({
    name: o.status.replace(/_/g, " "),
    value: o.count,
  })) || [];

  // Waste breakdown pie
  const wastePieData = dashboard?.wasteBreakdown.filter(w => w.name).map(w => ({
    name: w.name!,
    value: parseFloat(w.totalWeight),
  })) || [];

  const totalRecycled = metrics.reduce((sum, m) => sum + parseFloat(m.totalRecycledTons || "0"), 0);
  const totalLandfill = metrics.reduce((sum, m) => sum + parseFloat(m.totalLandfillTons || "0"), 0);
  const totalReceived = metrics.reduce((sum, m) => sum + parseFloat(m.totalReceivedTons || "0"), 0);
  const avgDiversion = totalReceived > 0 ? ((totalRecycled / totalReceived) * 100).toFixed(1) : "0";

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Environmental impact and operational analytics</p>
      </div>

      {/* Environmental Impact Summary */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-6">Environmental Impact Summary</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-emerald-200 text-sm">Total Processed</p>
            <p className="text-3xl font-bold mt-1">{totalReceived.toLocaleString()}</p>
            <p className="text-emerald-200 text-sm">tons</p>
          </div>
          <div>
            <p className="text-emerald-200 text-sm">Recycled</p>
            <p className="text-3xl font-bold mt-1">{totalRecycled.toLocaleString()}</p>
            <p className="text-emerald-200 text-sm">tons</p>
          </div>
          <div>
            <p className="text-emerald-200 text-sm">Landfill</p>
            <p className="text-3xl font-bold mt-1">{totalLandfill.toLocaleString()}</p>
            <p className="text-emerald-200 text-sm">tons</p>
          </div>
          <div>
            <p className="text-emerald-200 text-sm">Avg Diversion Rate</p>
            <p className="text-3xl font-bold mt-1">{avgDiversion}%</p>
            <p className="text-emerald-200 text-sm">recycled vs total</p>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Total Billed</p>
            <p className="text-3xl font-bold text-slate-800">
              ${dashboard.revenue.totalBilled.toLocaleString()}
            </p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(dashboard.revenue.totalPaid / dashboard.revenue.totalBilled) * 100}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {((dashboard.revenue.totalPaid / dashboard.revenue.totalBilled) * 100).toFixed(0)}% collected
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Collected Revenue</p>
            <p className="text-3xl font-bold text-emerald-600">
              ${dashboard.revenue.totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-amber-600">
              ${dashboard.revenue.totalOutstanding.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Facility Processing Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facilityChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} tons`]} />
              <Legend />
              <Bar dataKey="recycled" fill="#10b981" name="Recycled" radius={[0, 4, 4, 0]} />
              <Bar dataKey="landfill" fill="#94a3b8" name="Landfill" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diversion Rate Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Diversion Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()} tons`,
                  name === "recycled" ? "Recycled" : name === "landfill" ? "Landfill" : name,
                ]}
              />
              <Legend />
              <Bar dataKey="recycled" fill="#10b981" name="Recycled" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="landfill" fill="#94a3b8" name="Landfill" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {orderPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Waste Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wastePieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {wastePieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} tons`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recycling Metrics Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recycling Metrics Detail</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Facility</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Waste Type</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Received (tons)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Recycled (tons)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Landfill (tons)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Diversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const rate = parseFloat(m.diversionRate || "0");
              return (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(m.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4 font-medium">{m.facilityName}</td>
                  <td className="py-3 px-4 text-slate-500">{m.wasteTypeName}</td>
                  <td className="py-3 px-4 text-right">{parseFloat(m.totalReceivedTons).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                    {parseFloat(m.totalRecycledTons).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {parseFloat(m.totalLandfillTons).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${rate >= 80 ? "bg-emerald-50 text-emerald-700" : rate >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
