import { z } from "zod";
import { getAllControls, getFrameworks } from "../controlsRepository.js";

export const listFrameworksInputShape = {};

export async function listFrameworksHandler() {
  const frameworks = getFrameworks();
  const controls = getAllControls();

  const summary = frameworks.map((framework) => {
    const inFramework = controls.filter((c) => c.framework === framework);
    return {
      framework,
      controlCount: inFramework.length,
      topics: Array.from(new Set(inFramework.map((c) => c.topic))),
    };
  });

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            frameworkCount: frameworks.length,
            totalControls: controls.length,
            frameworks: summary,
          },
          null,
          2
        ),
      },
    ],
  };
}
