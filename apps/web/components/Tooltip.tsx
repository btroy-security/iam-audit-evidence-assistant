"use client";

import { useState } from "react";

export function Tooltip({
  term,
  explanation,
}: {
  term: string;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="underline decoration-dotted decoration-teal underline-offset-2 text-navy font-medium"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {term}
        <span className="sr-only"> (definition available)</span>
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-10 left-0 top-full mt-1 w-64 rounded-md border border-navy/10 bg-white p-3 text-sm text-navy shadow-lg"
        >
          {explanation}
        </span>
      )}
    </span>
  );
}
