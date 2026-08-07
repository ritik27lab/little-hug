import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

export interface ParsedAgendaActivity {
  time: string | null;
  label: string;
}

export interface ParsedAgendaDay {
  date: string; // ISO date, YYYY-MM-DD
  meals: string[];
  naps: string[];
  activities: ParsedAgendaActivity[];
  notes: string[];
}

export interface ParsedAgenda {
  detectedLanguage: string | null;
  days: ParsedAgendaDay[];
}

const SYSTEM_PROMPT = `You read photographs of paper or whiteboard daycare/crèche agendas and
convert them into structured JSON describing each day covered by the agenda.

Rules:
- Respond with ONLY valid JSON matching the schema below. No prose, no markdown fences.
- If the agenda doesn't specify a year, assume the current year given in the user message.
- "date" must be an ISO date string (YYYY-MM-DD). If a day's date can't be determined, omit that day entirely.
- Keep meals/naps/activities/notes as short, faithful phrases from the source — do not invent details that aren't legible.
- "time" on an activity should be 24-hour HH:mm if shown, otherwise null.
- If the photo is unreadable, blurry, or not an agenda at all, respond with exactly: {"error": "unreadable_image"}

Schema:
{
  "detectedLanguage": string | null,   // ISO 639-1 code, e.g. "fr", "nl", "en"
  "days": [
    {
      "date": string,
      "meals": string[],
      "naps": string[],
      "activities": [{ "time": string | null, "label": string }],
      "notes": string[]
    }
  ]
}`;

function mediaTypeFromMime(mime: string): "image/jpeg" | "image/png" | "image/webp" {
  if (mime === "image/png") return "image/png";
  if (mime === "image/webp") return "image/webp";
  return "image/jpeg";
}

export async function parseAgendaImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ParsedAgenda> {
  const base64 = imageBuffer.toString("base64");
  const today = new Date().toISOString().slice(0, 10);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaTypeFromMime(mimeType),
              data: base64,
            },
          },
          {
            type: "text",
            text: `Today's date is ${today}. Parse this daycare agenda photo into the JSON schema you were given.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw ApiError.unprocessable("The agenda scan returned no readable content", "unreadable_image");
  }

  let parsed: { error?: string } & Partial<ParsedAgenda>;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw ApiError.unprocessable("Could not parse the agenda scan result", "unreadable_image");
  }

  if (parsed.error === "unreadable_image" || !parsed.days) {
    throw ApiError.unprocessable("The agenda photo wasn't readable — try a clearer, well-lit shot.", "unreadable_image");
  }

  return {
    detectedLanguage: parsed.detectedLanguage ?? null,
    days: parsed.days,
  };
}
