import { NextRequest, NextResponse } from "next/server";
import { getControlById } from "@/lib/controls";
import { askAssistant } from "@/lib/ai-provider";
import type { AiAssistantRequest, ChatMessage } from "@/lib/types";

// Basic request-size guardrails (spec requirement: reasonable request-size limits)
const MAX_QUESTION_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

export async function POST(req: NextRequest) {
  let body: Partial<AiAssistantRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { controlId, question, history } = body;

  // --- Input validation ---
  if (typeof controlId !== "string" || !controlId.trim()) {
    return NextResponse.json(
      { error: "controlId is required." },
      { status: 400 }
    );
  }

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: "question is required." },
      { status: 400 }
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `question must be ${MAX_QUESTION_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  let safeHistory: ChatMessage[] = [];
  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: "history must be an array." },
        { status: 400 }
      );
    }
    if (history.length > MAX_HISTORY_MESSAGES) {
      return NextResponse.json(
        { error: `history is limited to ${MAX_HISTORY_MESSAGES} messages.` },
        { status: 400 }
      );
    }
    for (const m of history) {
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string" ||
        m.content.length > MAX_HISTORY_MESSAGE_LENGTH
      ) {
        return NextResponse.json(
          { error: "history contains an invalid message." },
          { status: 400 }
        );
      }
    }
    safeHistory = history as ChatMessage[];
  }

  // --- Look up the control (the AI is never the sole source of facts) ---
  const control = getControlById(controlId);
  if (!control) {
    return NextResponse.json(
      { error: `No control found with id "${controlId}".` },
      { status: 404 }
    );
  }

  // --- Call the AI provider ---
  try {
    const { answer } = await askAssistant({
      control,
      question,
      history: safeHistory,
    });

    return NextResponse.json({
      answer,
      aiGenerated: true,
      controlId: control.id,
    });
  } catch (err) {
    // Never leak internal error details (e.g. API key hints) to the client.
    const isConfigError =
      err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");

    console.error("[/api/ai] AI provider error:", err);

    return NextResponse.json(
      {
        error: isConfigError
          ? "The AI assistant is not configured yet. An ANTHROPIC_API_KEY must be set on the server."
          : "The AI assistant is temporarily unavailable. Please try again.",
      },
      { status: isConfigError ? 500 : 502 }
    );
  }
}
