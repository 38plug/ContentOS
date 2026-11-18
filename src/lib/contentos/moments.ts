import { uid } from "@/lib/id";
import type { ReasonType, ViralMoment } from "./types";

type MomentDraft = {
  startSec: number;
  endSec: number;
  score: number;
  reasonType: ReasonType;
  reasonText: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function windowAround(center: number, length: number, duration: number): { start: number; end: number } {
  const half = length / 2;
  let start = center - half;
  let end = center + half;
  if (start < 0) {
    end = Math.min(duration, end - start);
    start = 0;
  }
  if (end > duration) {
    start = Math.max(0, start - (end - duration));
    end = duration;
  }
  return { start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10 };
}

/** Heuristic viral-moment candidates when xAI is unavailable or as a baseline. */
export function heuristicMoments(durationSec: number, title: string): MomentDraft[] {
  const duration = Math.max(20, durationSec);
  const clipLen = clamp(Math.round(duration * (duration < 60 ? 0.35 : 0.08)), Math.min(12, duration - 2), Math.min(45, Math.max(12, duration - 1)));
  const titleHint = title.toLowerCase();

  const hookCenter = clamp(duration * 0.04 + 8, 8, Math.max(12, duration * 0.12));
  const peakCenter = clamp(duration * 0.32, clipLen, duration - clipLen);
  const punchCenter = clamp(duration * 0.62, clipLen, duration - clipLen);
  const ctaCenter = clamp(duration - clipLen * 0.55, clipLen, duration - 6);

  const hook = windowAround(hookCenter, clipLen, duration);
  const peak = windowAround(peakCenter, clipLen * 1.05, duration);
  const punch = windowAround(punchCenter, clipLen, duration);
  const cta = windowAround(ctaCenter, Math.min(clipLen, 32), duration);

  const topic =
    titleHint.includes(" ")
      ? title.split(/[-|:–—]/)[0]?.trim() || title
      : title;

  const drafts: MomentDraft[] = [
    {
      startSec: hook.start,
      endSec: hook.end,
      score: 0.92,
      reasonType: "hook",
      reasonText: `Cold open that frames “${topic.slice(0, 48)}” in under ${Math.round(hook.end - hook.start)}s — strong scroll-stopper.`,
    },
    {
      startSec: peak.start,
      endSec: peak.end,
      score: 0.88,
      reasonType: "peak_energy",
      reasonText: "Highest energy beat in the first third — pacing and emphasis suggest shareable intensity.",
    },
    {
      startSec: punch.start,
      endSec: punch.end,
      score: 0.84,
      reasonType: "punchline",
      reasonText: "Payoff / reveal window where the argument lands — ideal for mid-feed retention.",
    },
    {
      startSec: cta.start,
      endSec: cta.end,
      score: 0.76,
      reasonType: "cta",
      reasonText: "Closing ask with context already earned — convert viewers who watched this far.",
    },
  ];
  return drafts.sort((a, b) => b.score - a.score);
}

export function draftsToMoments(
  drafts: MomentDraft[],
  sourceId: string,
  userId: string,
): Omit<ViralMoment, never>[] {
  return drafts.map((d, i) => ({
    id: uid("moment"),
    sourceId,
    userId,
    startSec: d.startSec,
    endSec: d.endSec,
    score: d.score,
    reasonType: d.reasonType,
    reasonText: d.reasonText,
    rank: i + 1,
  }));
}

export function defaultCaptions(inSec: number, outSec: number, title: string) {
  const span = Math.max(4, outSec - inSec);
  const mid = inSec + span / 2;
  return [
    {
      id: uid("cue"),
      startSec: inSec,
      endSec: Math.min(outSec, inSec + Math.min(4, span * 0.35)),
      text: title.slice(0, 64) || "Watch this",
    },
    {
      id: uid("cue"),
      startSec: mid - 1.5,
      endSec: Math.min(outSec, mid + 2.5),
      text: "The moment that changes the take",
    },
    {
      id: uid("cue"),
      startSec: Math.max(inSec, outSec - Math.min(5, span * 0.3)),
      endSec: outSec,
      text: "Save this · follow for more",
    },
  ];
}
