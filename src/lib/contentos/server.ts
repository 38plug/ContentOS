import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { uid } from "@/lib/id";
import { mapClip, mapContentItem, mapMoment, mapSource } from "./db-map";
import { defaultCaptions, draftsToMoments, heuristicMoments } from "./moments";
import { buildDemoClipBundle, demoContentItems } from "./seed";
import { buildSeoPackage, suggestedFileName } from "./seo";
import type { Aspect, CaptionCue, DashboardStats, Platform, SeoPackage, Status } from "./types";
import { ASPECTS, PLATFORMS, STATUSES } from "./types";
import { resolveYoutubeMeta } from "./youtube";

async function ensureSeeded(userId: string) {
  const sql = await getSql();
  const existing = await sql`select user_id from user_seeds where user_id = ${userId} limit 1`;
  if (existing.length) return;

  const posts = demoContentItems(userId);
  for (const p of posts) {
    await sql`
      insert into content_items (
        id, user_id, title, platform, status, scheduled_at, published_at, notes,
        views, likes, comments, created_at, updated_at
      ) values (
        ${p.id}, ${userId}, ${p.title}, ${p.platform}, ${p.status},
        ${p.scheduledAt}, ${p.publishedAt}, ${p.notes},
        ${p.views}, ${p.likes}, ${p.comments}, ${p.createdAt}, ${p.updatedAt}
      )
    `;
  }

  const bundle = await buildDemoClipBundle(userId);
  const s = bundle.source;
  await sql`
    insert into youtube_sources (
      id, user_id, youtube_url, youtube_id, title, duration_sec, thumbnail_url, channel_title
    ) values (
      ${s.id}, ${userId}, ${s.youtubeUrl}, ${s.youtubeId}, ${s.title},
      ${s.durationSec}, ${s.thumbnailUrl}, ${s.channelTitle}
    )
  `;
  for (const m of bundle.moments) {
    await sql`
      insert into viral_moments (
        id, source_id, user_id, start_sec, end_sec, score, reason_type, reason_text, rank
      ) values (
        ${m.id}, ${m.sourceId}, ${userId}, ${m.startSec}, ${m.endSec},
        ${m.score}, ${m.reasonType}, ${m.reasonText}, ${m.rank}
      )
    `;
  }
  const c = bundle.clip;
  await sql`
    insert into clips (
      id, user_id, source_id, moment_id, title, in_sec, out_sec, aspect,
      captions_json, seo_json, export_json
    ) values (
      ${c.id}, ${userId}, ${c.sourceId}, ${c.momentId}, ${c.title},
      ${c.inSec}, ${c.outSec}, ${c.aspect},
      ${JSON.stringify(c.captions)}::jsonb,
      ${JSON.stringify(c.seo)}::jsonb,
      ${JSON.stringify(c.exportPackage)}::jsonb
    )
  `;
  await sql`insert into user_seeds (user_id) values (${userId}) on conflict do nothing`;
}

export const bootstrapWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeded(context.userId);
    return { ok: true as const };
  });

export const listContentItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeded(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select * from content_items
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(mapContentItem);
  });

export const getContentItem = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql`
      select * from content_items
      where id = ${data.id} and user_id = ${context.userId}
      limit 1
    `;
    return rows[0] ? mapContentItem(rows[0]) : null;
  });

export const upsertContentItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      title: string;
      platform: Platform;
      status: Status;
      scheduledAt?: string | null;
      publishedAt?: string | null;
      notes?: string;
      views?: number;
      likes?: number;
      comments?: number;
    }) => {
      if (!input.title?.trim()) throw new Error("Title is required");
      if (!PLATFORMS.includes(input.platform)) throw new Error("Invalid platform");
      if (!STATUSES.includes(input.status)) throw new Error("Invalid status");
      return input;
    },
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = data.id ?? uid("post");
    const now = new Date().toISOString();
    const existing = data.id
      ? await sql`select id from content_items where id = ${data.id} and user_id = ${context.userId}`
      : [];

    if (existing.length) {
      await sql`
        update content_items set
          title = ${data.title.trim()},
          platform = ${data.platform},
          status = ${data.status},
          scheduled_at = ${data.scheduledAt ?? null},
          published_at = ${data.publishedAt ?? null},
          notes = ${data.notes ?? ""},
          views = ${data.views ?? 0},
          likes = ${data.likes ?? 0},
          comments = ${data.comments ?? 0},
          updated_at = ${now}
        where id = ${id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into content_items (
          id, user_id, title, platform, status, scheduled_at, published_at, notes,
          views, likes, comments, created_at, updated_at
        ) values (
          ${id}, ${context.userId}, ${data.title.trim()}, ${data.platform}, ${data.status},
          ${data.scheduledAt ?? null}, ${data.publishedAt ?? null}, ${data.notes ?? ""},
          ${data.views ?? 0}, ${data.likes ?? 0}, ${data.comments ?? 0}, ${now}, ${now}
        )
      `;
    }
    const rows = await sql`select * from content_items where id = ${id} and user_id = ${context.userId}`;
    return mapContentItem(rows[0]!);
  });

