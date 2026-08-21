import { z } from "zod";
import { getControlById } from "../controlsRepository.js";
import { calculateReadiness } from "../scoring.js";
import type { ChecklistEntry } from "../types.js";

const evidenceStatusEnum = z.enum([
  "Available",
  "Missing",
  "Incomplete",
  "Outdated",
  "Not applicable",
]);

const checklistEntrySchema = z.object({
  evidenceItemId: z
    .string()
    .min(1)
    .describe("The evidence item id, from get_evidence_requirements."),
  status: evidenceStatusEnum,
  note: z.string().max(2000).optional(),
});

export const validateEvidenceStatusInputShape = {
  controlId: z.string().min(1),
  checklist: z
    .array(checklistEntrySchema)
    .min(1)
    .describe("One entry per evidence item, with its current status."),
};

const schema = z.object(validateEvidenceStatusInputShape);

export async function validateEvidenceStatusHandler(rawArgs: unknown) {
  const parsed = schema.safeParse(rawArgs);
  if (!parsed.success) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Invalid input: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
        },
      ],
    };
  }

  const { controlId, checklist } = parsed.data;
  const control = getControlById(controlId);
  if (!control) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `No control found with id "${controlId}". Use search_controls to find a valid id first.`,
        },
      ],
    };
  }

  // Validate that every submitted evidenceItemId actually belongs to this control.
  const validItemIds = new Set(control.evidenceRequested.map((e) => e.id));
  const unknownIds = checklist
    .map((e) => e.evidenceItemId)
    .filter((id) => !validItemIds.has(id));
  if (unknownIds.length > 0) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `These evidenceItemId values don't belong to control "${controlId}": ${unknownIds.join(", ")}. Valid ids are: ${Array.from(validItemIds).join(", ")}.`,
        },
      ],
    };
  }

  const readiness = calculateReadiness(control, checklist as ChecklistEntry[]);

  const gaps = checklist
    .filter((e) => e.status !== "Available" && e.status !== "Not applicable")
    .map((e) => {
      const item = control.evidenceRequested.find(
        (i) => i.id === e.evidenceItemId
      );
      return {
        evidenceItemId: e.evidenceItemId,
        label: item?.label,
        status: e.status,
        note: e.note,
      };
    });

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            controlId: control.id,
            title: control.title,
            readinessStatus: readiness.status,
            readinessScore: readiness.score,
            scoringReasons: readiness.reasons,
            identifiedGaps: gaps,
            disclaimer:
              "This is an educational, transparent, rules-based readiness indicator — not an AI judgment and not a formal compliance decision.",
          },
          null,
          2
        ),
      },
    ],
  };
}
