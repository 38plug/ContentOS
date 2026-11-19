import { uid } from "@/lib/id";
import type { CaptionCue } from "./types";

const FILLERS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "is",
  "are",
  "was",
  "be",
  "with",
  "that",
  "this",
  "it",
  "as",
  "at",
  "by",
  "from",
]);

function tokenize(text: string): string[] {
  return text
    .replace(/[“”]/g, '"')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function chunkWords(words: string[], size = 4): string[] {
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    lines.push(words.slice(i, i + size).join(" "));
  }
  return lines.filter(Boolean);
}

function punchLines(title: string, reasonText: string): string[] {
  const hook = title.split(/[-|:–—?¿!]/)[0]?.trim() || title;
  const reasonHook = reasonText.split(/[.—]/)[0]?.trim() || reasonText;
  const base = [
    ...tokenize(hook),
    ...tokenize(reasonHook)
      .filter((w) => !FILLERS.has(w.toLowerCase().replace(/[^a-z0-9']/gi, "")))
      .slice(0, 10),
  ];
  const lines = chunkWords(base.length ? base : tokenize(title || "Watch this"), 3);
  // Shorts cadence: open → tension → payoff → CTA
  const extras = ["Wait for it", "This part hits", "Save this", "Follow for more"];
  const merged = [...lines];
  for (const extra of extras) {
    if (merged.length >= 8) break;
    if (!merged.some((l) => l.toLowerCase() === extra.toLowerCase())) merged.push(extra);
  }
  return merged.slice(0, 10);
}

/**
 * Dense Shorts-style caption cues (2–4 words, rapid beats) — free, no ASR API.
 * Marks the last word with *...* so the UI can highlight it.
 */
export function buildShortsCaptions(
  inSec: number,
  outSec: number,
  title: string,
  reasonText = "",
): CaptionCue[] {
  const span = Math.max(4, outSec - inSec);
  const lines = punchLines(title, reasonText);
  const beat = Math.max(1.15, Math.min(2.6, span / Math.max(lines.length, 1)));
  const cues: CaptionCue[] = [];
  let t = inSec;
  for (const line of lines) {
    if (t >= outSec - 0.35) break;
    const words = tokenize(line);
    const marked =
      words.length <= 1
        ? `*${words[0] ?? line}*`
        : `${words.slice(0, -1).join(" ")} *${words[words.length - 1]}*`;
    const end = Math.min(outSec, t + beat);
    cues.push({
      id: uid("cue"),
      startSec: round2(t),
      endSec: round2(end),
      text: marked,
    });
    t = end + 0.08;
  }
  if (!cues.length) {
    cues.push({
      id: uid("cue"),
      startSec: inSec,
      endSec: outSec,
      text: `*${(title || "Watch this").slice(0, 36)}*`,
    });
  }
  return cues;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Parse `plain *highlight*` caption markup into segments. */
export function parseCaptionMarkup(text: string): { text: string; hot: boolean }[] {
  const parts: { text: string; hot: boolean }[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), hot: false });
    parts.push({ text: match[1]!, hot: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hot: false });
  if (!parts.length) parts.push({ text, hot: false });
  return parts;
}

export function captionsToVtt(cues: CaptionCue[], title: string): string {
  const lines = ["WEBVTT", "", `NOTE ContentOS Shorts captions — ${title}`, ""];
  cues.forEach((cue, i) => {
    lines.push(String(i + 1));
    lines.push(`${toVttTime(cue.startSec)} --> ${toVttTime(cue.endSec)}`);
    lines.push(cue.text.replace(/\*/g, ""));
    lines.push("");
  });
  return lines.join("\n");
}

function toVttTime(sec: number): string {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  const whole = Math.floor(rem);
  const ms = Math.round((rem - whole) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(whole)}.${pad(ms, 3)}`;
}
