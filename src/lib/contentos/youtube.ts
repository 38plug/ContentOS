const ID_PATTERNS = [
  /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/live\/)([A-Za-z0-9_-]{6,})/,
  /^([A-Za-z0-9_-]{11})$/,
];

/** Used when YouTube blocks player metadata (common in sandboxed egress). */
export const ESTIMATED_DURATION_SEC = 180;

export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  for (const pattern of ID_PATTERNS) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }
  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v && /^[A-Za-z0-9_-]{6,}$/.test(v)) return v;
  } catch {
    /* not a URL */
  }
  return null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export type YoutubeMeta = {
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  durationSec: number;
  thumbnailUrl: string;
  channelTitle: string | null;
  durationEstimated: boolean;
};

async function fetchOembed(url: string): Promise<{ title?: string; author_name?: string; thumbnail_url?: string } | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    return (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
  } catch {
    return null;
  }
}

function extractJsonObject(html: string, marker: string): Record<string, unknown> | null {
  const idx = html.indexOf(marker);
  if (idx < 0) return null;
  const start = html.indexOf("{", idx);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < html.length; i += 1) {
    const c = html[i];
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1)) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function fetchDurationSec(id: string): Promise<number | null> {
  try {
    const res = await fetch(youtubeWatchUrl(id), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const player = extractJsonObject(html, "ytInitialPlayerResponse");
    const details = player?.videoDetails as { lengthSeconds?: string } | undefined;
    if (details?.lengthSeconds) {
      const n = Number(details.lengthSeconds);
      if (n > 0) return n;
    }
    const lengthMatch =
      html.match(/"lengthSeconds":\s*"(\d+)"/) ??
      html.match(/lengthSeconds\\?":\s*\\?"?(\d+)/);
    if (lengthMatch?.[1]) return Number(lengthMatch[1]);
    const approx = html.match(/approxDurationMs["\\:\s]+(\d+)/);
    if (approx?.[1]) return Math.round(Number(approx[1]) / 1000);
  } catch {
    /* fall through */
  }
  return null;
}

export async function resolveYoutubeMeta(input: string): Promise<YoutubeMeta> {
  const youtubeId = extractYoutubeId(input);
  if (!youtubeId) throw new Error("Paste a valid YouTube URL or video id.");
  const youtubeUrl = youtubeWatchUrl(youtubeId);
  const [oembed, durationSec] = await Promise.all([
    fetchOembed(youtubeUrl),
    fetchDurationSec(youtubeId),
  ]);
  const estimated = !(durationSec && durationSec > 0);
  return {
    youtubeId,
    youtubeUrl,
    title: oembed?.title?.trim() || `YouTube video ${youtubeId}`,
    durationSec: estimated ? ESTIMATED_DURATION_SEC : durationSec!,
    thumbnailUrl: oembed?.thumbnail_url || youtubeThumb(youtubeId),
    channelTitle: oembed?.author_name?.trim() || null,
    durationEstimated: estimated,
  };
}
