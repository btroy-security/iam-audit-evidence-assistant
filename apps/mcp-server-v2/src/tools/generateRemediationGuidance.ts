import { z } from "zod";
import { getControlById } from "../controlsRepository.js";

export const generateRemediationGuidanceInputShape = {
  controlId: z.string().min(1),
  evidenceGaps: z
    .array(z.string().min(1))
    .min(1)
    .describe(
      "Evidence item ids (from get_evidence_requirements) that are missing, incomplete, or outdated."
    ),
  riskLevel: z
    .enum(["Low", "Medium", "High", "Critical"])
    .optional()
    .describe(
      "Optional override for risk level. If omitted, the control's own documented risk severity is used."
    ),
};

const schema = z.object(generateRemediationGuidanceInputShape);

export async function generateRemediationGuidanceHandler(rawArgs: unknown) {
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

  const { controlId, evidenceGaps, riskLevel } = parsed.data;
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

  const validItemIds = new Set(control.evidenceRequested.map((e) => e.id));
  const unknownIds = evidenceGaps.filter((id) => !validItemIds.has(id));
  if (unknownIds.length > 0) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `These evidenceGaps ids don't belong to control "${controlId}": ${unknownIds.join(", ")}. Valid ids are: ${Array.from(validItemIds).join(", ")}.`,
        },
      ],
    };
  }

  const gapLabels = evidenceGaps.map((id) => {
    const item = control.evidenceRequested.find((e) => e.id === id);
    return item?.label ?? id;
  });

  const effectiveRisk = riskLevel ?? control.riskSeverity;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            controlId: control.id,
            title: control.title,
            gapsAddressed: gapLabels,
            riskLevelUsed: effectiveRisk,
            recommendedActions: control.suggestedRemediation,
            suggestedOwner: control.suggestedRemediationOwner,
            suggestedTargetCompletionPeriod:
              control.suggestedTargetCompletionPeriod,
            relatedSecurityRisk: control.potentialSecurityRisk,
            relatedBusinessImpact: control.potentialBusinessImpact,
            disclaimer:
              "This is educational remediation guidance based on the control library, not a formal corrective action plan or legal advice.",
          },
          null,
          2
        ),
      },
    ],
  };
}
