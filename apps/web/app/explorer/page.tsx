"use client";

import { useMemo, useState } from "react";
import { getFrameworks, getTopics, searchControls } from "@/lib/controls";
import { ControlCard } from "@/components/ControlCard";

export default function ExplorerPage() {
  const frameworks = getFrameworks();
  const topics = getTopics();

  const [framework, setFramework] = useState("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");

  const results = useMemo(
    () => searchControls({ framework, topic, keyword }),
    [framework, topic, keyword]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-1">
          Control Explorer
        </h1>
        <p className="text-navy/70">
          Search or filter to find the IAM control you want to review.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-navy/10 rounded-lg p-4">
        <div>
          <label
            htmlFor="keyword"
            className="block text-sm font-medium text-navy mb-1"
          >
            Search by keyword, title, or control ID
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. MFA, AC-2, deprovisioning"
            className="w-full rounded-md border border-navy/20 px-3 py-2 text-navy focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>
        <div>
          <label
            htmlFor="framework"
            className="block text-sm font-medium text-navy mb-1"
          >
            Framework
          </label>
          <select
            id="framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full rounded-md border border-navy/20 px-3 py-2 text-navy focus:border-teal focus:ring-1 focus:ring-teal"
          >
            <option value="">All frameworks</option>
            {frameworks.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-navy mb-1"
          >
            IAM topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-md border border-navy/20 px-3 py-2 text-navy focus:border-teal focus:ring-1 focus:ring-teal"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-navy/60" role="status">
        {results.length} control{results.length !== 1 ? "s" : ""} found
      </p>

      {results.length === 0 ? (
        <div className="rounded-lg border border-navy/10 bg-white p-8 text-center text-navy/60">
          No controls match your filters. Try clearing the keyword or
          selecting a different framework/topic.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((control) => (
            <ControlCard key={control.id} control={control} />
          ))}
        </div>
      )}
    </div>
  );
}
