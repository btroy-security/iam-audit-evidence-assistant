import Link from "next/link";
import { notFound } from "next/navigation";
import { getControlById, getRelatedControls } from "@/lib/controls";
import { RiskBadge } from "@/components/StatusBadge";
import { AiAssistantPanel } from "@/components/AiAssistantPanel";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const control = getControlById(id);

  if (!control) {
    notFound();
  }

  const related = getRelatedControls(control);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/explorer" className="text-sm text-teal hover:underline mb-3 inline-block">
          ← Back to Control Explorer
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-teal">
              {control.framework}
              {control.controlIdVerified ? ` · ${control.controlId}` : ""}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mt-1">
              {control.title}
            </h1>
            {!control.controlIdVerified && (
              <p className="text-sm text-navy/50 italic mt-1">
                General control concept — no verified official identifier
              </p>
            )}
          </div>
          <RiskBadge severity={control.riskSeverity} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="What the control means">
            <p>{control.plainLanguageExplanation}</p>
          </Section>

          <Section title="Why the control matters (objective)">
            <p>{control.controlObjective}</p>
          </Section>

          <Section title="Evidence an auditor may request">
            <ul className="space-y-3">
              {control.evidenceRequested.map((item) => (
                <li key={item.id} className="rounded-md border border-navy/10 p-3">
                  <p className="font-medium text-navy">{item.label}</p>
                  <p className="text-sm text-navy/60 mt-1">
                    Quality criteria: {item.qualityCriteria}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Evidence-quality checklist">
            <ul className="list-disc list-inside space-y-1">
              {control.evidenceQualityCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          <Section title="Common evidence gaps">
            <ul className="list-disc list-inside space-y-1">
              {control.commonEvidenceGaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </Section>

          <Section title="Example audit procedure">
            <p>{control.exampleAuditTest}</p>
          </Section>

          <Section title="Example compliant condition">
            <p>{control.exampleCompliantCondition}</p>
          </Section>

          <Section title="Example audit finding" tone="warning">
            <p>{control.exampleAuditFinding}</p>
          </Section>

          <Section title="Business and security risks" tone="warning">
            <div className="space-y-2">
              <p><span className="font-medium">Security risk: </span>{control.potentialSecurityRisk}</p>
              <p><span className="font-medium">Business impact: </span>{control.potentialBusinessImpact}</p>
            </div>
          </Section>

          <Section title="Recommended remediation steps">
            <ul className="list-disc list-inside space-y-1">
              {control.suggestedRemediation.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-sm text-navy/60 mt-2">
              Suggested owner: {control.suggestedRemediationOwner} · Target
              completion: {control.suggestedTargetCompletionPeriod}
            </p>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-navy/10 bg-white p-4">
            <h2 className="font-semibold text-navy mb-3">Ownership</h2>
            <p className="text-sm text-navy/60">Control owner</p>
            <p className="font-medium text-navy mb-2">{control.controlOwner}</p>
            <p className="text-sm text-navy/60">Supporting stakeholders</p>
            <p className="font-medium text-navy mb-2">
              {control.supportingStakeholders.join(", ")}
            </p>
            <p className="text-sm text-navy/60">Recommended review frequency</p>
            <p className="font-medium text-navy">{control.recommendedReviewFrequency}</p>
          </div>

          {related.length > 0 && (
            <div className="rounded-lg border border-navy/10 bg-white p-4">
              <h2 className="font-semibold text-navy mb-3">Related controls</h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/workspace/${r.id}`} className="text-teal hover:underline text-sm">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-navy p-4 text-white">
            <p className="text-sm mb-3">Ready to check your evidence against this control?</p>
            <Link
              href={`/checklist/${control.id}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-teal px-4 py-2 font-semibold text-navy hover:bg-teal-light transition-colors"
            >
              Start Evidence Checklist
            </Link>
          </div>

          <AiAssistantPanel controlId={control.id} controlTitle={control.title} />

          <div className="rounded-lg border border-navy/10 bg-white p-3 text-xs text-navy/60">
            <p className="font-medium text-navy mb-1">Source reference</p>
            <p>{control.sourceReference}</p>
            <p className="mt-2 italic">{control.educationalDisclaimer}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <section
      className={`rounded-lg border p-5 ${
        tone === "warning" ? "border-status-gap/30 bg-status-gap/5" : "border-navy/10 bg-white"
      }`}
    >
      <h2 className="font-semibold text-navy mb-2">{title}</h2>
      <div className="text-navy/80 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
