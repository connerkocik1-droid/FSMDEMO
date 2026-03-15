import { useState, useEffect, FormEvent } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { SEO } from "@/components/SEO";
import { ChevronLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";

const TIER_INFO: Record<string, { name: string; monthly: number; annualMonthly: number; annualTotal: number }> = {
  independent: { name: "Independent", monthly: 79, annualMonthly: 59, annualTotal: 708 },
  pro: { name: "Pro", monthly: 199, annualMonthly: 149, annualTotal: 1788 },
  franchise: { name: "Franchise", monthly: 449, annualMonthly: 329, annualTotal: 3948 },
};

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ tier, billingPeriod, price, discountedPrice }: {
  tier: string;
  billingPeriod: string;
  price: number;
  discountedPrice: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment validation failed");
        setProcessing(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.BASE_URL}api/billing/create-subscription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tier, billing: billingPeriod }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create subscription");
        setProcessing(false);
        return;
      }

      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}${import.meta.env.BASE_URL}dashboard?welcome=true`,
          },
        });

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
          setProcessing(false);
          return;
        }
      } else {
        navigate("/dashboard?welcome=true");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="font-semibold text-foreground mb-4">Payment details</h3>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" />
        {processing ? "Processing..." : `Subscribe — $${discountedPrice} today`}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Then ${price}/{billingPeriod === "annual" ? "yr" : "mo"} after your first billing period.
        Cancel anytime.
      </p>
    </form>
  );
}

export default function Checkout() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tier = params.get("tier") || "pro";
  const billingPeriod = params.get("billing") || "monthly";

  const tierInfo = TIER_INFO[tier];

  if (!tierInfo) {
    return (
      <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-6">
        <SEO title="Invalid Plan" noIndex />
        <div className="bg-card rounded-3xl p-12 border shadow-xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Plan</h1>
          <p className="text-muted-foreground mb-6">The selected plan doesn't exist. Please choose a valid plan.</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  const isAnnual = billingPeriod === "annual";
  const monthlyEquivalent = isAnnual ? tierInfo.annualMonthly : tierInfo.monthly;
  const invoiceAmount = isAnnual ? tierInfo.annualTotal : tierInfo.monthly;
  const discountedInvoice = Math.round(invoiceAmount * 0.5);

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <SEO title={`Subscribe to ${tierInfo.name}`} noIndex />

      <header className="px-8 py-6">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Pricing
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                Subscribe to {tierInfo.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Complete your subscription to get started with ServiceOS.
              </p>
            </div>

            <div className="bg-card rounded-2xl border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{tierInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-semibold text-foreground capitalize">{billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regular price</span>
                  <span className="text-muted-foreground">
                    {isAnnual ? `$${tierInfo.annualTotal}/yr ($${monthlyEquivalent}/mo)` : `$${tierInfo.monthly}/mo`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FIRST30 discount (50% off first invoice)</span>
                    <span className="text-green-600 font-semibold">-${invoiceAmount - discountedInvoice}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">
                      {isAnnual ? "First year total" : "First month total"}
                    </span>
                    <span className="font-bold text-foreground text-xl">${discountedInvoice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "50% off your first 30 days",
                "Cancel anytime — no contracts",
                "30-day money-back guarantee",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {stripePromise ? (
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "subscription",
                  amount: discountedInvoice * 100,
                  currency: "usd",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  tier={tier}
                  billingPeriod={billingPeriod}
                  price={invoiceAmount}
                  discountedPrice={discountedInvoice}
                />
              </Elements>
            ) : (
              <div className="bg-card rounded-2xl border p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Stripe Not Configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Payment processing is not yet configured. Please set the VITE_STRIPE_PUBLISHABLE_KEY environment variable.
                </p>
                <Link href={`/demo?tier=${tier}`} className="text-primary font-semibold hover:underline text-sm">
                  Book a demo instead
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
