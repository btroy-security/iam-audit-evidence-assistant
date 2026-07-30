"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getControlById } from "@/lib/controls";
import type { ChecklistEntry, EvidenceStatus } from "@/lib/types";

const STATUS_OPTIONS: EvidenceStatus[] = [
  "Available",
  "Missing",
  "Incomplete",
  "Outdated",
  "Not applicable",
];

export function checklistStorageKey(controlId: string) {
  return `iam-assistant:checklist:${controlId}`;
}

export default function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const control = getControlById(id);

  const [entries, setEntries] = useState<Record<string, ChecklistEntry>>(
    () => {
      if (!control || typeof window === "undefined") return {};
      const saved = sessionStorage.getItem(checklistStorageKey(control.id));
      if (!saved) return {};
      try {
        const parsed = JSON.parse(saved) as ChecklistEntry[];
        const map: Record<string, ChecklistEntry> = {};
        parsed.forEach((e) => (map[e.evidenceItemId] = e));
        return map;
      } catch {
        return {};
      }
    }
  );

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

  const updateStatus = (evidenceItemId: string, status: EvidenceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [evidenceItemId]: { ...prev[evidenceItemId], evidenceItemId, status },
    }));
  };

  const updateNote = (evidenceItemId: string, note: string) => {
    setEntries((prev) => ({
      ...prev,
      [evidenceItemId]: {
        ...prev[evidenceItemId],
        evidenceItemId,
        status: prev[evidenceItemId]?.status ?? "Missing",
        note,
      },
    }));
  };

  const allAnswered = control.evidenceRequested.every(
    (item) => entries[item.id]?.status
  );

  const handleSubmit = () => {
    const list = control.evidenceRequested.map(
      (item): ChecklistEntry =>
        entries[item.id] ?? { evidenceItemId: item.id, status: "Missing" }
    );
    sessionStorage.setItem(
      checklistStorageKey(control.id),
      JSON.stringify(list)
    );
    router.push(`/results/${control.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/workspace/${control.id}`}
          className="text-sm text-teal hover:underline mb-3 inline-block"
        >
          ← Back to {control.title}
        </Link>
        <h1 className="text-2xl font-bold text-navy mb-1">
          Evidence Validation Checklist
        </h1>
        <p className="text-navy/70">
          For each evidence item, mark its current status. This is a
          self-assessment aid — it produces a readiness indicator, not a
          formal compliance decision.
        </p>
      </div>

      <div className="space-y-4">
        {control.evidenceRequested.map((item) => {
          const entry = entries[item.id];
          return (
            <fieldset
              key={item.id}
              className="rounded-lg border border-navy/10 bg-white p-4"
            >
              <legend className="font-medium text-navy px-1">
                {item.label}
              </legend>
              <p className="text-sm text-navy/60 mb-3">
                {item.qualityCriteria}
              </p>

              <div className="flex flex-wrap gap-2 mb-3" role="radiogroup">
                {STATUS_OPTIONS.map((status) => {
                  const selected = entry?.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateStatus(item.id, status)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? "border-teal bg-teal text-white"
                          : "border-navy/20 text-navy hover:border-teal"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <label
                htmlFor={`note-${item.id}`}
                className="block text-sm text-navy/60 mb-1"
              >
                Notes (optional, fictional/sample data only)
              </label>
              <textarea
                id={`note-${item.id}`}
                value={entry?.note ?? ""}
                onChange={(e) => updateNote(item.id, e.target.value)}
                rows={2}
                className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm text-navy focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="e.g. Last review found in shared drive dated March 2025"
              />
            </fieldset>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-navy p-4">
        <p className="text-white/80 text-sm">
          {Object.keys(entries).length} of{" "}
          {control.evidenceRequested.length} items assessed
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="rounded-md bg-teal px-5 py-2.5 font-semibold text-navy hover:bg-teal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Calculate Readiness →
        </button>
      </div>
    </div>
  );
}
