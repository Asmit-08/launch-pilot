import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read Plavtora's Terms of Service governing your use of the Plavtora platform and its AI-powered services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Last Updated: August 16, 2026
          </p>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            These Terms govern your access to and use of Plavtora. By using
            Plavtora, you agree to these Terms.
          </p>
        </div>

        <div className="space-y-12 text-[15px] leading-7 text-zinc-400">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. About Plavtora
            </h2>

            <p className="mt-4">
              Plavtora is an AI-powered software service designed to help
              founders analyze startups, products, positioning, landing pages,
              validation signals, launch readiness, risks, and related business
              decisions.
            </p>

            <p className="mt-4">
              Plavtora provides analytical and informational tools. It does not
              guarantee the success, profitability, launch performance, market
              acceptance, or viability of any startup, product, or business
              decision.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Acceptance of These Terms
            </h2>

            <p className="mt-4">
              By accessing or using Plavtora, you agree to be bound by these
              Terms and our Privacy Policy.
            </p>

            <p className="mt-4">
              If you do not agree with these Terms, you must not use the
              Service.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Eligibility
            </h2>

            <p className="mt-4">
              You may use Plavtora only if you are legally capable of entering
              into a binding agreement under the laws applicable to you.
            </p>

            <p className="mt-4">
              If you use Plavtora on behalf of a company, organization, or
              other entity, you represent that you have authority to bind that
              entity to these Terms.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Your Account
            </h2>

            <p className="mt-4">
              Certain Plavtora features require an account.
            </p>

            <p className="mt-4">
              You are responsible for:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Providing accurate account information</li>
              <li>Maintaining the security of your account</li>
              <li>Keeping your authentication credentials secure</li>
              <li>All activity occurring through your account</li>
            </ul>

            <p className="mt-4">
              You must notify us promptly if you believe your account has been
              compromised or accessed without authorization.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Permitted Use
            </h2>

            <p className="mt-4">
              You may use Plavtora for lawful purposes and in accordance with
              these Terms.
            </p>

            <p className="mt-4">
              You agree not to use Plavtora to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Violate any applicable law or regulation</li>
              <li>Infringe another person's rights</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Probe, scan, or test the vulnerability of our systems without authorization</li>
              <li>Upload malicious code, malware, or harmful content</li>
              <li>Attempt to circumvent usage limits or access restrictions</li>
              <li>Abuse automated systems or APIs</li>
              <li>Scrape or systematically extract Service data without permission</li>
              <li>Reverse engineer or attempt to extract proprietary source code, models, or systems except where legally permitted</li>
              <li>Use the Service to develop or operate a substantially competing service through unauthorized automated extraction</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              6. User Content
            </h2>

            <p className="mt-4">
              You may submit information, text, URLs, startup descriptions,
              project information, prompts, and other materials to Plavtora
              ("User Content").
            </p>

            <p className="mt-4">
              You retain ownership of your User Content, subject to the rights
              necessary for us to operate the Service.
            </p>

            <p className="mt-4">
              By submitting User Content, you grant Plavtora a limited,
              non-exclusive right to host, process, reproduce, transmit, and
              otherwise use that content as reasonably necessary to provide,
              maintain, secure, and improve the Service.
            </p>

            <p className="mt-4">
              You represent that you have the necessary rights and permissions
              to submit the content you provide to Plavtora.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Landing Page Analyzer
            </h2>

            <p className="mt-4">
              Plavtora may allow you to submit a website or landing-page URL
              for analysis.
            </p>

            <p className="mt-4">
              You represent that you have the right to request analysis of any
              URL you submit and that your use of the feature does not violate
              the website owner's rights or applicable law.
            </p>

            <p className="mt-4">
              Plavtora does not guarantee that every website can be accessed,
              retrieved, or analyzed successfully.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              8. AI-Generated Content
            </h2>

            <p className="mt-4">
              Plavtora uses artificial intelligence and third-party AI models
              to generate analyses, recommendations, scores, summaries, and
              responses.
            </p>

            <p className="mt-4">
              AI-generated content may contain errors, omissions,
              hallucinations, outdated information, or inappropriate
              recommendations.
            </p>

            <p className="mt-4">
              You are solely responsible for evaluating AI-generated output
              before acting on it.
            </p>

            <p className="mt-4">
              Plavtora's analyses and recommendations are not professional
              legal, financial, tax, accounting, investment, medical, or other
              regulated professional advice.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              9. No Guarantee of Business Results
            </h2>

            <p className="mt-4">
              Plavtora is a decision-support tool, not a guarantee of business
              outcomes.
            </p>

            <p className="mt-4">
              Scores, recommendations, risk assessments, validation assessments,
              and other outputs should be treated as estimates and perspectives
              rather than objective determinations of business success.
            </p>

            <p className="mt-4">
              We make no guarantee regarding revenue, funding, customers,
              conversion rates, market demand, product-market fit, launch
              performance, or any other business outcome.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              10. Free and Paid Features
            </h2>

            <p className="mt-4">
              Plavtora may offer both free and paid features.
            </p>

            <p className="mt-4">
              We may change, introduce, limit, or discontinue features,
              pricing, usage limits, or subscription plans at any time,
              subject to applicable law and any obligations we have already
              accepted.
            </p>

            <p className="mt-4">
              Where paid functionality is available, the applicable price and
              billing terms will be presented before purchase.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              11. Payments and Subscriptions
            </h2>

            <p className="mt-4">
              If you purchase a paid Plavtora subscription or feature, payment
              may be processed by a third-party payment provider.
            </p>

            <p className="mt-4">
              You agree to provide accurate billing information and authorize
              applicable charges associated with your selected plan.
            </p>

            <p className="mt-4">
              Subscription prices, billing intervals, renewal terms, and
              cancellation or refund rules will be disclosed at the time of
              purchase where applicable.
            </p>

            <p className="mt-4">
              We may suspend or limit paid functionality where payment is
              unsuccessful, reversed, disputed, or otherwise invalid.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              12. Intellectual Property
            </h2>

            <p className="mt-4">
              Plavtora and its underlying software, interface, branding,
              designs, systems, documentation, and original content are owned
              by or licensed to Plavtora and are protected by applicable
              intellectual-property laws.
            </p>

            <p className="mt-4">
              Except as expressly permitted by these Terms, you may not copy,
              reproduce, distribute, modify, sell, lease, sublicense, or
              otherwise exploit Plavtora or its proprietary components without
              authorization.
            </p>

            <p className="mt-4">
              Nothing in these Terms transfers ownership of Plavtora's
              intellectual property to you.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              13. Third-Party Services
            </h2>

            <p className="mt-4">
              Plavtora may depend on or integrate with third-party services,
              including authentication, hosting, analytics, AI, database,
              communications, and payment providers.
            </p>

            <p className="mt-4">
              Third-party services may be subject to separate terms and
              policies. We are not responsible for the availability,
              functionality, security, or actions of third-party services that
              we do not control.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              14. Availability and Changes
            </h2>

            <p className="mt-4">
              We aim to keep Plavtora available and reliable, but we do not
              guarantee uninterrupted or error-free operation.
            </p>

            <p className="mt-4">
              The Service may occasionally be unavailable because of maintenance,
              updates, infrastructure failures, third-party outages, security
              incidents, or circumstances outside our reasonable control.
            </p>

            <p className="mt-4">
              We may modify, suspend, or discontinue any part of the Service at
              any time.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              15. Disclaimer of Warranties
            </h2>

            <p className="mt-4">
              To the maximum extent permitted by applicable law, Plavtora is
              provided on an "as is" and "as available" basis.
            </p>

            <p className="mt-4">
              We do not warrant that the Service will be uninterrupted,
              error-free, secure, accurate, complete, or suitable for your
              particular requirements.
            </p>

            <p className="mt-4">
              We disclaim warranties to the extent permitted by applicable law,
              including implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              16. Limitation of Liability
            </h2>

            <p className="mt-4">
              To the maximum extent permitted by applicable law, Plavtora and
              its operators, affiliates, service providers, and representatives
              will not be liable for indirect, incidental, special,
              consequential, exemplary, or punitive damages arising from or
              related to your use of the Service.
            </p>

            <p className="mt-4">
              This includes, where legally permitted, loss of profits,
              revenue, business opportunities, data, goodwill, or expected
              savings.
            </p>

            <p className="mt-4">
              Nothing in these Terms excludes or limits liability that cannot
              legally be excluded or limited under applicable law.
            </p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              17. Indemnification
            </h2>

            <p className="mt-4">
              To the extent permitted by applicable law, you agree to defend,
              indemnify, and hold harmless Plavtora and its operators,
              affiliates, and service providers from claims, liabilities,
              damages, losses, and expenses arising from:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Your violation of these Terms</li>
              <li>Your misuse of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of another person's rights</li>
              <li>Your violation of applicable law</li>
            </ul>
          </section>

          {/* 18 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              18. Suspension and Termination
            </h2>

            <p className="mt-4">
              We may suspend or terminate your access to Plavtora if we
              reasonably believe that you have violated these Terms, abused the
              Service, created a security risk, engaged in unlawful activity,
              or otherwise created significant risk to Plavtora or its users.
            </p>

            <p className="mt-4">
              You may stop using Plavtora at any time.
            </p>

            <p className="mt-4">
              Provisions that by their nature should survive termination,
              including intellectual-property provisions, disclaimers,
              limitations of liability, and dispute-related provisions, will
              survive termination.
            </p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              19. Governing Law
            </h2>

            <p className="mt-4">
              These Terms will be governed by and interpreted in accordance
              with the laws applicable to Plavtora's operating jurisdiction,
              except where applicable law requires otherwise.
            </p>

            <p className="mt-4">
              Any dispute arising from or relating to these Terms will be
              subject to the jurisdiction of the courts or dispute-resolution
              mechanisms applicable under the governing law.
            </p>
          </section>

          {/* 20 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              20. Changes to These Terms
            </h2>

            <p className="mt-4">
              We may update these Terms from time to time.
            </p>

            <p className="mt-4">
              When changes are material, we may provide notice through the
              Service or another appropriate method.
            </p>

            <p className="mt-4">
              Your continued use of Plavtora after updated Terms become
              effective constitutes acceptance of the updated Terms to the
              extent permitted by applicable law.
            </p>
          </section>

          {/* 21 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              21. Entire Agreement
            </h2>

            <p className="mt-4">
              These Terms, together with the Privacy Policy and any additional
              terms expressly incorporated into the Service, constitute the
              agreement between you and Plavtora concerning your use of the
              Service.
            </p>

            <p className="mt-4">
              If any provision is found to be invalid or unenforceable, the
              remaining provisions will remain in effect to the extent
              permitted by law.
            </p>
          </section>

          {/* 22 */}
          <section>
            <h2 className="text-xl font-semibold text-white">
              22. Contact Us
            </h2>

            <p className="mt-4">
              If you have questions about these Terms, you can contact:
            </p>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <p className="font-medium text-white">Plavtora</p>

              <p className="mt-2 text-zinc-400">
                Email:{" "}
                <a
                  href="mailto:launchpilotin@gmail.com"
                  className="text-violet-300 hover:text-violet-200"
                >
                  launchpilotin@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-20 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Plavtora</p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="hover:text-zinc-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-zinc-400 hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}