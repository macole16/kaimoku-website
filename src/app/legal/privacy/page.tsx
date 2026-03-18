import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Kaimoku Technologies",
  description: "Privacy Policy for Kuju Email and Kaimoku Technologies services.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold text-primary">Privacy Policy</h1>
      <p className="mb-12 text-sm text-slate-500">
        Effective Date: March 18, 2026 &middot; Last Updated: March 18, 2026
      </p>

      <div className="space-y-10 text-slate-700 leading-relaxed [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Kaimoku Technologies, LLC (&ldquo;Kaimoku,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Kuju Email service and our website at kaimoku.tech (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            By using the Service, you consent to the data practices described in this policy. If you do not agree, please discontinue use of the Service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <p><strong>Account Information.</strong> When you create an account, we collect:</p>
          <ul>
            <li>Name and email address</li>
            <li>Password (stored in hashed form)</li>
            <li>Billing information and payment details (processed by our payment processor)</li>
            <li>Domain name(s) you register with the Service</li>
          </ul>

          <p><strong>Email and Communications Data.</strong> To provide the email service, we process:</p>
          <ul>
            <li>Email messages (content, headers, attachments) sent to and from your account</li>
            <li>Calendar events and contact records you create</li>
            <li>Folder structures and organizational preferences</li>
          </ul>

          <p><strong>Usage Data.</strong> We automatically collect:</p>
          <ul>
            <li>Log data (IP addresses, browser type, access times, pages viewed)</li>
            <li>Service usage metrics (storage used, messages sent/received, feature usage)</li>
            <li>Device information (operating system, client application)</li>
          </ul>

          <p><strong>Cookies and Similar Technologies.</strong> We use essential cookies for authentication and session management. We do not use third-party advertising or tracking cookies. See Section 8 for details.</p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process and deliver email messages</li>
            <li>Authenticate your identity and secure your account</li>
            <li>Process payments and manage subscriptions</li>
            <li>Detect and prevent spam, phishing, malware, and abuse</li>
            <li>Provide customer support</li>
            <li>Send service-related communications (account notifications, security alerts, maintenance notices)</li>
            <li>Comply with legal obligations</li>
            <li>Analyze usage patterns to improve the Service (in aggregate, non-identifying form)</li>
          </ul>
        </section>

        <section>
          <h2>4. AI and Automated Processing</h2>
          <p>
            Kuju Email includes optional AI-powered features for spam detection, phishing analysis, and email categorization. When these features are enabled:
          </p>
          <ul>
            <li>Email content may be processed by AI models to classify messages and detect threats</li>
            <li>AI processing occurs in real-time during message delivery</li>
            <li>We do not use your email content to train AI models</li>
            <li>AI spam scanning can be configured to analyze headers only (without message body) for enhanced privacy</li>
            <li>Your domain administrator controls which AI features are enabled</li>
          </ul>
          <p>
            Where third-party AI providers are used (e.g., for advanced threat detection), only the minimum data necessary is transmitted, and such providers are bound by data processing agreements that prohibit them from using your data for their own purposes.
          </p>
        </section>

        <section>
          <h2>5. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share information in the following circumstances:</p>
          <ul>
            <li><strong>Email Delivery.</strong> To deliver email, message data is transmitted to recipient mail servers as required by email protocols (SMTP).</li>
            <li><strong>Service Providers.</strong> We use third-party service providers for payment processing, infrastructure hosting, and other operational needs. These providers are contractually obligated to protect your data and use it only to perform services on our behalf.</li>
            <li><strong>Legal Requirements.</strong> We may disclose information if required by law, regulation, legal process, or governmental request.</li>
            <li><strong>Safety and Enforcement.</strong> We may disclose information to protect the rights, property, or safety of Kaimoku, our users, or the public, and to enforce our Terms of Service and Acceptable Use Policy.</li>
            <li><strong>Business Transfers.</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your account information and email data for as long as your account is active. Upon account termination or cancellation:
          </p>
          <ul>
            <li>Customer Data (emails, contacts, calendar entries) is deleted within 30 days</li>
            <li>You may request earlier deletion by contacting us</li>
            <li>Backups containing your data are purged within 90 days</li>
            <li>We may retain limited information as required by law (e.g., billing records for tax purposes)</li>
          </ul>
          <p>
            Usage logs and analytics data are retained in aggregate, non-identifying form and are not tied to individual accounts after deletion.
          </p>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including:
          </p>
          <ul>
            <li>Encryption in transit (TLS) for all connections</li>
            <li>Encryption at rest for stored data</li>
            <li>Hashed and salted password storage</li>
            <li>Automatic DKIM key rotation for email authentication</li>
            <li>Regular security assessments</li>
          </ul>
          <p>
            While we strive to protect your information, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            We use only essential cookies required for the Service to function:
          </p>
          <ul>
            <li><strong>Authentication cookies:</strong> To keep you logged in and verify your identity</li>
            <li><strong>Session cookies:</strong> To maintain your session state</li>
            <li><strong>Preference cookies:</strong> To remember your settings (theme, language)</li>
          </ul>
          <p>
            We do not use cookies for advertising, analytics, or cross-site tracking. Because we only use essential cookies, no cookie consent banner is required under most privacy regulations; however, we disclose their use here for transparency.
          </p>
        </section>

        <section>
          <h2>9. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul>
            <li><strong>Access.</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Correction.</strong> Request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion.</strong> Request deletion of your personal information, subject to legal retention requirements.</li>
            <li><strong>Data Portability.</strong> Export your data using standard protocols (IMAP, CalDAV, CardDAV) or the API.</li>
            <li><strong>Objection.</strong> Object to processing of your personal information in certain circumstances.</li>
            <li><strong>Restriction.</strong> Request that we restrict processing of your personal information.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at privacy@kaimoku.tech. We will respond within 30 days (or as required by applicable law).
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            The Service is operated from the United States. If you access the Service from outside the United States, your information may be transferred to, stored, and processed in the United States or other jurisdictions where our service providers operate. By using the Service, you consent to such transfers. We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2>11. Children&rsquo;s Privacy</h2>
          <p>
            The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will take steps to delete that information promptly.
          </p>
        </section>

        <section>
          <h2>12. California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to request deletion, and the right to opt out of the sale of personal information. We do not sell personal information. To exercise your CCPA rights, contact us at privacy@kaimoku.tech.
          </p>
        </section>

        <section>
          <h2>13. European Privacy Rights (GDPR)</h2>
          <p>
            If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data on the following legal bases: (a) performance of a contract (to provide the Service); (b) legitimate interests (to improve the Service and ensure security); and (c) your consent (where applicable). You may withdraw consent at any time. You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>

        <section>
          <h2>14. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service at least 30 days before they take effect. The &ldquo;Last Updated&rdquo; date at the top of this page indicates when the policy was last revised.
          </p>
        </section>

        <section>
          <h2>15. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            Kaimoku Technologies, LLC<br />
            Email: privacy@kaimoku.tech
          </p>
        </section>
      </div>
    </div>
  );
}
