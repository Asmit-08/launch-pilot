import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Plavtora's Privacy Policy to understand how we collect, use, and protect information when you use our services.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-8 w-8 rounded-lg"
            />

            <span className="text-lg font-semibold tracking-tight">
              Plavtora
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Back to Plavtora
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
            Legal
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Last Updated: August 16, 2026
          </p>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            This Privacy Policy explains how Plavtora collects, uses, stores,
            and protects information when you use our website, applications,
            and related services.
          </p>
        </div>

        <div className="space-y-12 text-[15px] leading-7 text-zinc-400">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. About Plavtora
            </h2>

            <p className="mt-4">
              Plavtora ("Plavtora", "we", "us", or "our") provides AI-powered
              tools designed to help founders analyze, evaluate, and improve
              their startups, products, positioning, and launch readiness.
            </p>

            <p className="mt-4">
              This Privacy Policy explains what information we collect, how we
              use it, when we share it, and the choices available to you when
              you use Plavtora.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Information We Collect
            </h2>

            <h3 className="mt-6 font-medium text-zinc-200">
              2.1 Account Information
            </h3>

            <p className="mt-3">
              When you create or access a Plavtora account, we may receive
              information associated with your authentication provider,
              including:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Profile information provided by your authentication provider</li>
              <li>Authentication and account identifiers</li>
              <li>Information necessary to maintain your account and session</li>
            </ul>

            <h3 className="mt-6 font-medium text-zinc-200">
              2.2 Startup and Project Information
            </h3>

            <p className="mt-3">
              When you use Plavtora&apos;s startup analysis features, you may
              provide information such as:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Startup or project name</li>
              <li>Product description</li>
              <li>Website URL</li>
              <li>Industry</li>
              <li>Startup stage</li>
              <li>Target customer or ICP information</li>
              <li>Product, business, positioning, or launch information</li>
              <li>Other information you voluntarily submit for analysis</li>
            </ul>

            <h3 className="mt-6 font-medium text-zinc-200">
              2.3 Landing Page Information
            </h3>

            <p className="mt-3">
              When you use the Landing Page Analyzer, you may submit a publicly
              accessible website or landing-page URL. We may process the
              submitted URL and information retrieved from the relevant page
              to generate an analysis.
            </p>

            <p className="mt-3">
              You should only submit URLs and information that you are
              authorized to submit and analyze.
            </p>

            <h3 className="mt-6 font-medium text-zinc-200">
              2.4 AI Chat and Conversation Data
            </h3>

            <p className="mt-3">
              If you use Plavtora&apos;s AI chat functionality, we may process:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Messages you send</li>
              <li>Relevant conversation history</li>
              <li>Startup or project information associated with the conversation</li>
              <li>Relevant analysis results used to provide contextual responses</li>
            </ul>

            <h3 className="mt-6 font-medium text-zinc-200">
              2.5 Usage and Technical Information
            </h3>

            <p className="mt-3">
              We may automatically collect certain technical and usage
              information, including:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>IP address</li>
              <li>Browser and device information</li>
              <li>Operating system</li>
              <li>Pages or features accessed</li>
              <li>Approximate usage timestamps</li>
              <li>Referral information</li>
              <li>Error and diagnostic information</li>
              <li>General interaction and usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. How We Use Information
            </h2>

            <p className="mt-4">We may use collected information to:</p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Create and maintain user accounts</li>
              <li>Authenticate users</li>
              <li>Provide startup analysis and other requested features</li>
              <li>Analyze submitted landing pages</li>
              <li>Provide AI-generated responses and recommendations</li>
              <li>Store and display projects, analyses, and related information</li>
              <li>Maintain and improve the Service</li>
              <li>Monitor performance, security, and reliability</li>
              <li>Detect abuse, fraud, unauthorized access, or violations of our Terms</li>
              <li>Communicate with users about the Service</li>
              <li>Process subscriptions and payments when paid functionality is enabled</li>
              <li>Comply with applicable legal obligations</li>
              <li>Protect our rights, users, systems, and property</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. AI Processing
            </h2>

            <p className="mt-4">
              Plavtora uses artificial intelligence to generate analyses,
              recommendations, summaries, scores, and conversational responses.
            </p>

            <p className="mt-4">
              Information submitted to AI-powered features may be processed by
              third-party AI infrastructure providers acting on our behalf or
              as otherwise necessary to provide the Service.
            </p>

            <p className="mt-4">
              AI-generated output may be inaccurate, incomplete, outdated, or
              unsuitable for your particular circumstances. You are responsible
              for reviewing AI-generated output before relying on it.
            </p>

            <p className="mt-4">
              You should not submit highly sensitive, confidential, or
              regulated information to Plavtora unless you have determined that
              doing so is appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Third-Party Service Providers
            </h2>

            <p className="mt-4">
              We may use third-party providers to operate portions of the
              Service. These may include providers for:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Authentication and account management</li>
              <li>Database and cloud infrastructure</li>
              <li>AI model processing</li>
              <li>Website hosting</li>
              <li>Analytics</li>
              <li>Payment processing and subscription management</li>
              <li>Security, monitoring, and technical support</li>
            </ul>

            <p className="mt-4">
              These providers may process information according to their own
              terms and privacy policies and, where applicable, our
              instructions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Data Sharing
            </h2>

            <p className="mt-4">
              We do not sell your personal information as a standalone product.
            </p>

            <p className="mt-4">We may share information:</p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>With service providers that help us operate Plavtora</li>
              <li>When necessary to provide a feature you request</li>
              <li>To process payments or subscriptions</li>
              <li>
                To protect against fraud, abuse, security threats, or
                unauthorized activity
              </li>
              <li>
                When required by law, regulation, legal process, or governmental
                authority
              </li>
              <li>
                When necessary to protect our rights, property, users, or the
                public
              </li>
              <li>
                In connection with a merger, acquisition, financing,
                restructuring, sale of assets, or similar business transaction
              </li>
            </ul>

            <p className="mt-4">
              We may also share aggregated or de-identified information that
              cannot reasonably be used to identify you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Data Retention
            </h2>

            <p className="mt-4">
              We retain information for as long as reasonably necessary to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Provide the Service</li>
              <li>Maintain your account</li>
              <li>Preserve your projects and analyses</li>
              <li>Fulfill the purposes described in this Policy</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
              <li>Comply with legal obligations</li>
            </ul>

            <p className="mt-4">
              When information is no longer reasonably required, we may delete,
              anonymize, or otherwise securely dispose of it, subject to
              applicable legal and operational requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Data Security
            </h2>

            <p className="mt-4">
              We use reasonable technical and organizational measures designed
              to protect information against unauthorized access, alteration,
              disclosure, loss, or destruction.
            </p>

            <p className="mt-4">
              However, no internet transmission, storage system, or electronic
              service can be guaranteed to be completely secure.
            </p>

            <p className="mt-4">
              You are responsible for maintaining the security of your account
              credentials and for notifying us if you believe your account has
              been accessed without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              9. Cookies and Similar Technologies
            </h2>

            <p className="mt-4">
              Plavtora may use cookies, local storage, analytics technologies,
              and similar mechanisms to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Maintain sessions</li>
              <li>Remember preferences</li>
              <li>Support authentication</li>
              <li>Understand website usage</li>
              <li>Improve performance</li>
              <li>Detect security issues</li>
            </ul>

            <p className="mt-4">
              You may be able to control cookies through your browser settings.
              Disabling certain technologies may affect some functionality of
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              10. Your Choices and Rights
            </h2>

            <p className="mt-4">
              Depending on your location and applicable law, you may have
              rights relating to your personal information, including rights to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Request access to information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of certain information</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Request restriction or object to certain processing</li>
              <li>Request information about how your personal information is processed</li>
              <li>Request a copy of certain information in a portable format</li>
            </ul>

            <p className="mt-4">
              To exercise an applicable right, contact us using the details
              provided below. We may need to verify your identity before
              fulfilling certain requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              11. Account and Data Deletion
            </h2>

            <p className="mt-4">
              You may request deletion of your Plavtora account and associated
              personal information by contacting us.
            </p>

            <p className="mt-4">
              Deletion may not immediately remove information that we are
              legally required to retain or information that has been
              irreversibly anonymized.
            </p>

            <p className="mt-4">
              Backups and system logs may also persist for a limited period
              before being overwritten or securely deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              12. International Data Processing
            </h2>

            <p className="mt-4">
              Plavtora and its service providers may process information in
              countries other than the country where you reside.
            </p>

            <p className="mt-4">
              Where required by applicable law, we will use appropriate
              safeguards for international transfers of personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              13. Children&apos;s Privacy
            </h2>

            <p className="mt-4">
              Plavtora is intended for users who are legally able to use the
              Service under applicable law.
            </p>

            <p className="mt-4">
              We do not knowingly collect personal information from children
              where such collection is prohibited by applicable law.
            </p>

            <p className="mt-4">
              If you believe that a child has provided personal information to
              us in circumstances where it should not have been collected,
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              14. Third-Party Websites
            </h2>

            <p className="mt-4">
              The Service may contain links to third-party websites or
              services. We are not responsible for the privacy practices,
              security, content, or policies of third-party websites.
            </p>

            <p className="mt-4">
              We encourage you to review their privacy policies before
              providing them with personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              15. Changes to This Privacy Policy
            </h2>

            <p className="mt-4">
              We may update this Privacy Policy from time to time to reflect
              changes to the Service, technology, legal requirements, or our
              practices.
            </p>

            <p className="mt-4">
              When we make material changes, we may provide notice through the
              Service or other appropriate means.
            </p>

            <p className="mt-4">
              The &quot;Last Updated&quot; date at the top of this Policy
              indicates when it was most recently revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              16. Contact Us
            </h2>

            <p className="mt-4">
              If you have questions, concerns, or requests regarding this
              Privacy Policy or your personal information, contact us at:
            </p>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <p className="font-medium text-white">Plavtora</p>
              <p className="mt-2 text-zinc-400">
                Email:{""}
                <a
                  href="mailto:launchpilotin@gmail.com"
                  className="text-violet-300 hover:text-violet-200"
                >
                  launchpilotin@gmail.com
                </a>
              </p>
              <p className="mt-1 text-zinc-500">
                Website: Plavtora
              </p>
            </div>

            <p className="mt-4">
              For privacy-related requests, please include sufficient
              information for us to identify your account and understand your
              request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              17. Applicable Privacy Requirements
            </h2>

            <p className="mt-4">
              This Privacy Policy is intended to describe our privacy practices
              in a manner consistent with applicable data-protection and
              privacy laws.
            </p>

            <p className="mt-4">
              Where applicable, Plavtora will comply with mandatory requirements
              relating to personal data processing, user rights, security,
              consent, and grievance or complaint handling.
            </p>

            <p className="mt-4">
              If a provision of this Privacy Policy conflicts with a mandatory
              requirement of applicable law, the mandatory legal requirement
              will prevail.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-20 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Plavtora</p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="text-zinc-400 hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="hover:text-zinc-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

