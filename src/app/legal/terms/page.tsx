import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Kaimoku Technologies",
  description: "Terms of Service for Kuju Email and Kaimoku Technologies services.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold text-primary">Terms of Service</h1>
      <p className="mb-12 text-sm text-slate-500">
        Effective Date: March 18, 2026 &middot; Last Updated: March 18, 2026
      </p>

      <div className="space-y-10 text-slate-700 leading-relaxed [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1 [&_ol]:mb-4 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:space-y-1">
        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Customer,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Kaimoku Technologies, LLC (&ldquo;Kaimoku,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a limited liability company, governing your access to and use of the Kuju Email service and any related services, websites, and applications (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, our <a href="/legal/privacy" className="text-accent hover:underline">Privacy Policy</a>, and our <a href="/legal/acceptable-use" className="text-accent hover:underline">Acceptable Use Policy</a>. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Kuju Email is a managed email platform that provides email sending and receiving, webmail access, calendar, contacts, and related features. The Service is provided on a subscription basis according to the plan you select.
          </p>
        </section>

        <section>
          <h2>3. Account Registration</h2>
          <p>To use the Service, you must:</p>
          <ol>
            <li>Provide accurate, complete, and current registration information;</li>
            <li>Maintain the security of your account credentials;</li>
            <li>Promptly notify us of any unauthorized use of your account;</li>
            <li>Be at least 18 years of age or the age of legal majority in your jurisdiction.</li>
          </ol>
          <p>
            You are responsible for all activities that occur under your account. Kaimoku is not liable for any loss or damage arising from your failure to maintain the confidentiality of your account credentials.
          </p>
        </section>

        <section>
          <h2>4. Subscriptions and Payment</h2>
          <p>
            <strong>Plans.</strong> The Service is offered under multiple subscription tiers billed monthly or annually, as selected at the time of purchase. All plans require a paid subscription after the trial period ends.
          </p>
          <p>
            <strong>Payment.</strong> Paid subscriptions are billed in advance. You authorize us to charge your designated payment method for all fees incurred. All fees are stated in U.S. dollars unless otherwise specified.
          </p>
          <p>
            <strong>Taxes.</strong> Fees are exclusive of taxes. You are responsible for all applicable taxes, except for taxes based on Kaimoku&rsquo;s net income.
          </p>
          <p>
            <strong>Price Changes.</strong> We may change our prices with at least 30 days&rsquo; prior written notice. Price changes take effect at the start of your next billing cycle following the notice.
          </p>
          <p>
            <strong>Refunds.</strong> Fees are non-refundable except where required by applicable law or as expressly stated in these Terms.
          </p>
        </section>

        <section>
          <h2>5. Free Trial</h2>
          <p>
            New accounts receive a 14-day free trial with full access to all platform features. Near the end of the trial period, you may request a one-time 14-day extension. After the trial period (including any extension), you must select a paid subscription to continue using the Service.
          </p>
          <p>
            If no paid plan is selected when the trial expires, your account will be frozen: you may log in and view existing data, but sending and receiving email will be suspended. Your data will be preserved for 30 days following trial expiration. After 30 days without conversion to a paid plan, your account and its data will be permanently deleted with prior notice.
          </p>
          <p>
            The trial is provided &ldquo;as is&rdquo; without any service level commitments.
          </p>
        </section>

        <section>
          <h2>6. Your Data</h2>
          <p>
            <strong>Ownership.</strong> You retain all rights, title, and interest in and to the data you submit to the Service (&ldquo;Customer Data&rdquo;), including email messages, attachments, contacts, and calendar entries. Kaimoku does not claim ownership of Customer Data.
          </p>
          <p>
            <strong>License.</strong> You grant Kaimoku a limited, non-exclusive license to use, process, and store Customer Data solely to provide and improve the Service.
          </p>
          <p>
            <strong>Data Portability.</strong> You may export your Customer Data at any time using standard protocols (IMAP, CalDAV, CardDAV) or through the Service&rsquo;s API where available under your plan.
          </p>
          <p>
            <strong>Data Deletion.</strong> Upon account termination, we will delete your Customer Data within 30 days, unless retention is required by law. You may request earlier deletion by contacting us.
          </p>
        </section>

        <section>
          <h2>7. Acceptable Use</h2>
          <p>
            Your use of the Service is subject to our <a href="/legal/acceptable-use" className="text-accent hover:underline">Acceptable Use Policy</a>, which is incorporated into these Terms by reference. Violation of the Acceptable Use Policy may result in suspension or termination of your account.
          </p>
        </section>

        <section>
          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain high availability of the Service but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to provide advance notice of scheduled maintenance.
          </p>
          <p>
            Specific uptime commitments, if any, are governed by the Service Level Agreement applicable to your subscription tier.
          </p>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>
            The Service, including its software, design, documentation, and trademarks, is owned by Kaimoku Technologies, LLC and is protected by intellectual property laws. These Terms do not grant you any right to use Kaimoku&rsquo;s trademarks, logos, or brand features without prior written consent.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            <strong>By You.</strong> You may cancel your subscription at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period.
          </p>
          <p>
            <strong>By Us.</strong> We may suspend or terminate your account if you breach these Terms, the Acceptable Use Policy, or if required by law. We will provide reasonable notice where practicable, except in cases of egregious violations or legal obligation.
          </p>
          <p>
            <strong>Effect of Termination.</strong> Upon termination, your right to use the Service ceases. You will have 30 days to export your data before it is deleted.
          </p>
        </section>

        <section>
          <h2>11. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. KAIMOKU DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
          </p>
        </section>

        <section>
          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL KAIMOKU, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.
          </p>
          <p>
            KAIMOKU&rsquo;S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO KAIMOKU IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
          </p>
        </section>

        <section>
          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Kaimoku and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&rsquo; fees) arising out of or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) Customer Data you submit to the Service.
          </p>
        </section>

        <section>
          <h2>14. Modifications to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by email or through the Service at least 30 days before they take effect. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the changes, you must stop using the Service and cancel your account.
          </p>
        </section>

        <section>
          <h2>15. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, without regard to its conflict of laws principles. Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in any court of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2>16. General Provisions</h2>
          <p>
            <strong>Entire Agreement.</strong> These Terms, together with the Privacy Policy and Acceptable Use Policy, constitute the entire agreement between you and Kaimoku regarding the Service.
          </p>
          <p>
            <strong>Severability.</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
          </p>
          <p>
            <strong>Waiver.</strong> Failure to enforce any provision of these Terms does not constitute a waiver of that provision.
          </p>
          <p>
            <strong>Assignment.</strong> You may not assign your rights or obligations under these Terms without our prior written consent. Kaimoku may assign these Terms in connection with a merger, acquisition, or sale of assets.
          </p>
        </section>

        <section>
          <h2>17. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at:
          </p>
          <p>
            Kaimoku Technologies, LLC<br />
            Email: legal@kaimoku.tech
          </p>
        </section>
      </div>
    </div>
  );
}
