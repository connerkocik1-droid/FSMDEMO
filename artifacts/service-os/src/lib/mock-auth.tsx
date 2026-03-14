import React, { createContext, useContext, useState } from "react";

// This file provides a mocked version of Clerk for sandbox previews
// where environment variables haven't been set up yet.

type Role = "owner" | "admin" | "manager" | "operator";

interface MockUser {
  id: string;
  fullName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl: string;
  publicMetadata: {
    role: Role;
    tier: string;
  };
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: MockUser | null;
  signIn: () => void;
  signOut: () => void;
}

const defaultUser: MockUser = {
  id: "user_mock_123",
  fullName: "Demo User",
  primaryEmailAddress: { emailAddress: "demo@serviceos.com" },
  imageUrl: "https://i.pravatar.cc/150?u=demo",
  publicMetadata: {
    role: "owner",
    tier: "pro",
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signIn = () => setIsSignedIn(true);
  const signOut = () => setIsSignedIn(false);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        isLoaded: true,
        user: isSignedIn ? defaultUser : null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}

export function MockSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useMockAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function MockSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useMockAuth();
  return !isSignedIn ? <>{children}</> : null;
}

export function MockSignInButton() {
  const { signIn } = useMockAuth();
  return (
    <button onClick={signIn} className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95">
      Sign In
    </button>
  );
}

export function MockUserButton() {
  const { user, signOut } = useMockAuth();
  if (!user) return null;
  return (
    <button onClick={signOut} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <img src={user.imageUrl} alt={user.fullName} className="w-8 h-8 rounded-full border border-border" />
      <div className="text-left hidden md:block">
        <p className="text-sm font-semibold leading-none">{user.fullName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user.publicMetadata.role}</p>
      </div>
    </button>
  );
}
