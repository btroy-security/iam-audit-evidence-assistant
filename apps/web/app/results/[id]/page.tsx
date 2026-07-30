"use client";

import { useState, use } from "react";
import Link from "next/link";
import { getControlById } from "@/lib/controls";
import { calculateReadiness } from "@/lib/scoring";
import type { ChecklistEntry, ReadinessResult } from "@/lib/types";
import { ReadinessBadge, RiskBadge } from "@/components/StatusBadge";
import { checklistStorageKey } from "@/app/checklist/[id]/page";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const control = getControlById(id);
  const [checklist] = useState<ChecklistEntry[] | null>(() => {
    if (!control || typeof window === "undefined") return null;
    const saved = sessionStorage.getItem(checklistStorageKey(control.id));
    if (!saved) return null;
    try {
      return JSON.parse(saved) as ChecklistEntry[];
    } catch {
      return null;
    }
  });
  const [readiness] = useState<ReadinessResult | null>(() => {
    if (!control || !checklist) return null;
    return calculateReadiness(control, checklist);
  });

  if (!control) {
    return (
      <div className="rounded-lg border border-navy/10 bg-white p-8 text-center text-navy/60">
        Control not found.{" "}
        <Link href="/explorer" className="text-teal hover:underline">
          Back to Control Explorer
        </Link>
      </div>
    );
  }

  if (!checklist || !readiness) {
    return (
      <div className="rounded-lg border border-navy/10 bg-white p-8 text-center text-navy/60">
        No evidence checklist has been completed yet for this control.
        <div className="mt-4">
          <Link
            href={`/checklist/${control.id}`}
            className="text-teal hover:underline font-medium"
          >
            Go to the Evidence Validation Checklist →
          </Link>
        </div>
      </div>
    );
  }

  const gaps = checklist.filter(
    (e) => e.status === "Missing" || e.status === "Incomplete" || e.status === "Outdated"
  );
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 30);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href={`/checklist/${control.id}`}
          className="text-sm text-teal hover:underline"
        >
          ← Back to Checklist
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:border-teal transition-colors"
        >
          Print / Export Summary
        </button>
      </div>

      <div className="rounded-lg border border-navy/10 bg-white p-6 space-y-1">
        <p className="text-sm text-navy/60">Assessment Results</p>
        <h1 className="text-2xl font-bold text-navy">{control.title}</h1>
        <p className="text-sm text-navy/60">
          {control.framework}
          {control.controlIdVerified ? ` · ${control.controlId}` : ""} ·
          Owner: {control.controlOwner}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <ReadinessBadge status={readiness.status} />
          <RiskBadge severity={control.riskSeverity} />
          <span className="text-sm text-navy/60">
            Readiness score: {readiness.score} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-navy/10 bg-white p-5">
          <h2 className="font-semibold text-navy mb-3">
            Why this score was assigned
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-navy/80">
            {readiness.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="text-xs text-navy/50 mt-3 italic">
            This is a transparent, rules-based readiness indicator — not an
            AI judgment and not a formal compliance decision.
          </p>
        </section>

        <section className="rounded-lg border border-navy/10 bg-white p-5">
          <h2 className="font-semibold text-navy mb-3">Identified gaps</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-navy/60">
              No gaps identified — all applicable evidence is marked
              Available.
            </p>
          ) : (
            <ul className="space-y-2">
              {gaps.map((g) => {
                const item = control.evidenceRequested.find(
                  (i) => i.id === g.evidenceItemId
                );
                return (
                  <li
                    key={g.evidenceItemId}
                    className="text-sm border-l-2 border-status-gap pl-3"
                  >
                    <span className="font-medium text-navy">
                      {item?.label}
                    </span>{" "}
                    — <span className="text-status-gap">{g.status}</span>
                    {g.note && (
                      <p className="text-navy/60 italic">&ldquo;{g.note}&rdquo;</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-navy/10 bg-white p-5">
        <h2 className="font-semibold text-navy mb-3">Recommended actions</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-navy/80">
          {control.suggestedRemediation.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-navy/60">Proposed owner</p>
            <p className="font-medium text-navy">
              {control.suggestedRemediationOwner}
            </p>
          </div>
          <div>
            <p className="text-navy/60">Suggested target completion</p>
            <p className="font-medium text-navy">
              {control.suggestedTargetCompletionPeriod} (approx.{" "}
              {targetDate.toLocaleDateString()})
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-navy/10 bg-white p-5">
        <h2 className="font-semibold text-navy mb-2">Management summary</h2>
        <p className="text-sm text-navy/80 leading-relaxed">
          The {control.title} control was assessed as{" "}
          <strong>{readiness.status}</strong> with a readiness score of{" "}
          {readiness.score}/100. {gaps.length} evidence item(s) require
          attention. Suggested remediation owner is{" "}
          {control.suggestedRemediationOwner}, with a target completion
          window of {control.suggestedTargetCompletionPeriod}.
        </p>

        <h3 className="font-semibold text-navy mt-4 mb-2">
          Detailed analyst notes
        </h3>
        <ul className="text-sm text-navy/80 space-y-1">
          {checklist.map((e) => {
            const item = control.evidenceRequested.find(
              (i) => i.id === e.evidenceItemId
            );
            return (
              <li key={e.evidenceItemId}>
                <span className="font-medium">{item?.label}:</span>{" "}
                {e.status}
                {e.note ? ` — ${e.note}` : ""}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-lg border border-status-partial/40 bg-status-partial/5 p-4 text-sm text-navy">
        <strong>Disclaimer:</strong> {control.educationalDisclaimer} This
        summary is generated for educational and portfolio purposes using
        fictional or sample evidence notes. It does not represent a real
        audit outcome.
      </section>
    </div>
  );
}
