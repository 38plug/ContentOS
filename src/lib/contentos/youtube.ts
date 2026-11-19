const ID_PATTERNS = [
  /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/live\/)([A-Za-z0-9_-]{6,})/,
  /^([A-Za-z0-9_-]{11})$/,
];

/** Used when YouTube blocks player metadata (common in sandboxed egress). */
export const ESTIMATED_DURATION_SEC = 180;

export type YoutubeChapter = {
  title: string;
  startSec: number;
};

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
  chapters: YoutubeChapter[];
  description: string;
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

function parseTimecode(raw: string): number | null {
  const parts = raw.split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  if (parts.length === 1) return parts[0]!;
  return null;
}

function parseDescriptionChapters(description: string, durationSec: number): YoutubeChapter[] {
  const chapters: YoutubeChapter[] = [];
  for (const line of description.split(/\r?\n/)) {
    const match = line.match(/^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+?)\s*$/);
    if (!match) continue;
    const startSec = parseTimecode(match[1]!);
    const title = match[2]?.trim();
    if (startSec == null || startSec < 0 || startSec >= durationSec || !title) continue;
    chapters.push({ title: title.slice(0, 120), startSec });
  }
  return dedupeChapters(chapters);
}

function extractMacroMarkerChapters(html: string): YoutubeChapter[] {
  const chapters: YoutubeChapter[] = [];
  const re =
    /"macroMarkersListItemRenderer"\s*:\s*\{[\s\S]*?"title"\s*:\s*\{\s*"simpleText"\s*:\s*"((?:\\.|[^"\\])*)"\s*\}[\s\S]*?"timeDescription"\s*:\s*\{\s*"simpleText"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const title = match[1]?.replace(/\\"/g, '"').trim();
    const startSec = parseTimecode(match[2] ?? "");
    if (!title || startSec == null || startSec < 0) continue;
    chapters.push({ title: title.slice(0, 120), startSec });
  }
  if (chapters.length) return dedupeChapters(chapters);

  const alt =
    /"startTimeSeconds"\s*:\s*"?(\d+)"?[\s\S]{0,180}?"title"\s*:\s*\{\s*"simpleText"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  while ((match = alt.exec(html))) {
    const startSec = Number(match[1]);
    const title = match[2]?.replace(/\\"/g, '"').trim();
    if (!title || !(startSec >= 0)) continue;
    chapters.push({ title: title.slice(0, 120), startSec });
  }
  return dedupeChapters(chapters);
}

function dedupeChapters(chapters: YoutubeChapter[]): YoutubeChapter[] {
  const seen = new Set<number>();
  return chapters
    .sort((a, b) => a.startSec - b.startSec)
    .filter((c) => {
      const key = Math.round(c.startSec);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

type PlayerPayload = {
  durationSec: number | null;
  description: string;
  chapters: YoutubeChapter[];
};

async function fetchPlayerPayload(id: string): Promise<PlayerPayload> {
  try {
    const res = await fetch(youtubeWatchUrl(id), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { durationSec: null, description: "", chapters: [] };
    const html = await res.text();
    const player = extractJsonObject(html, "ytInitialPlayerResponse");
    const details = player?.videoDetails as
      | { lengthSeconds?: string; shortDescription?: string }
      | undefined;
    let durationSec: number | null = null;
    if (details?.lengthSeconds) {
      const n = Number(details.lengthSeconds);
      if (n > 0) durationSec = n;
    }
    if (durationSec == null) {
      const lengthMatch =
        html.match(/"lengthSeconds":\s*"(\d+)"/) ??
        html.match(/lengthSeconds\\?":\s*\\?"?(\d+)/);
      if (lengthMatch?.[1]) durationSec = Number(lengthMatch[1]);
    }
    if (durationSec == null) {
      const approx = html.match(/approxDurationMs["\\:\s]+(\d+)/);
      if (approx?.[1]) durationSec = Math.round(Number(approx[1]) / 1000);
    }

    const description = details?.shortDescription?.trim() || "";
    const durationForChapters = durationSec && durationSec > 0 ? durationSec : ESTIMATED_DURATION_SEC;
    const chapters = [
      ...extractMacroMarkerChapters(html),
      ...parseDescriptionChapters(description, durationForChapters),
    ];

    return {
      durationSec,
      description,
      chapters: dedupeChapters(chapters),
    };
  } catch {
    return { durationSec: null, description: "", chapters: [] };
  }
}

export async function resolveYoutubeMeta(input: string): Promise<YoutubeMeta> {
  const youtubeId = extractYoutubeId(input);
  if (!youtubeId) throw new Error("Paste a valid YouTube URL or video id.");
  const youtubeUrl = youtubeWatchUrl(youtubeId);
  const [oembed, player] = await Promise.all([fetchOembed(youtubeUrl), fetchPlayerPayload(youtubeId)]);
  const estimated = !(player.durationSec && player.durationSec > 0);
  const durationSec = estimated ? ESTIMATED_DURATION_SEC : player.durationSec!;
  return {
    youtubeId,
    youtubeUrl,
    title: oembed?.title?.trim() || `YouTube video ${youtubeId}`,
    durationSec,
    thumbnailUrl: oembed?.thumbnail_url || youtubeThumb(youtubeId),
    channelTitle: oembed?.author_name?.trim() || null,
    durationEstimated: estimated,
    chapters: player.chapters.filter((c) => c.startSec < durationSec),
    description: player.description,
  };
}
