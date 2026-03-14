import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useSubmitDemoRequest, useGetDemoSlots } from "@workspace/api-client-react";
import { Calendar, CheckCircle2, ChevronLeft, Video, Clock } from "lucide-react";
import { format } from "date-fns";

const demoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  companyName: z.string().min(2, "Company name is required"),
  businessType: z.string().min(2, "Business type is required"),
  teamSize: z.string().optional(),
  message: z.string().optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

export default function Demo() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { mutate: submitDemo, isPending } = useSubmitDemoRequest();
  const { data: slotsData } = useGetDemoSlots();

  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
  });

  const onSubmit = (data: DemoFormData) => {
    submitDemo(
      { data: { ...data, wantsRecorded: false, wantsPrivate: false } },
      {
        onSuccess: () => setStep(2),
      }
    );
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                {step === 1 ? "See ServiceOS in action" : "You're all set!"}
              </h1>
              <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
                {step === 1 
                  ? "Discover how top field service businesses are automating their operations and scaling revenue."
                  : "We've received your request. Select a time below to schedule your personalized walkthrough."}
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                {[
                  "Live walkthrough of the Dispatch Board",
                  "See the AI-powered SMS engine in real-time",
                  "Learn how Automated Reviews drive growth",
                  "Q&A tailored to your specific business needs"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Form/Calendar */}
          <div className="bg-card rounded-3xl p-8 border shadow-xl shadow-black/5 animate-in fade-in slide-in-from-right-8 relative overflow-hidden">
            {step === 1 ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">First Name</label>
                    <input {...form.register("firstName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Last Name</label>
                    <input {...form.register("lastName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Work Email</label>
                  <input type="email" {...form.register("email")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Company Name</label>
                    <input {...form.register("companyName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Industry</label>
                    <select {...form.register("businessType")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="">Select...</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Landscaping">Landscaping</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Team Size</label>
                  <select {...form.register("teamSize")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="1-5">1-5 Employees</option>
                    <option value="6-15">6-15 Employees</option>
                    <option value="16-40">16-40 Employees</option>
                    <option value="41+">41+ Employees</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Submitting..." : "Request Demo"}
                </button>
              </form>
            ) : (
              <div className="space-y-8 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Pick a time</h3>
                  <p className="text-muted-foreground mt-2">Select a 30-minute slot for your live demo.</p>
                </div>

                <div className="space-y-3">
                  {slotsData?.slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedSlot === slot.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                          : "hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className={`w-5 h-5 ${selectedSlot === slot.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="text-left">
                          <p className="font-semibold text-foreground">{format(new Date(slot.datetime), "EEEE, MMMM do")}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(slot.datetime), "h:mm a")} - {format(new Date(new Date(slot.datetime).getTime() + 30*60000), "h:mm a")}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSlot === slot.id ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {selectedSlot === slot.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all animate-in slide-in-from-bottom-4">
                    Confirm Meeting
                  </button>
                )}

                <div className="pt-6 border-t flex flex-col gap-4">
                  <a href={slotsData?.calendarLink || "#"} className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <Clock className="w-4 h-4" /> Or view full calendar
                  </a>
                  <button className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    <Video className="w-4 h-4" /> Just send me a recorded demo
                  </button>
                </div>
              </div>
            )}
            
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
