import type {
  Aspect,
  CaptionCue,
  Clip,
  ContentItem,
  ExportPackage,
  Platform,
  ReasonType,
  SeoPackage,
  Status,
  ViralMoment,
  YoutubeSource,
} from "./types";

type Row = Record<string, unknown>;

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string" && v !== "") return Number(v);
  return 0;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function dateStr(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  return s.slice(0, 10);
}

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? new Date().toISOString());
}

function json<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "object") return v as T;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function mapContentItem(row: Row): ContentItem {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    title: str(row.title),
    platform: str(row.platform) as Platform,
    status: str(row.status) as Status,
    scheduledAt: dateStr(row.scheduled_at),
    publishedAt: dateStr(row.published_at),
    notes: str(row.notes),
    views: num(row.views),
    likes: num(row.likes),
    comments: num(row.comments),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapSource(row: Row): YoutubeSource {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    youtubeUrl: str(row.youtube_url),
    youtubeId: str(row.youtube_id),
    title: str(row.title),
    durationSec: num(row.duration_sec),
    thumbnailUrl: row.thumbnail_url == null ? null : str(row.thumbnail_url),
    channelTitle: row.channel_title == null ? null : str(row.channel_title),
    createdAt: iso(row.created_at),
  };
}

export function mapMoment(row: Row): ViralMoment {
  return {
    id: str(row.id),
    sourceId: str(row.source_id),
    userId: str(row.user_id),
    startSec: num(row.start_sec),
    endSec: num(row.end_sec),
    score: num(row.score),
    reasonType: str(row.reason_type) as ReasonType,
    reasonText: str(row.reason_text),
    rank: num(row.rank),
  };
}

export function mapClip(row: Row, source?: YoutubeSource): Clip {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    sourceId: str(row.source_id),
    momentId: row.moment_id == null ? null : str(row.moment_id),
    title: str(row.title),
    inSec: num(row.in_sec),
    outSec: num(row.out_sec),
    aspect: str(row.aspect) as Aspect,
    captions: json<CaptionCue[]>(row.captions_json, []),
    seo: json<SeoPackage>(row.seo_json, {
      shorts: { seoTitle: "", caption: "", description: "", tags: [] },
      reels: { seoTitle: "", caption: "", description: "", tags: [] },
      tiktok: { seoTitle: "", caption: "", description: "", tags: [] },
    }),
    exportPackage: json<ExportPackage>(row.export_json, {
      fileName: "clip.mp4",
      mediaStatus: "preview",
      note: "",
      editDecisionList: {
        youtubeId: "",
        youtubeUrl: "",
        inSec: 0,
        outSec: 0,
        aspect: "9:16",
        captions: [],
      },
      generatedAt: new Date().toISOString(),
    }),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    source,
  };
}
