import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const RETRY_DELAYS_MS = [400, 900];
const CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("503 Service Unavailable") ||
    message.includes("429 Too Many Requests") ||
    message.toLowerCase().includes("high demand")
  );
}

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  prompt: string
): Promise<string> {
  let lastError: unknown = null;

  for (const modelName of CANDIDATE_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (error) {
        lastError = error;
        const shouldRetry = isRetryableGeminiError(error);
        const hasMoreAttempts = attempt < RETRY_DELAYS_MS.length;
        if (!shouldRetry || !hasMoreAttempts) break;
        await wait(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed after retries.");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: ChatMessage[];
    };
    const message = (body.message ?? "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const recentHistory = history.slice(-10);
    const transcript = recentHistory
      .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
      .join("\n");

    const prompt = `You are Orbit Assistant, the in-app AI helper for the Orbit.r hobbyist social app.

Your job:
- Help users discover hubs, write better posts, brainstorm hobby ideas, and stay engaged.
- Be concise, practical, and friendly.
- Keep answers to 2-5 sentences unless the user asks for depth.
- If asked about unsafe/illegal content, refuse briefly and redirect to safe alternatives.

App context:
- Main sections: timeline, orbit, discover, alerts, profile.
- Users join hubs by hobbies (gaming, fitness, technology, movies, photography, cooking, etc.).
- You can suggest actions users can do inside the app (join a hub, post a question, create a list, set a goal).

Conversation so far:
${transcript || "(no prior messages)"}

User's latest message:
${message}

Respond as Orbit Assistant only.`;

    const reply = await generateWithRetry(genAI, prompt);

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown chatbot error",
      },
      { status: 500 }
    );
  }
}
