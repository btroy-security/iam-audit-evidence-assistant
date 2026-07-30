import Link from "next/link";
import { getAllControls, getFrameworks } from "@/lib/controls";

export default function HomePage() {
  const controls = getAllControls();
  const frameworks = getFrameworks();

  return (
    <div className="space-y-10">
      <section className="bg-navy text-white rounded-xl p-8 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          IAM Audit Evidence Assistant
        </h1>
        <p className="text-white/80 max-w-2xl mb-6">
          An educational tool that helps you understand what audit evidence
          is typically needed to demonstrate an Identity and Access
          Management control is working — and lets you self-assess your
          readiness before a real audit happens.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-md bg-teal px-5 py-2.5 font-semibold text-navy hover:bg-teal-light transition-colors"
          >
            Start New Assessment
          </Link>
          <Link
            href="/explorer"
            className="inline-flex items-center rounded-md border border-white/30 px-5 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Ask the AI Assistant
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-navy/10 bg-white p-6">
          <p className="text-sm text-navy/60 mb-1">Available frameworks</p>
          <p className="text-3xl font-bold text-navy">{frameworks.length}</p>
          <p className="text-sm text-navy/60 mt-1">
            {frameworks.join(", ")}
          </p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-6">
          <p className="text-sm text-navy/60 mb-1">IAM controls in library</p>
          <p className="text-3xl font-bold text-navy">{controls.length}</p>
          <p className="text-sm text-navy/60 mt-1">
            Covering account management, privileged access, MFA, access
            reviews, deprovisioning, JML lifecycle, segregation of duties,
            service accounts, password management, and monitoring
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-navy mb-4">
          Recent sample assessments
        </h2>
        <div className="rounded-lg border border-navy/10 bg-white p-6">
          <p className="text-sm text-navy/70 mb-3">
            Try the built-in demonstration scenario: a quarterly User Access
            Review that is nine months overdue, with several evidence items
            missing.
          </p>
          <Link
            href="/workspace/pci-uar-user-access-reviews"
            className="inline-flex items-center text-teal font-medium hover:underline"
          >
            View the User Access Review sample scenario →
          </Link>
        </div>
      </section>

      <section
        aria-label="Educational use disclaimer"
        className="rounded-lg border border-status-partial/40 bg-status-partial/5 p-4 text-sm text-navy"
      >
        <strong>Educational use only:</strong> This application helps you
        understand and practice audit-readiness concepts. It does not
        certify any organization as compliant with any framework and is not
        a substitute for a qualified auditor.
      </section>
    </div>
  );
}
