import { Link, useLocation, Redirect } from "wouter";
import { Calendar, Users, Plug, LogOut, Menu, X, Database } from "lucide-react";
import { useState } from "react";
import { useDevAdminAuth } from "@/lib/dev-admin-auth";

const navItems = [
  { name: "Demo Scheduling", href: "/dev-admin/scheduling", icon: Calendar },
  { name: "Demo Accounts", href: "/dev-admin/accounts", icon: Users },
  { name: "Demo Builder", href: "/dev-admin/demo-builder", icon: Database },
  { name: "API Integrations", href: "/dev-admin/integrations", icon: Plug },
];

export default function DevAdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, email, logout } = useDevAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/dev-admin" />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md border"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button
          className="lg:hidden absolute top-4 right-4 p-2 text-white/60 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <Link href="/dev-admin/scheduling" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-lg text-white block leading-tight">ServiceOS</span>
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Developer Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0">
              <p className="text-xs text-white/50 truncate">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
