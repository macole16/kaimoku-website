import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — Kaimoku Technologies",
  description:
    "Acceptable Use Policy for Kuju Email and Kaimoku Technologies services.",
};

export default function AcceptableUsePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold text-primary">
        Acceptable Use Policy
      </h1>
      <p className="mb-12 text-sm text-slate-500">
        Effective Date: March 18, 2026 &middot; Last Updated: March 18, 2026
      </p>

      <div className="space-y-10 text-slate-700 leading-relaxed [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>1. Purpose</h2>
          <p>
            This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of
            the Kuju Email service provided by Kaimoku Technologies, LLC
            (&ldquo;Kaimoku&rdquo;). This AUP is incorporated into and forms
            part of our{" "}
            <a
              href="/legal/terms"
              className="text-primary-light hover:underline"
            >
              Terms of Service
            </a>
            . By using the Service, you agree to comply with this policy.
          </p>
          <p>
            As an email service provider, we have a responsibility to the
            broader internet community to prevent abuse of our platform. This
            policy exists to protect our customers, our infrastructure, and the
            recipients of email sent through our Service.
          </p>
        </section>

        <section>
          <h2>2. Prohibited Activities</h2>
          <p>You may not use the Service to:</p>

          <p>
            <strong>Spam and Unsolicited Messaging</strong>
          </p>
          <ul>
            <li>
              Send unsolicited bulk email (spam) or unsolicited commercial email
            </li>
            <li>
              Send messages to purchased, rented, or harvested email lists
            </li>
            <li>
              Send messages to recipients who have not given consent to receive
              them
            </li>
            <li>Operate open relays or open proxies</li>
            <li>
              Use the Service to send messages on behalf of third parties in a
              manner designed to disguise the origin of the message
            </li>
          </ul>

          <p>
            <strong>Malicious Content and Activity</strong>
          </p>
          <ul>
            <li>
              Distribute malware, viruses, trojans, ransomware, or other harmful
              software
            </li>
            <li>Engage in phishing, spoofing, or social engineering attacks</li>
            <li>Distribute content that facilitates illegal activity</li>
            <li>
              Attempt to gain unauthorized access to any system, network, or
              account
            </li>
            <li>
              Interfere with or disrupt the Service or servers/networks
              connected to the Service
            </li>
          </ul>

          <p>
            <strong>Illegal and Harmful Content</strong>
          </p>
          <ul>
            <li>
              Transmit content that violates any applicable law or regulation
            </li>
            <li>
              Distribute child sexual abuse material (CSAM) — we report all
              instances to NCMEC and law enforcement
            </li>
            <li>
              Engage in or facilitate harassment, threats, or intimidation
            </li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>
              Transmit content that is defamatory, obscene, or promotes violence
            </li>
          </ul>

          <p>
            <strong>Service Abuse</strong>
          </p>
          <ul>
            <li>
              Create accounts for the purpose of abusing trial periods or plan
              limits
            </li>
            <li>
              Use the Service in a way that degrades performance for other
              customers
            </li>
            <li>
              Resell or redistribute access to the Service without authorization
            </li>
            <li>
              Circumvent or attempt to circumvent any usage limits, rate limits,
              or security measures
            </li>
            <li>
              Use automated means to create accounts or access the Service in a
              manner that exceeds reasonable use
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Email Sending Standards</h2>
          <p>When sending email through the Service, you must:</p>
          <ul>
            <li>
              Include a valid, functional unsubscribe mechanism in all
              commercial or marketing messages
            </li>
            <li>Honor unsubscribe requests within 10 business days</li>
            <li>
              Include accurate sender information and a valid physical mailing
              address in commercial messages, as required by CAN-SPAM, CASL, and
              similar laws
            </li>
            <li>
              Not use false or misleading header information or deceptive
              subject lines
            </li>
            <li>
              Comply with all applicable anti-spam legislation in your
              jurisdiction and the jurisdiction of recipients
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Domain and DNS Requirements</h2>
          <p>For domains used with the Service, you must:</p>
          <ul>
            <li>Own or have authorization to use the domain</li>
            <li>
              Maintain valid DNS records as configured by the Service (SPF,
              DKIM, DMARC)
            </li>
            <li>
              Not configure DNS records that interfere with the Service&rsquo;s
              email authentication
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Resource Limits</h2>
          <p>
            Each subscription tier includes defined per-account limits for
            storage and sending volume. Usage that consistently exceeds your
            plan&rsquo;s limits will trigger a notification and grace period,
            followed by automatic overage billing (if opted in) or temporary
            throttling of large attachments.
          </p>
          <p>
            We reserve the right to impose reasonable rate limits on sending,
            API usage, and other Service functions to ensure fair use and
            platform stability.
          </p>
        </section>

        <section>
          <h2>6. Monitoring and Enforcement</h2>
          <p>
            We reserve the right to monitor use of the Service for compliance
            with this AUP. We do not routinely read the content of your
            messages, but we may review content:
          </p>
          <ul>
            <li>
              When required by automated spam and threat detection systems
            </li>
            <li>In response to a complaint or abuse report</li>
            <li>
              When we have reason to believe a violation of this AUP has
              occurred
            </li>
            <li>As required by law</li>
          </ul>
        </section>

        <section>
          <h2>7. Consequences of Violation</h2>
          <p>
            Violations of this AUP may result in one or more of the following
            actions, at our sole discretion:
          </p>
          <ul>
            <li>A warning with a request to remedy the violation</li>
            <li>Temporary throttling or restriction of sending capabilities</li>
            <li>Temporary suspension of account access</li>
            <li>Permanent termination of the account</li>
            <li>Reporting to law enforcement where appropriate</li>
          </ul>
          <p>
            The severity of our response will be proportional to the nature and
            severity of the violation. Where practicable, we will notify you and
            provide an opportunity to remedy the issue before taking action,
            except in cases involving illegal activity, imminent harm, or
            egregious abuse.
          </p>
        </section>

        <section>
          <h2>8. Reporting Abuse</h2>
          <p>
            If you believe someone is using the Service in violation of this
            AUP, please report it to:
          </p>
          <p>Email: abuse@kaimoku.tech</p>
          <p>
            Please include as much detail as possible, including message
            headers, dates, and a description of the abuse. We investigate all
            reports and take appropriate action.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this AUP from time to time to reflect changes in our
            practices, legal requirements, or industry standards. We will notify
            you of material changes by email or through the Service at least 30
            days before they take effect.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            If you have questions about this Acceptable Use Policy, please
            contact us at:
          </p>
          <p>
            Kaimoku Technologies, LLC
            <br />
            Email: legal@kaimoku.tech
          </p>
        </section>
      </div>
    </div>
  );
}
