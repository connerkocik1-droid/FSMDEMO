import { useListInvoices, useGetRevenueAnalytics } from "@workspace/api-client-react";
import { DollarSign, ArrowUpRight, Plus, FileText, Download } from "lucide-react";
import { format } from "date-fns";

export default function Financials() {
  const { data: invoicesData, isLoading: invLoading } = useListInvoices();
  const { data: analytics } = useGetRevenueAnalytics({ period: "30d" });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Financials</h2>
          <p className="text-muted-foreground mt-1">Invoices, payments, and revenue tracking.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-primary-foreground/80 font-medium">Total Revenue (30d)</h3>
            <p className="text-4xl font-display font-bold mt-2">${analytics?.total || "0"}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <ArrowUpRight className="w-4 h-4" /> {analytics?.growth || "0"}% vs last month
            </div>
          </div>
          <DollarSign className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
        </div>

        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Outstanding Invoices</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">$2,450.00</p>
          <p className="text-sm font-semibold text-amber-500 mt-2">4 invoices overdue</p>
        </div>

        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Pending Estimates</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">$8,100.00</p>
          <p className="text-sm font-semibold text-blue-500 mt-2">12 awaiting approval</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground">Recent Invoices</h3>
          <button className="text-sm font-semibold text-primary hover:text-primary/80">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date Issued</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>
              ) : !invoicesData?.invoices.length ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="font-semibold text-foreground">No invoices yet</p>
                      <p className="text-sm text-muted-foreground">Create an invoice to get paid.</p>
                    </div>
                  </td>
                </tr>
              ) : invoicesData.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{inv.customer?.firstName} {inv.customer?.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 font-bold">${inv.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
