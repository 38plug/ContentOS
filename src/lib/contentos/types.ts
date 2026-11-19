export const PLATFORMS = [
  "youtube",
  "shorts",
  "instagram",
  "tiktok",
  "x",
  "linkedin",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const STATUSES = ["idea", "draft", "scheduled", "published", "archived"] as const;
export type Status = (typeof STATUSES)[number];

export const ASPECTS = ["9:16", "1:1", "16:9"] as const;
export type Aspect = (typeof ASPECTS)[number];

export const REASON_TYPES = ["hook", "peak_energy", "punchline", "cta"] as const;
export type ReasonType = (typeof REASON_TYPES)[number];

export type DashboardStats = {
  posts: number;
  published: number;
  drafts: number;
  clips: number;
  totalViews: number;
};

export type ContentItem = {
  id: string;
  userId: string;
  title: string;
  platform: Platform;
  status: Status;
  scheduledAt: string | null;
  publishedAt: string | null;
  notes: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
};

export type YoutubeSource = {
  id: string;
  userId: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  durationSec: number;
  thumbnailUrl: string | null;
  channelTitle: string | null;
  createdAt: string;
};

export type ViralMoment = {
  id: string;
  sourceId: string;
  userId: string;
  startSec: number;
  endSec: number;
  score: number;
  reasonType: ReasonType;
  reasonText: string;
  rank: number;
};

export type CaptionCue = {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
};

export type SeoPackage = {
  shorts: PlatformCopy;
  reels: PlatformCopy;
  tiktok: PlatformCopy;
};

export type PlatformCopy = {
  seoTitle: string;
  caption: string;
  description: string;
  tags: string[];
};

export type ExportPackage = {
  fileName: string;
  mediaStatus: "preview" | "rendered";
  note: string;
  editDecisionList: {
    youtubeId: string;
    youtubeUrl: string;
    inSec: number;
    outSec: number;
    aspect: Aspect;
    captions: CaptionCue[];
  };
  generatedAt: string;
};

export type Clip = {
  id: string;
  userId: string;
  sourceId: string;
  momentId: string | null;
  title: string;
  inSec: number;
  outSec: number;
  aspect: Aspect;
  captions: CaptionCue[];
  seo: SeoPackage;
  exportPackage: ExportPackage;
  createdAt: string;
  updatedAt: string;
  source?: YoutubeSource;
};

export function platformLabel(platform: Platform): string {
  switch (platform) {
    case "youtube":
      return "YouTube";
    case "shorts":
      return "YouTube Shorts";
    case "instagram":
      return "Instagram Reels";
    case "tiktok":
      return "TikTok";
    case "x":
      return "X";
    case "linkedin":
      return "LinkedIn";
  }
}

export function statusLabel(status: Status): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function reasonLabel(type: ReasonType): string {
  switch (type) {
    case "hook":
      return "Hook";
    case "peak_energy":
      return "Peak energy";
    case "punchline":
      return "Punchline";
    case "cta":
      return "CTA";
  }
}

export function formatTimecode(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}
