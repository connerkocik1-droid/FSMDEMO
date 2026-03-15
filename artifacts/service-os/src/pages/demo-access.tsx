import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { CheckCircle2, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useMockAuth, DEMO_PROFILES } from "@/lib/mock-auth";

type TokenState = "loading" | "valid" | "expired" | "invalid";

export default function DemoAccess() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { signInAs, setDemoSession } = useMockAuth();
  const [state, setState] = useState<TokenState>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/demo/access/${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          const profile = DEMO_PROFILES.find(p => p.tier === "pro" && p.role === "owner") || DEMO_PROFILES[0];
          signInAs(profile);
          setDemoSession(true);
          navigate("/dashboard");
        } else if (data.reason === "expired") {
          setState("expired");
        } else {
          setState("invalid");
        }
      } catch {
        setState("invalid");
      }
    };

    validateToken();
  }, [token]);

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">ServiceOS</span>
          </Link>

          {state === "loading" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Setting up your demo...</h1>
              <p className="text-muted-foreground">Preparing your demo environment. This will only take a moment.</p>
            </div>
          )}

          {state === "expired" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Demo link expired</h1>
              <p className="text-muted-foreground">
                This demo access link has expired. Demo links are valid for 72 hours after your booking confirmation.
              </p>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
              >
                Request a new demo
              </Link>
            </div>
          )}

          {state === "invalid" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Invalid demo link</h1>
              <p className="text-muted-foreground">
                This demo access link is invalid or has been revoked. Please check your email for the correct link or request a new demo.
              </p>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
              >
                Request a new demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
