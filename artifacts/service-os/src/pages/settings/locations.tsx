import { useState } from "react";
import { MapPin, Plus, Users, Building, Settings, AlertTriangle, ChevronRight } from "lucide-react";

const MOCK_LOCATIONS = [
  { id: 1, name: "Atlanta HQ", address: "123 Peachtree St, Atlanta, GA", operators: 18, maxOperators: 75, status: "active" },
  { id: 2, name: "Marietta Branch", address: "456 Roswell Rd, Marietta, GA", operators: 12, maxOperators: 75, status: "active" },
];

export default function Locations() {
  const [locations] = useState(MOCK_LOCATIONS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Multi-Location Management</h2>
          <p className="text-muted-foreground mt-1">Manage your franchise locations and operator capacity.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="grid gap-4">
        {locations.map(loc => {
          const usagePercent = (loc.operators / loc.maxOperators) * 100;
          const isWarning = loc.operators >= 70;
          const isBlocked = loc.operators >= 76;
          return (
            <div key={loc.id} className="bg-card border rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{loc.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {loc.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isWarning && !isBlocked && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Approaching cap
                    </span>
                  )}
                  {isBlocked && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Cap exceeded
                    </span>
                  )}
                  <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"><Settings className="w-4 h-4" /></button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Operator Capacity</span>
                  <span className="font-semibold text-foreground">{loc.operators} / {loc.maxOperators}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className={`rounded-full h-3 transition-all ${
                    isBlocked ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-primary"
                  }`} style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
