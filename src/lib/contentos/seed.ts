import { uid } from "@/lib/id";
import { defaultCaptions, draftsToMoments, heuristicMoments } from "./moments";
import { buildSeoPackage, suggestedFileName } from "./seo";
import type { Aspect, ContentItem } from "./types";

export const DEMO_YOUTUBE = {
  youtubeId: "jNQXAC9IVRw",
  youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  title: "Me at the zoo",
  durationSec: 19,
  thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
  channelTitle: "jawed",
};

export function demoContentItems(userId: string): ContentItem[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: uid("post"),
      userId,
      title: "3 hooks that stop the scroll in 2 seconds",
      platform: "shorts",
      status: "published",
      scheduledAt: null,
      publishedAt: day(-4),
      notes: "Lead with pattern interrupt. Clip performed above baseline.",
      views: 128400,
      likes: 9420,
      comments: 611,
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      id: uid("post"),
      userId,
      title: "Studio lighting checklist (creator desk)",
      platform: "instagram",
      status: "scheduled",
      scheduledAt: day(2),
      publishedAt: null,
      notes: "Pair with B-roll of key light + softbox.",
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      id: uid("post"),
      userId,
      title: "Why your CTAs feel invisible",
      platform: "tiktok",
      status: "draft",
      scheduledAt: null,
      publishedAt: null,
      notes: "Need punchier end card. Waiting on voiceover take 2.",
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      id: uid("post"),
      userId,
      title: "Long-form teardown: retention cliffs",
      platform: "youtube",
      status: "idea",
      scheduledAt: null,
      publishedAt: null,
      notes: "Source for clipping suite — analyze after publish.",
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: iso(now),
      updatedAt: iso(now),
    },
  ];
}

export async function buildDemoClipBundle(userId: string) {
  const sourceId = uid("yt");
  const moments = draftsToMoments(
    heuristicMoments(DEMO_YOUTUBE.durationSec, DEMO_YOUTUBE.title),
    sourceId,
    userId,
  );
  const top = moments[0]!;
  const aspect: Aspect = "9:16";
  const captions = defaultCaptions(top.startSec, top.endSec, DEMO_YOUTUBE.title);
  const seo = await buildSeoPackage(DEMO_YOUTUBE.title, top.reasonText, DEMO_YOUTUBE.channelTitle);
  const clipId = uid("clip");
  const exportPackage = {
    fileName: suggestedFileName(DEMO_YOUTUBE.title, aspect, top.startSec, top.endSec),
    mediaStatus: "preview" as const,
    note: "Browser preview + edit decision list. Cloud render ships in phase 2.",
    editDecisionList: {
      youtubeId: DEMO_YOUTUBE.youtubeId,
      youtubeUrl: DEMO_YOUTUBE.youtubeUrl,
      inSec: top.startSec,
      outSec: top.endSec,
      aspect,
      captions,
    },
    generatedAt: new Date().toISOString(),
  };

  return {
    source: {
      id: sourceId,
      userId,
      ...DEMO_YOUTUBE,
    },
    moments,
    clip: {
      id: clipId,
      userId,
      sourceId,
      momentId: top.id,
      title: `${DEMO_YOUTUBE.title} — ${top.reasonType.replace("_", " ")}`,
      inSec: top.startSec,
      outSec: top.endSec,
      aspect,
      captions,
      seo,
      exportPackage,
    },
  };
}
