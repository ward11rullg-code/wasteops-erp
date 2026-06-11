"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxRate: string | null;
  taxAmount: string | null;
  totalAmount: string;
  paidAmount: string | null;
  paidAt: string | null;
  customerName: string | null;
  customerId: number;
}

interface InvoiceDetail extends Invoice {
  notes: string | null;
  lineItems: {
    id: number;
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }[];
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

const formatCurrency = (val: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(val));

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInvoices = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [statusFilter]);

  const viewInvoice = async (id: number) => {
    setDetailLoading(true);
    const res = await fetch(`/api/invoices/${id}`);
    const data = await res.json();
    setSelectedInvoice(data);
    setDetailLoading(false);
  };

  const stats = {
    total: invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    paid: invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    outstanding: invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    overdue: invoices.filter(i => i.status === "overdue").length,
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Invoices</h1>
          <p className="text-slate-500 mt-1">Billing and payment tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">Total Billed</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">Collected</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.outstanding)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["", "draft", "sent", "paid", "overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Invoice #</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Issue Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Due Date</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Amount</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Paid</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">No invoices found</td></tr>
            ) : (
              invoices.map(inv => {
                const sc = statusConfig[inv.status] || statusConfig.draft;
                return (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium">{inv.customerName}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(inv.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      {inv.paidAmount && Number(inv.paidAmount) > 0 ? formatCurrency(inv.paidAmount) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => viewInvoice(inv.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-slate-500">{selectedInvoice.customerName}</p>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const sc = statusConfig[selectedInvoice.status] || statusConfig.draft;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {selectedInvoice.status}
                    </span>
                  );
                })()}
                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">Issue Date</p>
                <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Due Date</p>
                <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Paid Amount</p>
                <p className="font-medium text-emerald-600">{selectedInvoice.paidAmount ? formatCurrency(selectedInvoice.paidAmount) : "$0.00"}</p>
              </div>
            </div>

            {/* Line Items */}
            {detailLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 font-semibold text-slate-600">Description</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Qty</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Unit Price</th>
                      <th className="text-right py-3 font-semibold text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.lineItems?.map(li => (
                      <tr key={li.id} className="border-b border-slate-50">
                        <td className="py-3">{li.description}</td>
                        <td className="py-3 text-right">{li.quantity}</td>
                        <td className="py-3 text-right">{formatCurrency(li.unitPrice)}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(li.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax ({selectedInvoice.taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
