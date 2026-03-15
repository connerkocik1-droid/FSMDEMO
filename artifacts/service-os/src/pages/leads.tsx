import { useState } from "react";
import { useListLeads, useCreateLead, useCreateCustomer } from "@workspace/api-client-react";
import { Search, Plus, MoreHorizontal, Phone, Mail, Filter, CheckCircle2, AlertCircle, Clock, X, ChevronRight, User, Users, ArrowUpRight, ArrowRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  serviceInterest: z.string().optional(),
  estimatedValue: z.coerce.number().optional(),
});

type CreateLeadData = z.infer<typeof createLeadSchema>;

const PIPELINE_STAGES = [
  { id: "new", label: "New", color: "bg-blue-500", lightBg: "bg-blue-50", text: "text-blue-700" },
  { id: "contacted", label: "Contacted", color: "bg-amber-500", lightBg: "bg-amber-50", text: "text-amber-700" },
  { id: "qualified", label: "Qualified", color: "bg-purple-500", lightBg: "bg-purple-50", text: "text-purple-700" },
  { id: "converted", label: "Converted", color: "bg-green-500", lightBg: "bg-green-50", text: "text-green-700" },
  { id: "lost", label: "Lost", color: "bg-gray-400", lightBg: "bg-gray-50", text: "text-gray-600" },
];

export default function Leads() {
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState<"table" | "pipeline">("pipeline");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showConvert, setShowConvert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, refetch } = useListLeads();
  const { mutate: createLead, isPending: isCreating } = useCreateLead();
  const { mutate: createCustomer, isPending: isConverting } = useCreateCustomer();

  const form = useForm<CreateLeadData>({
    resolver: zodResolver(createLeadSchema)
  });

  const onSubmit = (formData: CreateLeadData) => {
    createLead({ data: formData }, {
      onSuccess: () => {
        setIsAdding(false);
        form.reset();
        refetch();
      }
    });
  };

  const handleConvert = () => {
    if (!selectedLead) return;
    createCustomer({
      data: {
        firstName: selectedLead.firstName,
        lastName: selectedLead.lastName,
        email: selectedLead.email || undefined,
        phone: selectedLead.phone || undefined,
        leadId: selectedLead.id,
      }
    }, {
      onSuccess: () => {
        setShowConvert(false);
        setSelectedLead(null);
        refetch();
      }
    });
  };

  const filteredLeads = data?.leads.filter(l =>
    !searchQuery || `${l.firstName} ${l.lastName} ${l.email || ""} ${l.phone || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Leads Pipeline</h2>
          <p className="text-muted-foreground mt-1">Manage and convert your prospective customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary rounded-xl p-1 flex">
            <button onClick={() => setView("pipeline")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "pipeline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>Pipeline</button>
            <button onClick={() => setView("table")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>Table</button>
          </div>
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Lead
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads by name, email, or phone..." className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm" />
        </div>
      </div>

      {view === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[500px]">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage.id);
            const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
            return (
              <div key={stage.id} className="bg-secondary/30 border rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <h3 className="font-bold text-sm text-foreground">{stage.label}</h3>
                    <span className="ml-auto text-xs font-medium bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{stageLeads.length}</span>
                  </div>
                  {totalValue > 0 && <p className="text-xs text-muted-foreground ml-5">${totalValue.toLocaleString()} potential</p>}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {isLoading ? (
                    <div className="text-center text-xs text-muted-foreground mt-4">Loading...</div>
                  ) : stageLeads.length === 0 ? (
                    <div className="text-center p-4 border-2 border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">No leads</p>
                    </div>
                  ) : stageLeads.map(lead => (
                    <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all">
                      <p className="font-semibold text-sm text-foreground">{lead.firstName} {lead.lastName}</p>
                      {lead.serviceInterest && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{lead.serviceInterest}</span>
                      )}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        {lead.estimatedValue ? <span className="font-semibold text-foreground">${lead.estimatedValue}</span> : <span>—</span>}
                        <span>{format(new Date(lead.createdAt), "MMM d")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Interest</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-right">Added</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading leads...</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-foreground">No leads found</p>
                  </td></tr>
                ) : filteredLeads.map((lead) => (
                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4"><p className="font-semibold text-foreground">{lead.firstName} {lead.lastName}</p></td>
                    <td className="px-6 py-4 space-y-1">
                      {lead.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {lead.phone}</div>}
                      {lead.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {lead.email}</div>}
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">{lead.serviceInterest || "Unknown"}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'qualified' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                        lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{lead.status}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{lead.estimatedValue ? `$${lead.estimatedValue}` : '-'}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{format(new Date(lead.createdAt), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedLead && !showConvert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="text-xl font-display font-bold text-foreground">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-foreground">{selectedLead.firstName} {selectedLead.lastName}</h4>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                  selectedLead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  selectedLead.status === 'qualified' ? 'bg-purple-100 text-purple-700' :
                  selectedLead.status === 'converted' ? 'bg-green-100 text-green-700' :
                  selectedLead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{selectedLead.status}</span>
              </div>

              <div className="space-y-3">
                {selectedLead.email && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedLead.email}</span>
                  </div>
                )}
                {selectedLead.phone && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedLead.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Service Interest</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedLead.serviceInterest || "Not specified"}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Est. Value</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedLead.estimatedValue ? `$${selectedLead.estimatedValue}` : "—"}</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-foreground mb-3">Activity Log</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm text-foreground">Lead created</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(selectedLead.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedLead.status !== "converted" && (
                <div className="pt-4 border-t space-y-3">
                  <button onClick={() => setShowConvert(true)} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Convert to Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showConvert && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b">
              <h3 className="text-xl font-display font-bold text-foreground">Convert Lead to Customer</h3>
              <p className="text-sm text-muted-foreground mt-1">This will create a customer record from {selectedLead.firstName} {selectedLead.lastName}'s lead info.</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{selectedLead.firstName} {selectedLead.lastName}</span></div>
                {selectedLead.email && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{selectedLead.email}</span></div>}
                {selectedLead.phone && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{selectedLead.phone}</span></div>}
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button onClick={() => setShowConvert(false)} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl">Cancel</button>
                <button onClick={handleConvert} disabled={isConverting} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm disabled:opacity-50">
                  {isConverting ? "Converting..." : "Confirm Conversion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-foreground">Add New Lead</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">First Name</label>
                  <input {...form.register("firstName")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Last Name</label>
                  <input {...form.register("lastName")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email</label>
                  <input type="email" {...form.register("email")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Phone</label>
                  <input type="tel" {...form.register("phone")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Service Interest</label>
                  <select {...form.register("serviceInterest")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select service...</option>
                    <option value="Repair">Repair</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Installation">Installation</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Est. Value ($)</label>
                  <input type="number" {...form.register("estimatedValue")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-sm disabled:opacity-50 transition-all">
                  {isCreating ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
