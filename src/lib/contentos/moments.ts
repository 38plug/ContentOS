import { uid } from "@/lib/id";
import type { ReasonType, ViralMoment } from "./types";
import type { YoutubeChapter } from "./youtube";

export type MomentDraft = {
  startSec: number;
  endSec: number;
  score: number;
  reasonType: ReasonType;
  reasonText: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Short-form sweet spot: tight enough for Shorts/Reels/TikTok. */
export function viralClipLength(durationSec: number): number {
  const duration = Math.max(1, durationSec);
  if (duration <= 16) return Math.max(6, duration - 0.5);
  if (duration <= 35) return Math.min(28, Math.round(duration * 0.85));
  if (duration <= 75) return 22;
  if (duration <= 180) return 28;
  if (duration <= 600) return 32;
  return 35;
}

/** Start-aligned window — viral clips begin ON the beat, not centered mid-beat. */
function windowFrom(startSec: number, length: number, duration: number): { start: number; end: number } {
  const maxStart = Math.max(0, duration - Math.min(length, duration));
  let start = clamp(startSec, 0, maxStart);
  let end = Math.min(duration, start + length);
  if (end - start < Math.min(6, duration * 0.5)) {
    end = Math.min(duration, start + Math.min(length, duration));
    start = Math.max(0, end - Math.min(length, duration));
  }
  return { start: round1(start), end: round1(end) };
}

const HOOK_WORDS = [
  "secret",
  "mistake",
  "hack",
  "tip",
  "how",
  "why",
  "vs",
  "reaction",
  "shock",
  "crazy",
  "fail",
  "win",
  "truth",
  "never",
  "stop",
  "watch",
  "before",
  "after",
];

function topicFromTitle(title: string): string {
  const cut = title.split(/[-|:–—]/)[0]?.trim() || title;
  return cut.slice(0, 52);
}

function titleBoost(text: string): number {
  const lower = text.toLowerCase();
  let boost = 0;
  for (const word of HOOK_WORDS) {
    if (lower.includes(word)) boost += 0.03;
  }
  return Math.min(0.12, boost);
}

function overlaps(a: MomentDraft, b: MomentDraft): boolean {
  const overlap = Math.min(a.endSec, b.endSec) - Math.max(a.startSec, b.startSec);
  if (overlap <= 0) return false;
  const shorter = Math.min(a.endSec - a.startSec, b.endSec - b.startSec);
  return overlap / shorter > 0.45;
}

function pushUnique(list: MomentDraft[], next: MomentDraft) {
  if (next.endSec - next.startSec < 5) return;
  if (list.some((m) => overlaps(m, next))) {
    const idx = list.findIndex((m) => overlaps(m, next));
    if (idx >= 0 && next.score > list[idx]!.score) list[idx] = next;
    return;
  }
  list.push(next);
}

/**
 * Free built-in viral-moment candidates.
 * Prefers Shorts-length, start-aligned cuts; uses chapters when YouTube provides them.
 */
export function heuristicMoments(
  durationSec: number,
  title: string,
  chapters: YoutubeChapter[] = [],
): MomentDraft[] {
  const duration = Math.max(8, durationSec);
  const clipLen = viralClipLength(duration);
  const topic = topicFromTitle(title);
  const boost = titleBoost(title);
  const drafts: MomentDraft[] = [];

  // 1) Cold open / scroll-stopper — start at 0 (or tiny lead-in), not mid-intro.
  const hookStart = duration > 90 ? 0.5 : 0;
  const hook = windowFrom(hookStart, clipLen, duration);
  pushUnique(drafts, {
    startSec: hook.start,
    endSec: hook.end,
    score: clamp(0.94 + boost, 0.5, 0.99),
    reasonType: "hook",
    reasonText: `Cold-open clip on “${topic}” — ${Math.round(hook.end - hook.start)}s scroll-stopper starting at the first beat.`,
  });

  // 2) Chapter-driven cuts (real structure beats blind percentages).
  const usableChapters = chapters
    .filter((c) => c.startSec >= 0 && c.startSec < duration - 5)
    .slice(0, 12);
  for (const [i, chapter] of usableChapters.entries()) {
    const nextStart = usableChapters[i + 1]?.startSec ?? duration;
    const chapterSpan = Math.max(8, nextStart - chapter.startSec);
    const len = clamp(Math.min(clipLen, chapterSpan - 0.5), 12, Math.min(45, duration));
    const win = windowFrom(chapter.startSec, len, duration);
    const chapterBoost = titleBoost(chapter.title);
    const isLate = chapter.startSec > duration * 0.7;
    pushUnique(drafts, {
      startSec: win.start,
      endSec: win.end,
      score: clamp((isLate ? 0.78 : 0.9) + chapterBoost + boost * 0.5, 0.55, 0.98),
      reasonType: isLate ? "cta" : chapterBoost > 0 ? "punchline" : "peak_energy",
      reasonText: `Chapter “${chapter.title.slice(0, 64)}” — cut from the marker for a clean ${Math.round(win.end - win.start)}s short.`,
    });
  }

  // 3) Pattern beats when chapters are sparse — still start-aligned, Shorts length.
  if (usableChapters.length < 2) {
    if (duration > clipLen + 8) {
      const peakStart = clamp(duration * 0.28, 0, duration - clipLen);
      const peak = windowFrom(peakStart, clipLen, duration);
      pushUnique(drafts, {
        startSec: peak.start,
        endSec: peak.end,
        score: clamp(0.88 + boost, 0.55, 0.97),
        reasonType: "peak_energy",
        reasonText: `First-third energy window — ${Math.round(peak.end - peak.start)}s vertical cut where pacing usually spikes.`,
      });
    }

    if (duration > clipLen * 2) {
      const punchStart = clamp(duration * 0.55, clipLen * 0.5, duration - clipLen);
      const punch = windowFrom(punchStart, clipLen, duration);
      pushUnique(drafts, {
        startSec: punch.start,
        endSec: punch.end,
        score: clamp(0.84 + boost, 0.55, 0.96),
        reasonType: "punchline",
        reasonText: `Payoff / reveal cut — lands the argument in a ${Math.round(punch.end - punch.start)}s shareable package.`,
      });
    }

    if (duration > clipLen + 20) {
      const ctaStart = clamp(duration - clipLen - 2, 0, duration - Math.min(clipLen, 28));
      const cta = windowFrom(ctaStart, Math.min(clipLen, 28), duration);
      pushUnique(drafts, {
        startSec: cta.start,
        endSec: cta.end,
        score: clamp(0.74 + boost * 0.3, 0.5, 0.9),
        reasonType: "cta",
        reasonText: `Closing beat with context earned — ${Math.round(cta.end - cta.start)}s ask for follows/saves.`,
      });
    }
  }

  // 4) Ultra-short source: offer the whole usable span as one primary clip.
  if (duration <= 45) {
    const whole = windowFrom(0, Math.max(6, duration - 0.25), duration);
    pushUnique(drafts, {
      startSec: whole.start,
      endSec: whole.end,
      score: 0.96,
      reasonType: "hook",
      reasonText: `Full short-form package — source is already ${Math.round(duration)}s; ship nearly the whole take.`,
    });
  }

  return drafts.sort((a, b) => b.score - a.score).slice(0, 6);
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
  const hook = title.split(/[-|:–—]/)[0]?.trim().slice(0, 48) || "Watch this";
  return [
    {
      id: uid("cue"),
      startSec: inSec,
      endSec: Math.min(outSec, inSec + Math.min(3.2, span * 0.28)),
      text: hook,
    },
    {
      id: uid("cue"),
      startSec: mid - 1.2,
      endSec: Math.min(outSec, mid + 2.2),
      text: "This is the part people replay",
    },
    {
      id: uid("cue"),
      startSec: Math.max(inSec, outSec - Math.min(4.5, span * 0.28)),
      endSec: outSec,
      text: "Follow for the next cut",
    },
  ];
}
