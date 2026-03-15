import { useState } from "react";
import { useListCustomers } from "@workspace/api-client-react";
import { Search, Phone, Mail, MapPin, User, MoreHorizontal, X, Star } from "lucide-react";
import { format } from "date-fns";

export default function Customers() {
  const { data, isLoading } = useListCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = data?.customers.filter(c =>
    !searchQuery || `${c.firstName} ${c.lastName} ${c.email || ""} ${c.phone || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Customers</h2>
          <p className="text-muted-foreground mt-1">Your converted customer database.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm" />
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Jobs</th>
              <th className="px-6 py-4 text-right">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading customers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">
                <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-foreground">No customers found</p>
                <p className="text-sm mt-1">Convert leads to add customers.</p>
              </td></tr>
            ) : filtered.map(customer => (
              <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="hover:bg-secondary/30 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <p className="font-semibold text-foreground">{customer.firstName} {customer.lastName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  {customer.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {customer.phone}</div>}
                  {customer.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {customer.email}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{customer.ratingAvg ? Number(customer.ratingAvg).toFixed(1) : "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">—</td>
                <td className="px-6 py-4 text-right text-muted-foreground">{format(new Date(customer.createdAt), "MMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="text-xl font-display font-bold text-foreground">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-foreground">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
              </div>
              <div className="space-y-3">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Avg Rating</p>
                  <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {selectedCustomer.ratingAvg ? Number(selectedCustomer.ratingAvg).toFixed(1) : "—"}
                  </p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Customer Since</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{format(new Date(selectedCustomer.createdAt), "MMM yyyy")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
