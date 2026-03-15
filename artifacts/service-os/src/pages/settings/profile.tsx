import { useState } from "react";
import { User, Save, Camera, Mail, Phone, Shield } from "lucide-react";
import { useMockAuth } from "@/lib/mock-auth";

export default function UserProfile() {
  const { user, role, tier } = useMockAuth();

  const [profile, setProfile] = useState({
    firstName: user?.fullName?.split(" ")[0] || "Demo",
    lastName: user?.fullName?.split(" ").slice(1).join(" ") || "User",
    displayName: user?.fullName || "Demo User",
    email: user?.primaryEmailAddress?.emailAddress || "demo@serviceos.com",
    phone: "(555) 987-6543",
    bio: "",
    preferredContact: "email" as "email" | "sms",
    avatarUrl: user?.imageUrl || "",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-start gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <div className="flex-1 pt-2">
            <h3 className="text-xl font-bold text-foreground">{profile.displayName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{role}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 capitalize">{tier} plan</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user?.company || "ServiceOS"}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
            <input
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
            <input
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
            <input
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={profile.email}
                readOnly
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 text-muted-foreground border-0 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Contact</label>
            <select
              value={profile.preferredContact}
              onChange={(e) => setProfile({ ...profile, preferredContact: e.target.value as "email" | "sms" })}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            placeholder="A brief description about yourself..."
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Password & Security</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 text-sm">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