export const deleteContentItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from content_items where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const analyzeYoutube = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { url: string }) => {
    if (!input.url?.trim()) throw new Error("YouTube URL required");
    return input;
  })
  .handler(async ({ context, data }) => {
    await ensureSeeded(context.userId);
    const meta = await resolveYoutubeMeta(data.url);
    const sql = await getSql();
    const sourceId = uid("yt");
    await sql`
      insert into youtube_sources (
        id, user_id, youtube_url, youtube_id, title, duration_sec, thumbnail_url, channel_title
      ) values (
        ${sourceId}, ${context.userId}, ${meta.youtubeUrl}, ${meta.youtubeId}, ${meta.title},
        ${meta.durationSec}, ${meta.thumbnailUrl}, ${meta.channelTitle}
      )
    `;
    const moments = draftsToMoments(
      heuristicMoments(meta.durationSec, meta.title),
      sourceId,
      context.userId,
    );
    for (const m of moments) {
      await sql`
        insert into viral_moments (
          id, source_id, user_id, start_sec, end_sec, score, reason_type, reason_text, rank
        ) values (
          ${m.id}, ${m.sourceId}, ${context.userId}, ${m.startSec}, ${m.endSec},
          ${m.score}, ${m.reasonType}, ${m.reasonText}, ${m.rank}
        )
      `;
    }
    return {
      source: mapSource({
        id: sourceId,
        user_id: context.userId,
        youtube_url: meta.youtubeUrl,
        youtube_id: meta.youtubeId,
        title: meta.title,
        duration_sec: meta.durationSec,
        thumbnail_url: meta.thumbnailUrl,
        channel_title: meta.channelTitle,
        created_at: new Date().toISOString(),
      }),
      moments,
      durationEstimated: meta.durationEstimated,
    };
  });

export const listSources = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeded(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select * from youtube_sources
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map(mapSource);
  });

export const getSourceBundle = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { sourceId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const sources = await sql`
      select * from youtube_sources
      where id = ${data.sourceId} and user_id = ${context.userId}
      limit 1
    `;
    if (!sources[0]) return null;
    const moments = await sql`
      select * from viral_moments
      where source_id = ${data.sourceId} and user_id = ${context.userId}
      order by rank asc, score desc
    `;
    return {
      source: mapSource(sources[0]),
      moments: moments.map(mapMoment),
    };
  });

