import { z } from "zod";
import { getControlById } from "../controlsRepository.js";

export const compareControlsInputShape = {
  controlIds: z
    .array(z.string().min(1))
    .min(2)
    .max(5)
    .describe("Two to five internal control ids to compare, from search_controls."),
};

const schema = z.object(compareControlsInputShape);

export async function compareControlsHandler(rawArgs: unknown) {
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

  const controls = parsed.data.controlIds.map((id) => ({
    id,
    control: getControlById(id),
  }));

  const missing = controls.filter((c) => !c.control).map((c) => c.id);
  if (missing.length > 0) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `No control found for these ids: ${missing.join(", ")}. Use search_controls to find valid ids first.`,
        },
      ],
    };
  }

  const found = controls.map((c) => c.control!);

  const sharedTopic = found.every((c) => c.topic === found[0].topic);
  const sharedFramework = found.every(
    (c) => c.framework === found[0].framework
  );
  const relatedPairs: string[] = [];
  for (let i = 0; i < found.length; i++) {
    for (let j = i + 1; j < found.length; j++) {
      if (found[i].relatedControlIds.includes(found[j].id)) {
        relatedPairs.push(`${found[i].id} <-> ${found[j].id}`);
      }
    }
  }

  const comparison = found.map((c) => ({
    id: c.id,
    framework: c.framework,
    controlId: c.controlId,
    title: c.title,
    topic: c.topic,
    riskSeverity: c.riskSeverity,
    controlOwner: c.controlOwner,
    recommendedReviewFrequency: c.recommendedReviewFrequency,
    evidenceItemCount: c.evidenceRequested.length,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            comparison,
            observations: {
              shareSameTopic: sharedTopic,
              shareSameFramework: sharedFramework,
              explicitlyRelatedPairs: relatedPairs,
            },
            disclaimer:
              "This comparison highlights similarities and differences for educational purposes. It does not claim these controls are legally or formally equivalent across frameworks.",
          },
          null,
          2
        ),
      },
    ],
  };
}
