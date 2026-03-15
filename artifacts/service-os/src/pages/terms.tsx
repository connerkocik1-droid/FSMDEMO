import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function Terms() {
  return (
    <MarketingLayout>
      <SEO
        title="Terms of Service"
        description="Read the ServiceOS terms of service governing your use of our field service management platform."
      />

      <section className="pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-8">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

          <div className="prose prose-lg text-muted-foreground space-y-6">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ServiceOS, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services. These terms apply to all users of the platform, including administrators, technicians, and end customers.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. Description of Service</h2>
            <p>
              ServiceOS provides a cloud-based field service management platform that includes scheduling, dispatch, invoicing, CRM, GPS tracking, communications, and related tools. Features available to you depend on your subscription plan.
            </p>

            <h2 className="text-xl font-bold text-foreground">3. Account Registration</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-bold text-foreground">4. Subscription and Payment</h2>
            <p>
              Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription at any time, but refunds are not provided for partial billing periods. We reserve the right to change our pricing with 30 days notice.
            </p>

            <h2 className="text-xl font-bold text-foreground">5. Acceptable Use</h2>
            <p>
              You agree not to use ServiceOS for any unlawful purpose or in any way that could damage, disable, or impair the service. You may not attempt to gain unauthorized access to any part of the service or its related systems.
            </p>

            <h2 className="text-xl font-bold text-foreground">6. Intellectual Property</h2>
            <p>
              ServiceOS and its original content, features, and functionality are owned by ServiceOS Inc. and are protected by international copyright, trademark, and other intellectual property laws. Your data remains yours.
            </p>

            <h2 className="text-xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
              ServiceOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.
            </p>

            <h2 className="text-xl font-bold text-foreground">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@serviceos.com.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