export const createClipFromMoment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { momentId: string; aspect?: Aspect }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const moments = await sql`
      select * from viral_moments
      where id = ${data.momentId} and user_id = ${context.userId}
      limit 1
    `;
    const momentRow = moments[0];
    if (!momentRow) throw new Error("Moment not found");
    const moment = mapMoment(momentRow);
    const sources = await sql`
      select * from youtube_sources
      where id = ${moment.sourceId} and user_id = ${context.userId}
      limit 1
    `;
    const sourceRow = sources[0];
    if (!sourceRow) throw new Error("Source not found");
    const source = mapSource(sourceRow);
    const aspect: Aspect =
      data.aspect && ASPECTS.includes(data.aspect) ? data.aspect : "9:16";
    const captions = defaultCaptions(moment.startSec, moment.endSec, source.title);
    const seo = await buildSeoPackage(source.title, moment.reasonText, source.channelTitle);
    const clipId = uid("clip");
    const title = `${source.title} — ${moment.reasonType.replace("_", " ")}`;
    const exportPackage = {
      fileName: suggestedFileName(source.title, aspect, moment.startSec, moment.endSec),
      mediaStatus: "preview" as const,
      note: "Preview package with edit decisions. Media render where possible in-browser; otherwise download the EDL JSON.",
      editDecisionList: {
        youtubeId: source.youtubeId,
        youtubeUrl: source.youtubeUrl,
        inSec: moment.startSec,
        outSec: moment.endSec,
        aspect,
        captions,
      },
      generatedAt: new Date().toISOString(),
    };
    await sql`
      insert into clips (
        id, user_id, source_id, moment_id, title, in_sec, out_sec, aspect,
        captions_json, seo_json, export_json
      ) values (
        ${clipId}, ${context.userId}, ${source.id}, ${moment.id}, ${title},
        ${moment.startSec}, ${moment.endSec}, ${aspect},
        ${JSON.stringify(captions)}::jsonb,
        ${JSON.stringify(seo)}::jsonb,
        ${JSON.stringify(exportPackage)}::jsonb
      )
    `;
    return mapClip(
      {
        id: clipId,
        user_id: context.userId,
        source_id: source.id,
        moment_id: moment.id,
        title,
        in_sec: moment.startSec,
        out_sec: moment.endSec,
        aspect,
        captions_json: captions,
        seo_json: seo,
        export_json: exportPackage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      source,
    );
  });

export const listClips = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeded(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select c.*,
        s.youtube_url as s_youtube_url,
        s.youtube_id as s_youtube_id,
        s.title as s_title,
        s.duration_sec as s_duration_sec,
        s.thumbnail_url as s_thumbnail_url,
        s.channel_title as s_channel_title,
        s.created_at as s_created_at
      from clips c
      join youtube_sources s on s.id = c.source_id
      where c.user_id = ${context.userId}
      order by c.updated_at desc
    `;
    return rows.map((row) =>
      mapClip(row, {
        id: String(row.source_id),
        userId: context.userId,
        youtubeUrl: String(row.s_youtube_url),
        youtubeId: String(row.s_youtube_id),
        title: String(row.s_title),
        durationSec: Number(row.s_duration_sec),
        thumbnailUrl: row.s_thumbnail_url == null ? null : String(row.s_thumbnail_url),
        channelTitle: row.s_channel_title == null ? null : String(row.s_channel_title),
        createdAt: String(row.s_created_at),
      }),
    );
  });

async function loadClip(userId: string, id: string) {
  const sql = await getSql();
  const rows = await sql`
    select c.*,
      s.youtube_url as s_youtube_url,
      s.youtube_id as s_youtube_id,
      s.title as s_title,
      s.duration_sec as s_duration_sec,
      s.thumbnail_url as s_thumbnail_url,
      s.channel_title as s_channel_title,
      s.created_at as s_created_at
    from clips c
    join youtube_sources s on s.id = c.source_id
    where c.id = ${id} and c.user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return mapClip(row, {
    id: String(row.source_id),
    userId,
    youtubeUrl: String(row.s_youtube_url),
    youtubeId: String(row.s_youtube_id),
    title: String(row.s_title),
    durationSec: Number(row.s_duration_sec),
    thumbnailUrl: row.s_thumbnail_url == null ? null : String(row.s_thumbnail_url),
    channelTitle: row.s_channel_title == null ? null : String(row.s_channel_title),
    createdAt: String(row.s_created_at),
  });
}

export const getClip = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => loadClip(context.userId, data.id));

