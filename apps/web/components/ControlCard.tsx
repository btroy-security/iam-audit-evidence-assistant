import Link from "next/link";
import type { ControlRecord } from "@/lib/types";
import { RiskBadge } from "@/components/StatusBadge";

export function ControlCard({ control }: { control: ControlRecord }) {
  return (
    <Link
      href={`/workspace/${control.id}`}
      className="block rounded-lg border border-navy/10 bg-white p-4 hover:border-teal hover:shadow-md transition-all focus-visible:border-teal"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-teal">
          {control.framework}
          {control.controlIdVerified ? ` · ${control.controlId}` : ""}
        </span>
        <RiskBadge severity={control.riskSeverity} />
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1">
        {control.title}
      </h3>
      {!control.controlIdVerified && (
        <p className="text-xs text-navy/50 mb-2 italic">
          General control concept (no verified official identifier)
        </p>
      )}
      <p className="text-sm text-navy/70 line-clamp-3">
        {control.plainLanguageExplanation}
      </p>
      <span className="mt-3 inline-block text-sm font-medium text-teal">
        View audit evidence guidance →
      </span>
    </Link>
  );
}
