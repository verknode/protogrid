import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "Privacy Policy — ProtoGrid",
  description: "ProtoGrid Privacy Policy. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-col pt-16 min-h-screen">
      <section className="py-8 lg:py-16 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Legal
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,4vw,48px)] leading-[1.08] tracking-[-0.02em] text-cold-pearl">
            Privacy Policy
          </h1>
          <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk mt-3">
            Effective date: April 15, 2025 · Version 1.0
          </p>
        </div>
      </section>

      <section className="py-8 lg:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-[720px] space-y-10">

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">1. Information We Collect</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke mb-3">
                We collect information you provide directly:
              </p>
              <ul className="list-disc list-inside font-sans text-[14px] leading-[1.68] text-lavender-smoke space-y-1.5 pl-2">
                <li><strong className="text-cold-pearl">Account data:</strong> name, email address, password (hashed)</li>
                <li><strong className="text-cold-pearl">Request data:</strong> task descriptions, dimensions, deadlines, messages</li>
                <li><strong className="text-cold-pearl">Uploaded files:</strong> designs, reference images, technical documents</li>
                <li><strong className="text-cold-pearl">Communications:</strong> messages exchanged through the platform</li>
              </ul>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke mt-3">
                We automatically collect:
              </p>
              <ul className="list-disc list-inside font-sans text-[14px] leading-[1.68] text-lavender-smoke space-y-1.5 pl-2">
                <li><strong className="text-cold-pearl">Session data:</strong> IP address, user agent, session tokens</li>
                <li><strong className="text-cold-pearl">Usage data:</strong> pages visited, features used, timestamps</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside font-sans text-[14px] leading-[1.68] text-lavender-smoke space-y-1.5 pl-2">
                <li>To provide, operate, and maintain the Service</li>
                <li>To process and fulfill your requests</li>
                <li>To communicate with you about your orders and account</li>
                <li>To improve the Service and develop new features</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">3. Data Storage and Security</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                Your data is stored in a PostgreSQL database hosted on secure, encrypted infrastructure.
                Passwords are hashed and never stored in plaintext. File uploads are stored via secure
                third-party storage services with encrypted transfer. We implement industry-standard security
                measures, but no system is completely secure. We will notify you of any data breach that may
                affect your personal information.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">4. Data Sharing</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside font-sans text-[14px] leading-[1.68] text-lavender-smoke space-y-1.5 pl-2 mt-3">
                <li><strong className="text-cold-pearl">Service providers:</strong> hosting, file storage, and authentication services that help us operate the platform</li>
                <li><strong className="text-cold-pearl">Manufacturing partners:</strong> only the technical data necessary to fulfill your specific request, with your knowledge</li>
                <li><strong className="text-cold-pearl">Legal compliance:</strong> when required by law, regulation, or legal process</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">5. Cookies and Tracking</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                We use essential cookies for authentication and session management. These are strictly
                necessary for the Service to function. We do not use third-party tracking cookies or
                advertising pixels. No data is sold to advertisers.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">6. Your Rights</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                You have the right to:
              </p>
              <ul className="list-disc list-inside font-sans text-[14px] leading-[1.68] text-lavender-smoke space-y-1.5 pl-2 mt-3">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your data in a machine-readable format</li>
                <li>Withdraw consent at any time (where consent is the basis for processing)</li>
              </ul>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke mt-3">
                To exercise these rights, contact us at{" "}
                <a href="mailto:hello@protogrid.com" className="text-cold-pearl hover:text-white transition-colors duration-150">
                  hello@protogrid.com
                </a>.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">7. Data Retention</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                We retain your data for as long as your account is active or as needed to provide services.
                After account deletion, we may retain anonymized data for analytics and records required by
                law. Uploaded files associated with completed requests are retained for 12 months after
                project completion unless otherwise agreed.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">8. Children</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                The Service is not intended for use by individuals under 16 years of age. We do not knowingly
                collect personal information from children. If we learn we have collected data from a child
                under 16, we will delete it promptly.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">9. Changes to This Policy</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                We may update this Privacy Policy from time to time. The version number and effective date at
                the top of this page indicate when it was last revised. We will notify registered users of
                material changes via email or platform notification.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">10. Contact</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                For privacy-related questions or requests, contact us at{" "}
                <a href="mailto:hello@protogrid.com" className="text-cold-pearl hover:text-white transition-colors duration-150">
                  hello@protogrid.com
                </a>.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
