import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "Terms of Service — ProtoGrid",
  description: "ProtoGrid Terms of Service. Read the terms governing use of our platform and services.",
};

export default function TermsPage() {
  return (
    <main className="flex flex-col pt-16 min-h-screen">
      <section className="py-8 lg:py-16 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Legal
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,4vw,48px)] leading-[1.08] tracking-[-0.02em] text-cold-pearl">
            Terms of Service
          </h1>
          <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk mt-3">
            Effective date: April 15, 2025 · Version 1.0
          </p>
        </div>
      </section>

      <section className="py-8 lg:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-[720px] prose-protogrid space-y-10">

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">1. Agreement to Terms</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                By accessing or using the ProtoGrid platform (&quot;Service&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. ProtoGrid reserves
                the right to update these Terms at any time. Continued use after changes constitutes acceptance of
                the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">2. Description of Service</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                ProtoGrid is an engineering and fabrication studio that provides custom part manufacturing,
                prototyping, part redesign, and small-batch production services. The platform allows clients to
                submit requests, attach reference files, communicate with our team, and track the status of
                their orders.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">3. Accounts</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                To submit requests, you must create an account. You are responsible for maintaining the
                confidentiality of your credentials and for all activity under your account. You must provide
                accurate, current information. ProtoGrid may suspend or terminate accounts that violate these
                Terms or appear fraudulent.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">4. Request Submissions</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                Submitting a request does not constitute a binding order. All requests are reviewed by ProtoGrid.
                We reserve the right to decline any request at our discretion. A binding agreement is formed
                only when ProtoGrid explicitly accepts a request and both parties agree on scope, pricing, and
                timeline.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">5. Uploaded Content</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                You retain ownership of all files, designs, and materials you upload. By uploading content,
                you grant ProtoGrid a limited, non-exclusive license to use that content solely for the purpose
                of fulfilling your request. ProtoGrid will not share your uploads with third parties except as
                necessary to complete your order (e.g., manufacturing partners). You must not upload content
                that infringes on third-party intellectual property rights.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">6. Pricing and Payment</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                Pricing is determined on a per-request basis after review. Quotes are valid for 14 days unless
                otherwise stated. Payment terms will be communicated at the time of quote acceptance. ProtoGrid
                reserves the right to require partial or full prepayment before commencing work.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">7. Intellectual Property</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                All ProtoGrid branding, site content, UI design, and proprietary processes remain the property
                of ProtoGrid. Client-provided designs and specifications remain the property of the client.
                Unless explicitly agreed otherwise, ProtoGrid retains the right to use completed project
                photographs in portfolio and marketing materials.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">8. Limitation of Liability</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                ProtoGrid provides the Service &quot;as is&quot; without warranty of any kind. To the maximum
                extent permitted by law, ProtoGrid shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising from your use of the Service. ProtoGrid&apos;s total
                liability for any claim shall not exceed the amount paid by you for the specific service giving
                rise to the claim.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">9. Termination</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                You may delete your account at any time by contacting us. ProtoGrid may suspend or terminate
                your access if you violate these Terms. Upon termination, your right to use the Service ceases
                immediately. Provisions that by their nature should survive (liability, IP, disputes) will
                survive termination.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">10. Governing Law</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                These Terms are governed by and construed in accordance with applicable law. Any disputes
                arising from these Terms or the Service shall be resolved through good-faith negotiation first,
                then through binding arbitration if necessary.
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-[18px] text-cold-pearl mb-3">11. Contact</h2>
              <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke">
                For questions about these Terms, contact us at{" "}
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
