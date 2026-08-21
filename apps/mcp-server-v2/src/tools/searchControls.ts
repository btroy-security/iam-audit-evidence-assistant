import { z } from "zod";
import { searchControls, getFrameworks, getTopics } from "../controlsRepository.js";

export const searchControlsInputShape = {
  framework: z
    .string()
    .optional()
    .describe(
      "Exact framework name to filter by, e.g. 'NIST SP 800-53'. Omit to search all frameworks."
    ),
  topic: z
    .string()
    .optional()
    .describe(
      "Exact IAM topic to filter by, e.g. 'Multifactor authentication'. Omit to search all topics."
    ),
  keyword: z
    .string()
    .optional()
    .describe(
      "Free-text keyword to search titles, control IDs, descriptions, and common abbreviations (e.g. 'MFA', 'JML', 'SoD')."
    ),
};

const schema = z.object(searchControlsInputShape);

export async function searchControlsHandler(rawArgs: unknown) {
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
  const { framework, topic, keyword } = parsed.data;

  if (framework) {
    const validFrameworks = getFrameworks();
    if (!validFrameworks.includes(framework)) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Unknown framework "${framework}". Valid frameworks are: ${validFrameworks.join(", ")}.`,
          },
        ],
      };
    }
  }

  if (topic) {
    const validTopics = getTopics();
    if (!validTopics.includes(topic)) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Unknown topic "${topic}". Valid topics are: ${validTopics.join(", ")}.`,
          },
        ],
      };
    }
  }

  const results = searchControls({ framework, topic, keyword });

  const summary = results.map((c) => ({
    id: c.id,
    framework: c.framework,
    controlId: c.controlId,
    controlIdVerified: c.controlIdVerified,
    title: c.title,
    topic: c.topic,
    riskSeverity: c.riskSeverity,
    plainLanguageExplanation: c.plainLanguageExplanation,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            matchCount: results.length,
            results: summary,
          },
          null,
          2
        ),
      },
    ],
  };
}
