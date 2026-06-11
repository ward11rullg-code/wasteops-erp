"use client";

import { useEffect, useState } from "react";

interface Facility {
  id: number;
  name: string;
  type: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  capacity: string | null;
  currentUtilization: string | null;
  operatingHours: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean | null;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  landfill: { icon: "🏗️", color: "text-slate-700", bg: "bg-slate-100" },
  recycling_center: { icon: "♻️", color: "text-emerald-700", bg: "bg-emerald-50" },
  transfer_station: { icon: "🔄", color: "text-blue-700", bg: "bg-blue-50" },
  composting_facility: { icon: "🌱", color: "text-green-700", bg: "bg-green-50" },
  hazardous_waste_facility: { icon: "☢️", color: "text-red-700", bg: "bg-red-50" },
  incineration_plant: { icon: "🔥", color: "text-amber-700", bg: "bg-amber-50" },
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/facilities")
      .then(r => r.json())
      .then(d => { setFacilities(d); setLoading(false); });
  }, []);

  const getUtilizationColor = (util: number) => {
    if (util > 80) return "bg-red-500";
    if (util > 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Facilities</h1>
          <p className="text-slate-500 mt-1">Waste processing and disposal facilities</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {facilities.map(f => {
            const tc = typeConfig[f.type] || typeConfig.landfill;
            const utilization = parseFloat(f.currentUtilization || "0");
            const capacity = parseFloat(f.capacity || "0");
            return (
              <div key={f.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className={`${tc.bg} px-6 py-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tc.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-800">{f.name}</h3>
                        <p className={`text-xs font-medium capitalize ${tc.color}`}>
                          {f.type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${f.isActive ? "bg-white/70 text-emerald-700" : "bg-white/70 text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${f.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-slate-500">{f.address}, {f.city}, {f.state} {f.zipCode}</p>
                  </div>

                  {/* Utilization */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Utilization</span>
                      <span className="text-xs font-semibold">{utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getUtilizationColor(utilization)}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Capacity: {capacity.toLocaleString()} tons
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Hours</p>
                      <p className="text-sm font-medium">{f.operatingHours || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contact</p>
                      <p className="text-sm font-medium">{f.contactPerson || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-medium">{f.contactPhone || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
