import { z } from "zod";
import { getControlById } from "../controlsRepository.js";

export const getEvidenceRequirementsInputShape = {
  controlId: z
    .string()
    .min(1)
    .describe(
      "The internal control id (e.g. 'pci-uar-user-access-reviews'), as returned by search_controls."
    ),
};

const schema = z.object(getEvidenceRequirementsInputShape);

export async function getEvidenceRequirementsHandler(rawArgs: unknown) {
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

  const control = getControlById(parsed.data.controlId);
  if (!control) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `No control found with id "${parsed.data.controlId}". Use search_controls to find a valid id first.`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            controlId: control.id,
            title: control.title,
            evidenceRequested: control.evidenceRequested,
            evidenceQualityCriteria: control.evidenceQualityCriteria,
            commonEvidenceGaps: control.commonEvidenceGaps,
            suggestedEvidenceOwner: control.controlOwner,
            supportingStakeholders: control.supportingStakeholders,
            recommendedReviewFrequency: control.recommendedReviewFrequency,
          },
          null,
          2
        ),
      },
    ],
  };
}
