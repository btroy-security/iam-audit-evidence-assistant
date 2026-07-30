import controlsData from "@/data/controls.json";
import type { ControlRecord } from "@/lib/types";

const controls = controlsData as ControlRecord[];

export function getAllControls(): ControlRecord[] {
  return controls;
}

export function getControlById(id: string): ControlRecord | undefined {
  return controls.find((c) => c.id === id);
}

export function getFrameworks(): string[] {
  return Array.from(new Set(controls.map((c) => c.framework)));
}

export function getTopics(): string[] {
  return Array.from(new Set(controls.map((c) => c.topic)));
}

export interface SearchOptions {
  framework?: string;
  topic?: string;
  keyword?: string;
}

export function searchControls(options: SearchOptions): ControlRecord[] {
  const { framework, topic, keyword } = options;
  const kw = keyword?.trim().toLowerCase();

  return controls.filter((c) => {
    if (framework && c.framework !== framework) return false;
    if (topic && c.topic !== topic) return false;
    if (kw) {
      const haystack = `${c.controlId} ${c.title} ${c.topic} ${c.plainLanguageExplanation} ${(c.searchKeywords ?? []).join(" ")}`.toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });
}

export function getRelatedControls(control: ControlRecord): ControlRecord[] {
  return control.relatedControlIds
    .map((id) => getControlById(id))
    .filter((c): c is ControlRecord => Boolean(c));
}
