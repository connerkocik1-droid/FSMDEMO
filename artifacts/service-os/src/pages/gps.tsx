import { useState } from "react";
import { MapPin, Navigation, Clock, User, Wifi, WifiOff, RefreshCw } from "lucide-react";

const MOCK_CREWS = [
  { id: 1, name: "Team Alpha", status: "active", lat: 33.749, lng: -84.388, lastPing: "2 min ago", currentJob: "AC Repair - 123 Main St" },
  { id: 2, name: "Team Bravo", status: "active", lat: 33.755, lng: -84.392, lastPing: "5 min ago", currentJob: "Maintenance - 456 Oak Ave" },
  { id: 3, name: "Team Charlie", status: "idle", lat: 33.742, lng: -84.385, lastPing: "20 min ago", currentJob: null },
];

export default function GPS() {
  const [selectedCrew, setSelectedCrew] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Live GPS Tracking</h2>
          <p className="text-muted-foreground mt-1">Real-time crew locations and movement history.</p>
        </div>
        <button className="px-4 py-2 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-2xl overflow-hidden" style={{ height: "500px" }}>
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Map View</p>
                <p className="text-sm text-muted-foreground mt-1">Connect Google Maps API to enable live tracking.</p>
                <p className="text-xs text-muted-foreground mt-4">Set GOOGLE_MAPS_API_KEY to activate.</p>
              </div>

              {MOCK_CREWS.map(crew => (
                <button
                  key={crew.id}
                  onClick={() => setSelectedCrew(crew.id)}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                    crew.status === "active" ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                  } ${selectedCrew === crew.id ? "ring-4 ring-primary/30 scale-110" : ""}`}
                  style={{ top: `${30 + crew.id * 15}%`, left: `${20 + crew.id * 20}%` }}
                >
                  <Navigation className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-foreground">Active Crews</h3>
          {MOCK_CREWS.map(crew => (
            <div
              key={crew.id}
              onClick={() => setSelectedCrew(crew.id)}
              className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${selectedCrew === crew.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${crew.status === "active" ? "bg-green-500/10" : "bg-gray-100"}`}>
                  <User className={`w-5 h-5 ${crew.status === "active" ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{crew.name}</p>
                  <div className="flex items-center gap-2">
                    {crew.status === "active" ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><Wifi className="w-3 h-3" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><WifiOff className="w-3 h-3" /> Idle</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3 h-3" /> Last ping: {crew.lastPing}
                </div>
                {crew.currentJob && (
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-3 h-3 text-primary" /> {crew.currentJob}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
