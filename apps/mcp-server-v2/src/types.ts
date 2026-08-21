/**
 * Types for the IAM Audit Evidence Assistant MCP server.
 * These intentionally mirror apps/web/lib/types.ts — this server owns its
 * own copy of the control data and doesn't import across the app boundary,
 * so the two apps stay properly decoupled.
 */

export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";

export type EvidenceStatus =
  | "Available"
  | "Missing"
  | "Incomplete"
  | "Outdated"
  | "Not applicable";

export interface EvidenceItem {
  id: string;
  label: string;
  qualityCriteria: string;
}

export interface ControlRecord {
  id: string;
  framework: "NIST SP 800-53" | "NIST CSF" | "PCI DSS" | "SOX" | "CIS Controls";
  controlId: string;
  controlIdVerified: boolean;
  title: string;
  topic: string;
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
  relatedControlIds: string[];
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
  score: number;
  reasons: string[];
}
