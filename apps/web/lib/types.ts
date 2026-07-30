/**
 * Core data shapes for the IAM Audit Evidence Assistant.
 * These types are shared by the frontend, the (future) AI route,
 * and the (future) MCP server, so all three pieces agree on what
 * a "control" and an "evidence item" look like.
 */

export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";

export type EvidenceStatus =
  | "Available"
  | "Missing"
  | "Incomplete"
  | "Outdated"
  | "Not applicable";

export interface EvidenceItem {
  /** Stable id used to reference this evidence item in the checklist, e.g. "manager-certification" */
  id: string;
  /** Short label shown to the user, e.g. "Manager certification of access" */
  label: string;
  /** One-sentence description of what "good" looks like for this item */
  qualityCriteria: string;
}

export interface ControlRecord {
  id: string; // unique slug, e.g. "nist-ac-2-account-management"
  framework: "NIST SP 800-53" | "NIST CSF" | "PCI DSS" | "SOX" | "CIS Controls";
  controlId: string; // official identifier if verifiable, e.g. "AC-2"
  controlIdVerified: boolean; // false => label as "general control concept"
  title: string;
  topic: string; // one of the 14 IAM topics, used for filtering
  /** Common abbreviations/synonyms (e.g. "MFA", "UAR", "PAM") that should also match search, even if they don't appear in the title/explanation text */
  searchKeywords?: string[];
  plainLanguageExplanation: string;
  controlObjective: string;
  controlOwner: string;
  supportingStakeholders: string[];
  recommendedReviewFrequency: string;
  evidenceRequested: EvidenceItem[];
  evidenceQualityCriteria: string[];
  commonEvidenceGaps: string[];
  exampleAuditTest: string;
  exampleCompliantCondition: string;
  exampleAuditFinding: string;
  potentialSecurityRisk: string;
  potentialBusinessImpact: string;
  riskSeverity: RiskSeverity;
  suggestedRemediation: string[];
  suggestedRemediationOwner: string;
  suggestedTargetCompletionPeriod: string;
  relatedControlIds: string[]; // ids of related ControlRecords
  sourceReference: string;
  educationalDisclaimer: string;
}

export interface ChecklistEntry {
  evidenceItemId: string;
  status: EvidenceStatus;
  note?: string;
}

export type ReadinessStatus =
  | "Ready"
  | "Partially ready"
  | "Evidence gaps identified"
  | "Significant gaps identified";

export interface ReadinessResult {
  status: ReadinessStatus;
  score: number; // 0-100, higher is better; transparent, not AI-derived
  reasons: string[]; // human-readable explanation of how the score was reached
}
