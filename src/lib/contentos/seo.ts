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
): PlatformCopy {
  const clean = title.replace(/\s+/g, " ").trim() || "Untitled clip";
  const hook = reason.split(/[.—]/)[0]?.trim() || reason;
  const tags = baseTags(clean);

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
        "",
        tags.join(" "),
      ].join("\n"),
      tags: [...tags, "#youtubeshorts", "#youtube"],
    };
  }

  if (platform === "reels") {
    return {
      seoTitle: clean.slice(0, 80),
      caption: `${hook} ✨\n\nSave this if it hit.\n\n${tags.filter((t) => !t.includes("youtube")).slice(0, 8).join(" ")} #reels #instagramreels`,
      description: `${clean}\n\n${hook}\n\nOriginal on YouTube — this Reel is the distilled beat.`,
      tags: [...tags.filter((t) => t !== "#shorts"), "#reels", "#instagramreels", "#explore"],
    };
  }

  return {
    seoTitle: clean.slice(0, 80),
    caption: `${hook}\n\nPOV: you finally clipped the part that mattered.\n\n${tags.slice(0, 6).join(" ")} #fyp #foryou #tiktok`,
    description: `${clean}\n\n${reason}\n\nFollow for daily cuts.`,
    tags: [...tags.filter((t) => t !== "#shorts"), "#fyp", "#foryou", "#tiktok"],
  };
}

export function heuristicSeo(title: string, reasonText: string): SeoPackage {
  return {
    shorts: buildVariant("shorts", title, reasonText),
    reels: buildVariant("reels", title, reasonText),
    tiktok: buildVariant("tiktok", title, reasonText),
  };
}

export function suggestedFileName(title: string, aspect: string, inSec: number, outSec: number): string {
  const base = slugify(title) || "clip";
  return `${base}_${aspect.replace(":", "x")}_${Math.floor(inSec)}-${Math.floor(outSec)}.mp4`;
}

function apiKey() {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY || "";
}

export async function generateSeoWithXai(
  title: string,
  reasonText: string,
  channelTitle: string | null,
): Promise<SeoPackage | null> {
  const key = apiKey();
  if (!key) return null;
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
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You write short-form growth copy. Reply ONLY with JSON: {shorts:{seoTitle,caption,description,tags[]},reels:{...},tiktok:{...}}. No markdown.",
          },
          {
            role: "user",
            content: `Title: ${title}\nChannel: ${channelTitle ?? "unknown"}\nMoment reason: ${reasonText}\nWrite platform-tuned Shorts / Reels / TikTok packages.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as SeoPackage;
    if (!parsed.shorts?.caption || !parsed.reels?.caption || !parsed.tiktok?.caption) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function buildSeoPackage(
  title: string,
  reasonText: string,
  channelTitle: string | null,
): Promise<SeoPackage> {
  const ai = await generateSeoWithXai(title, reasonText, channelTitle);
  return ai ?? heuristicSeo(title, reasonText);
}
