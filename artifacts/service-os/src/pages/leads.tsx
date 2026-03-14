import { useState } from "react";
import { useListLeads, useCreateLead } from "@workspace/api-client-react";
import { Search, Plus, MoreHorizontal, Phone, Mail, Filter, CheckCircle2, CheckCircle, AlertCircle, Clock, X, ChevronRight, User, Users, ArrowUpRight } from "lucide-react";
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

export default function Leads() {
  const [isAdding, setIsAdding] = useState(false);
  const { data, isLoading, refetch } = useListLeads();
  const { mutate: createLead, isPending: isCreating } = useCreateLead();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Leads Pipeline</h2>
          <p className="text-muted-foreground mt-1">Manage and convert your prospective customers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Lead
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search leads by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm"
          />
        </div>
        <div className="w-px h-8 bg-border"></div>
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Leads Table */}
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
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading leads...</td>
                </tr>
              ) : data?.leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">No leads found</p>
                      <p className="text-sm">Get started by creating a new lead.</p>
                    </div>
                  </td>
                </tr>
              ) : data?.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{lead.firstName} {lead.lastName}</p>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {lead.serviceInterest || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                      lead.status === 'qualified' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                      lead.status === 'converted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {lead.estimatedValue ? `$${lead.estimatedValue}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </td>
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

      {/* Add Lead Dialog Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-foreground">Add New Lead</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
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
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Est. Value ($)</label>
                  <input type="number" {...form.register("estimatedValue")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
                  Cancel
                </button>
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

