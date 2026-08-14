"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

const SUGGESTED_QUESTIONS = [
  "What evidence should I collect?",
  "Who normally owns this evidence?",
  "What makes evidence reliable?",
  "What should I ask the control owner?",
];

export function AiAssistantPanel({
  controlId,
  controlTitle,
}: {
  controlId: string;
  controlTitle: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;

    setError(null);
    const userMessage: ChatMessage = { role: "user", content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlId,
          question,
          history: messages, // history BEFORE this question
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        // Roll back the optimistic user message so the chat isn't left
        // showing a question with no answer and no visible error context.
        setMessages(messages);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
    } catch {
      setError("Could not reach the AI assistant. Check your connection and try again.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-navy/10 bg-white p-4 flex flex-col max-h-[520px]">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-semibold text-navy">AI Assistant</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-teal bg-teal/10 rounded px-1.5 py-0.5">
          Beta
        </span>
      </div>
      <p className="text-xs text-navy/50 mb-3">
        Answers are AI-generated using this control&apos;s data. Not a
        compliance determination.
      </p>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[80px]">
        {messages.length === 0 && !loading && (
          <div className="text-xs text-navy/50 space-y-2">
            <p>Ask a question about {controlTitle}, or try:</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuestion(q)}
                  className="text-left text-teal hover:underline"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block rounded-lg px-3 py-2 text-sm max-w-[90%] whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-navy text-white"
                  : "bg-navy/5 text-navy"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && (
              <p className="text-[10px] text-navy/40 mt-0.5">AI-generated guidance</p>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block rounded-lg px-3 py-2 text-sm bg-navy/5 text-navy/50 italic">
              Thinking…
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-status-significant/30 bg-status-significant/5 text-status-significant text-xs px-3 py-2"
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(input);
        }}
        className="flex gap-2"
      >
        <label htmlFor="ai-question" className="sr-only">
          Ask a question about this control
        </label>
        <input
          id="ai-question"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          maxLength={2000}
          disabled={loading}
          className="flex-1 rounded-md border border-navy/20 px-3 py-2 text-sm text-navy focus:border-teal focus:ring-1 focus:ring-teal disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-navy hover:bg-teal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
