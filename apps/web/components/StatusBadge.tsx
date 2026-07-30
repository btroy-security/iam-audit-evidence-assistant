import type { ReadinessStatus, RiskSeverity } from "@/lib/types";

const READINESS_STYLES: Record<
  ReadinessStatus,
  { bg: string; text: string; icon: string }
> = {
  Ready: { bg: "bg-status-ready/10", text: "text-status-ready", icon: "✓" },
  "Partially ready": {
    bg: "bg-status-partial/10",
    text: "text-status-partial",
    icon: "◐",
  },
  "Evidence gaps identified": {
    bg: "bg-status-gap/10",
    text: "text-status-gap",
    icon: "!",
  },
  "Significant gaps identified": {
    bg: "bg-status-significant/10",
    text: "text-status-significant",
    icon: "✕",
  },
};

export function ReadinessBadge({ status }: { status: ReadinessStatus }) {
  const style = READINESS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border ${style.bg} ${style.text}`}
      style={{ borderColor: "currentColor" }}
    >
      <span aria-hidden="true">{style.icon}</span>
      {status}
    </span>
  );
}

const RISK_STYLES: Record<RiskSeverity, { bg: string; text: string }> = {
  Low: { bg: "bg-status-ready/10", text: "text-status-ready" },
  Medium: { bg: "bg-status-partial/10", text: "text-status-partial" },
  High: { bg: "bg-status-gap/10", text: "text-status-gap" },
  Critical: { bg: "bg-status-significant/10", text: "text-status-significant" },
};

export function RiskBadge({ severity }: { severity: RiskSeverity }) {
  const style = RISK_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}
    >
      {severity} risk
    </span>
  );
}
