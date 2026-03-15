import { useMockAuth } from "@/lib/mock-auth";
import { AlertTriangle } from "lucide-react";

export function DemoModeBanner() {
  const { isDemoSession, endDemoSession } = useMockAuth();

  if (!isDemoSession) return null;

  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium" style={{ backgroundColor: "#FAEEDA", color: "#92400e" }}>
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>You are viewing a demo environment. No real data, SMS, or charges are active.</span>
      <button
        onClick={endDemoSession}
        className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold border border-amber-400 hover:bg-amber-200/50 transition-colors"
      >
        End demo
      </button>
    </div>
  );
}
