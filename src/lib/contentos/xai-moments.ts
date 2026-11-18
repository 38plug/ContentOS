import type { ReasonType } from "./types";

export type MomentDraft = {
  startSec: number;
  endSec: number;
  score: number;
  reasonType: ReasonType;
  reasonText: string;
};

function apiKey() {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY || "";
}

/** Optionally rewrite heuristic moment reasons with xAI when a key is available. */
export async function enhanceMomentReasons(
  title: string,
  channelTitle: string | null,
  durationSec: number,
  drafts: MomentDraft[],
): Promise<MomentDraft[]> {
  const key = apiKey();
  if (!key || drafts.length === 0) return drafts;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "You refine viral-moment reasons for short-form clipping. Reply ONLY with JSON array matching input order: [{score:0-1, reasonText:string}]. Keep reasonType windows; improve copy. No markdown.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title,
              channelTitle,
              durationSec,
              moments: drafts.map((d) => ({
                startSec: d.startSec,
                endSec: d.endSec,
                score: d.score,
                reasonType: d.reasonType,
                reasonText: d.reasonText,
              })),
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return drafts;
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return drafts;
    const parsed = JSON.parse(match[0]) as Array<{ score?: number; reasonText?: string }>;
    if (!Array.isArray(parsed) || parsed.length !== drafts.length) return drafts;
    return drafts.map((d, i) => ({
      ...d,
      score:
        typeof parsed[i]?.score === "number"
          ? Math.min(0.99, Math.max(0.5, Number(parsed[i]!.score)))
          : d.score,
      reasonText:
        typeof parsed[i]?.reasonText === "string" && parsed[i]!.reasonText!.trim()
          ? parsed[i]!.reasonText!.trim().slice(0, 280)
          : d.reasonText,
    }));
  } catch {
    return drafts;
  }
}