export const updateClip = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: string;
      title?: string;
      inSec?: number;
      outSec?: number;
      aspect?: Aspect;
      captions?: CaptionCue[];
      seo?: SeoPackage;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const current = await loadClip(context.userId, data.id);
    if (!current?.source) throw new Error("Clip not found");
    const inSec = data.inSec ?? current.inSec;
    const outSec = data.outSec ?? current.outSec;
    if (outSec <= inSec) throw new Error("Out point must be after in point");
    const aspect = data.aspect && ASPECTS.includes(data.aspect) ? data.aspect : current.aspect;
    const captions = data.captions ?? current.captions;
    const seo = data.seo ?? current.seo;
    const title = data.title?.trim() || current.title;
    const source = current.source;
    const exportPackage = {
      ...current.exportPackage,
      fileName: suggestedFileName(source.title, aspect, inSec, outSec),
      editDecisionList: {
        youtubeId: source.youtubeId,
        youtubeUrl: source.youtubeUrl,
        inSec,
        outSec,
        aspect,
        captions,
      },
      generatedAt: new Date().toISOString(),
    };
    const now = new Date().toISOString();
    await sql`
      update clips set
        title = ${title},
        in_sec = ${inSec},
        out_sec = ${outSec},
        aspect = ${aspect},
        captions_json = ${JSON.stringify(captions)}::jsonb,
        seo_json = ${JSON.stringify(seo)}::jsonb,
        export_json = ${JSON.stringify(exportPackage)}::jsonb,
        updated_at = ${now}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return loadClip(context.userId, data.id);
  });

export const regenerateSeo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { clipId: string }) => input)
  .handler(async ({ context, data }) => {
    const clip = await loadClip(context.userId, data.clipId);
    if (!clip?.source) throw new Error("Clip not found");
    const sql = await getSql();
    let reason = "High-retention moment cut for short-form.";
    if (clip.momentId) {
      const moments = await sql`
        select reason_text from viral_moments
        where id = ${clip.momentId} and user_id = ${context.userId}
        limit 1
      `;
      if (moments[0]) reason = String(moments[0].reason_text);
    }
    const seo = await buildSeoPackage(clip.source.title, reason, clip.source.channelTitle);
    const source = clip.source;
    const exportPackage = {
      ...clip.exportPackage,
      editDecisionList: {
        youtubeId: source.youtubeId,
        youtubeUrl: source.youtubeUrl,
        inSec: clip.inSec,
        outSec: clip.outSec,
        aspect: clip.aspect,
        captions: clip.captions,
      },
      generatedAt: new Date().toISOString(),
    };
    await sql`
      update clips set
        seo_json = ${JSON.stringify(seo)}::jsonb,
        export_json = ${JSON.stringify(exportPackage)}::jsonb,
        updated_at = ${new Date().toISOString()}
      where id = ${clip.id} and user_id = ${context.userId}
    `;
    return seo;
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeded(context.userId);
    const sql = await getSql();
    const [postAgg] = await sql`
      select
        count(*)::int as posts,
        count(*) filter (where status = 'published')::int as published,
        count(*) filter (where status in ('draft','idea'))::int as drafts,
        coalesce(sum(views), 0)::int as total_views
      from content_items
      where user_id = ${context.userId}
    `;
    const [clipAgg] = await sql`
      select count(*)::int as clips from clips where user_id = ${context.userId}
    `;
    const recent = await sql`
      select * from content_items
      where user_id = ${context.userId}
      order by updated_at desc
      limit 5
    `;
    const clipRows = await sql`
      select c.*,
        s.youtube_url as s_youtube_url,
        s.youtube_id as s_youtube_id,
        s.title as s_title,
        s.duration_sec as s_duration_sec,
        s.thumbnail_url as s_thumbnail_url,
        s.channel_title as s_channel_title,
        s.created_at as s_created_at
      from clips c
      join youtube_sources s on s.id = c.source_id
      where c.user_id = ${context.userId}
      order by c.updated_at desc
      limit 4
    `;
    return {
      stats: {
        posts: Number(postAgg?.posts ?? 0),
        published: Number(postAgg?.published ?? 0),
        drafts: Number(postAgg?.drafts ?? 0),
        clips: Number(clipAgg?.clips ?? 0),
        totalViews: Number(postAgg?.total_views ?? 0),
      } satisfies DashboardStats,
      recentPosts: recent.map(mapContentItem),
      recentClips: clipRows.map((row) =>
        mapClip(row, {
          id: String(row.source_id),
          userId: context.userId,
          youtubeUrl: String(row.s_youtube_url),
          youtubeId: String(row.s_youtube_id),
          title: String(row.s_title),
          durationSec: Number(row.s_duration_sec),
          thumbnailUrl: row.s_thumbnail_url == null ? null : String(row.s_thumbnail_url),
          channelTitle: row.s_channel_title == null ? null : String(row.s_channel_title),
          createdAt: String(row.s_created_at),
        }),
      ),
    };
  });
