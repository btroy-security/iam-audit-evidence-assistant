import { z } from "zod";
import { getControlById, getRelatedControls } from "../controlsRepository.js";

export const getControlDetailsInputShape = {
  controlId: z
    .string()
    .min(1)
    .describe(
      "The internal control id (e.g. 'nist-ia2-mfa'), as returned by search_controls or list_frameworks."
    ),
};

const schema = z.object(getControlDetailsInputShape);

export async function getControlDetailsHandler(rawArgs: unknown) {
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

  const related = getRelatedControls(control).map((c) => ({
    id: c.id,
    title: c.title,
    framework: c.framework,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ ...control, relatedControls: related }, null, 2),
      },
    ],
  };
}
