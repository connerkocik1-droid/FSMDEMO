import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function Privacy() {
  return (
    <MarketingLayout>
      <SEO
        title="Privacy Policy"
        description="Learn how ServiceOS collects, uses, and protects your personal information."
      />

      <section className="pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-8">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

          <div className="prose prose-lg text-muted-foreground space-y-6">
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, request a demo, subscribe to a plan, or contact us for support. This may include your name, email address, phone number, company name, billing information, and any other information you choose to provide.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your requests. We may also use the information to send you marketing communications, which you can opt out of at any time.
            </p>

            <h2 className="text-xl font-bold text-foreground">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, processing payments, or providing customer support. We may also share information when required by law or to protect our rights.
            </p>

            <h2 className="text-xl font-bold text-foreground">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
            </p>

            <h2 className="text-xl font-bold text-foreground">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting our support team.
            </p>

            <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at privacy@serviceos.com.
            </p>

            <h2 className="text-xl font-bold text-foreground">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@serviceos.com.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
