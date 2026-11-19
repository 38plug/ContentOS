import type { PlatformCopy, SeoPackage } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function baseTags(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return [
    ...words.map((w) => `#${w}`),
    "#shorts",
    "#viral",
    "#contentcreator",
    "#clipping",
  ].slice(0, 10);
}

function buildVariant(
  platform: "shorts" | "reels" | "tiktok",
  title: string,
  reason: string,
  channelTitle: string | null,
): PlatformCopy {
  const clean = title.replace(/\s+/g, " ").trim() || "Untitled clip";
  const hook = reason.split(/[.—]/)[0]?.trim() || reason;
  const tags = baseTags(clean);
  const credit = channelTitle ? ` via ${channelTitle}` : "";

  if (platform === "shorts") {
    return {
      seoTitle: `${clean.slice(0, 70)}${clean.length > 70 ? "…" : ""} | Shorts`,
      caption: `${hook}. Full context on the long-form — this cut is the part people rewatch.`,
      description: [
        clean,
        "",
        hook,
        "",
        "Chapters-free short cut from the original upload.",
        "Subscribe for more precision clips.",
        credit ? `Source${credit}.` : "",
        "",
        tags.join(" "),
      ]
        .filter(Boolean)
        .join("\n"),
      tags: [...tags, "#youtubeshorts", "#youtube"],
    };
  }

  if (platform === "reels") {
    return {
      seoTitle: clean.slice(0, 80),
      caption: `${hook} ✨\n\nSave this if it hit.\n\n${tags.filter((t) => !t.includes("youtube")).slice(0, 8).join(" ")} #reels #instagramreels`,
      description: `${clean}\n\n${hook}\n\nOriginal on YouTube${credit} — this Reel is the distilled beat.`,
      tags: [...tags.filter((t) => t !== "#shorts"), "#reels", "#instagramreels", "#explore"],
    };
  }

  return {
    seoTitle: clean.slice(0, 80),
    caption: `${hook}\n\nPOV: you finally clipped the part that mattered.\n\n${tags.slice(0, 6).join(" ")} #fyp #foryou #tiktok`,
    description: `${clean}\n\n${reason}\n\nFollow for daily cuts${credit}.`,
    tags: [...tags.filter((t) => t !== "#shorts"), "#fyp", "#foryou", "#tiktok"],
  };
}

/** Free built-in growth copy — no paid API required. */
export function heuristicSeo(
  title: string,
  reasonText: string,
  channelTitle: string | null = null,
): SeoPackage {
  return {
    shorts: buildVariant("shorts", title, reasonText, channelTitle),
    reels: buildVariant("reels", title, reasonText, channelTitle),
    tiktok: buildVariant("tiktok", title, reasonText, channelTitle),
  };
}

export function suggestedFileName(title: string, aspect: string, inSec: number, outSec: number): string {
  const base = slugify(title) || "clip";
  return `${base}_${aspect.replace(":", "x")}_${Math.floor(inSec)}-${Math.floor(outSec)}.mp4`;
}

/** Always free for now — returns built-in SEO packages with no external API. */
export async function buildSeoPackage(
  title: string,
  reasonText: string,
  channelTitle: string | null,
): Promise<SeoPackage> {
  return heuristicSeo(title, reasonText, channelTitle);
}
