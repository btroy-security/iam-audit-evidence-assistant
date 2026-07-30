import type {
  ChecklistEntry,
  ControlRecord,
  EvidenceStatus,
  ReadinessResult,
  ReadinessStatus,
} from "@/lib/types";

/**
 * TRANSPARENT, RULE-BASED READINESS SCORING
 * -------------------------------------------------------------------------
 * This is intentionally NOT decided by an AI model. Every rule below is
 * visible here in code and explained back to the user in `reasons`, so the
 * score can always be traced back to a specific, understandable cause.
 *
 * Inputs considered (per the app spec):
 *  - Evidence completeness (status of each evidence item)
 *  - Evidence age (an "Outdated" status is treated as an age signal)
 *  - Control criticality (the control's documented risk severity)
 *  - Privileged-access involvement (adds extra weight to gaps)
 *  - Number of missing evidence items
 *
 * "Whether remediation is overdue" is a Phase-2+ concept once we track due
 * dates; it is not part of this Phase 1 calculation and is noted as such.
 */

const STATUS_DEDUCTION: Record<EvidenceStatus, number> = {
  Available: 0,
  Incomplete: 8,
  Outdated: 10,
  Missing: 15,
  "Not applicable": 0,
};

const CRITICALITY_MULTIPLIER: Record<ControlRecord["riskSeverity"], number> = {
  Low: 0.8,
  Medium: 1.0,
  High: 1.25,
  Critical: 1.5,
};

const PRIVILEGED_TOPICS = new Set([
  "Privileged access",
  "Logging and monitoring of privileged activity",
]);

const READY_THRESHOLD = 90;
const PARTIAL_THRESHOLD = 70;
const GAPS_THRESHOLD = 40;

export function calculateReadiness(
  control: ControlRecord,
  checklist: ChecklistEntry[]
): ReadinessResult {
  const reasons: string[] = [];

  const applicableEntries = checklist.filter(
    (e) => e.status !== "Not applicable"
  );

  if (applicableEntries.length === 0) {
    return {
      status: "Significant gaps identified",
      score: 0,
      reasons: [
        "No evidence status has been recorded yet for this control's evidence items.",
      ],
    };
  }

  let totalDeduction = 0;
  let missingCount = 0;

  for (const entry of checklist) {
    const deduction = STATUS_DEDUCTION[entry.status];
    if (entry.status === "Missing") missingCount += 1;
    totalDeduction += deduction;
  }

  if (missingCount > 0) {
    reasons.push(
      `${missingCount} evidence item(s) are marked Missing, each contributing a larger deduction than Incomplete or Outdated items.`
    );
  }

  const criticalityMultiplier = CRITICALITY_MULTIPLIER[control.riskSeverity];
  totalDeduction *= criticalityMultiplier;
  reasons.push(
    `Control risk severity is "${control.riskSeverity}", which applies a ${criticalityMultiplier}x multiplier to any deductions.`
  );

  const isPrivileged = PRIVILEGED_TOPICS.has(control.topic);
  if (isPrivileged) {
    totalDeduction *= 1.15;
    reasons.push(
      "This control involves privileged access, so an additional 1.15x weight is applied because gaps here carry outsized risk."
    );
  }

  const score = Math.max(0, Math.round(100 - totalDeduction));

  const outdatedCount = checklist.filter(
    (e) => e.status === "Outdated"
  ).length;
  if (outdatedCount > 0) {
    reasons.push(
      `${outdatedCount} evidence item(s) are marked Outdated, which is treated as an evidence-age signal.`
    );
  }

  const incompleteCount = checklist.filter(
    (e) => e.status === "Incomplete"
  ).length;
  if (incompleteCount > 0) {
    reasons.push(
      `${incompleteCount} evidence item(s) are marked Incomplete.`
    );
  }

  const availableCount = checklist.filter(
    (e) => e.status === "Available"
  ).length;
  reasons.push(
    `${availableCount} of ${checklist.length} evidence item(s) are marked Available.`
  );

  const status = scoreToStatus(score);

  return { status, score, reasons };
}

function scoreToStatus(score: number): ReadinessStatus {
  if (score >= READY_THRESHOLD) return "Ready";
  if (score >= PARTIAL_THRESHOLD) return "Partially ready";
  if (score >= GAPS_THRESHOLD) return "Evidence gaps identified";
  return "Significant gaps identified";
}

export const SCORING_THRESHOLDS = {
  READY_THRESHOLD,
  PARTIAL_THRESHOLD,
  GAPS_THRESHOLD,
};
