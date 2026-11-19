# ContentOS — System Handoff

> Ground truth is the shipped code, not prior intent.
> **Documented from:** `b2c573900bb06d145582fe61e1e4e163d8b70488` (2026-11-19, “Add Google Stitch MCP config template” on `cursor/contentos-mvp-5bb3`)
> **Visual system:** [`DESIGN.md`](./DESIGN.md) + [`.impeccable/design.json`](./.impeccable/design.json) — tokens extracted from `src/styles.css`.
> **Refresh this file** whenever the studio is built or rebuilt. If `HEAD` still matches **Documented from**, leave both docs untouched.

## What it is

Operate-mode **editorial studio**: track posts across platforms and clip YouTube into Shorts / Reels / TikTok packages. One app (`TanStack Start` on Vite). There is no marketing site and no multi-product shell — the old HireFlow / Qrrupt console on `main` is the previous world.

After sign-in:

1. **Studio** (`/`) — stats, recent posts, recent clips.
2. **Library** (`/library`) — CRUD posts (platform, status, dates, notes, metrics) + filters.
3. **Queue** (`/queue`) — seven-day publish calendar + undated backlog.
4. **Clip** (`/clip`) — paste a YouTube/Shorts URL → analyze → ranked viral windows → Make clip.
5. **Editor** (`/clip/$clipId`) — vertical phone stage, IN/OUT timeline, Auto Shorts captions, SEO tabs, `.vtt` + EDL export.
6. **Exports** (`/clips`) — saved clip packages.

Export is **preview + captions/EDL**, not a cloud MP4 render.

## Surfaces

| Surface | Gate | Component / route |
| --- | --- | --- |
| Login | No session | `src/routes/login.tsx` |
| Boot | Session pending | `AuthGate` in `app-shell.tsx` |
| Studio shell | Session | `AppShell` |
| Shorts phone | Editor | `src/components/contentos/shorts-stage.tsx` |
| Timeline | Editor | `src/components/contentos/timeline.tsx` |

Unsigned visitors never see the desk. `AuthGate` waits on `useCurrentUserState`, then either `RedirectToSignIn` or the shell.

## Runtime topology

```
Browser (TanStack Start + Vite)
  ├─ Studio accounts  →  /api/auth/*  →  Postgres or PGLite
  ├─ App data         →  createServerFn + authMiddleware  →  same DB
  ├─ YouTube meta     →  oEmbed + watch-page scrape (no API key)
  ├─ Viral windows    →  in-process heuristics (chapter-aware, Shorts length)
  ├─ Captions / SEO   →  in-process heuristics (no ASR, no paid copy API)
  └─ Preview video    →  YouTube iframe embed (scaled into 9:16)
```

- **Framework:** TanStack Start 1.169, React 19, Vite 8, Tailwind 4 (`@import "tailwindcss"` + `@theme` in `src/styles.css`).
- **Dev server:** `npm run dev` → `0.0.0.0:8080`.
- **Build:** `vite build` + copy PGLite WASM + `npm run db:migrate`.
- **Auth:** Better Auth at `/api/auth/*` (`src/routes/api/auth/$.ts`). Email/password is **on** (`src/lib/auth/email-password.ts`). Google/X federation goes through the Grok broker when `GROK_AUTH_CLIENT_ID/SECRET` are injected; published `*.apps.grok.bot` hosts must not use the preview client.

## Auth

| Route / action | Role |
| --- | --- |
| `POST /api/auth/sign-up/email` | Create studio account |
| `POST /api/auth/sign-in/email` | Issue session |
| **Open a private studio** | Per-browser `sessionStorage` identity (`contentos.demo-identity.v1`) then sign-up/sign-in |
| Grok OAuth (Google / X) | Only when broker client creds exist; hidden on published host without them |
| `authMiddleware` | Required on every `src/lib/contentos/server.ts` function |

Session cookies are `__Host-grok-auth.*` (Secure, Path=/, no Domain). Live-preview iframes may use `Authorization: Bearer` (`bearer()` plugin).

`VITE_AUTH_ENABLED=false` is the shipped default in comments; this MVP runs with email/password enabled and expects auth on.

## Data

Migrations:

- `migrations/0001_auth.sql` (Better Auth)
- `migrations/0002_contentos.sql` (app)

| Table | Purpose |
| --- | --- |
| `content_items` | Posts: platform, status, dates, notes, views/likes/comments |
| `youtube_sources` | Analyzed YouTube URLs |
| `viral_moments` | Ranked windows (`hook` / `peak_energy` / `punchline` / `cta`) |
| `clips` | IN/OUT, aspect, `captions_json`, `seo_json`, `export_json` |
| `user_seeds` | Per-user demo seed claim (insert-first so concurrent visits cannot double-seed) |

All app queries filter `user_id = context.userId`. Database is `DATABASE_URL` Postgres when set, else embedded PGLite (`src/lib/db.ts`).

Platforms: `youtube | shorts | instagram | tiktok | x | linkedin`.  
Statuses: `idea | draft | scheduled | published | archived`.  
Aspects: `9:16` (default) \| `1:1` \| `16:9`.

## Clipping pipeline

1. `analyzeYoutube` parses the URL (`src/lib/contentos/youtube.ts`), fetches oEmbed + watch HTML.
2. Duration: player `lengthSeconds` when present; else **45s** for Shorts URLs, **180s** (`ESTIMATED_DURATION_SEC`) for long-form. UI can override and `reanalyzeSourceDuration` rebuilds windows.
3. Chapters: `macroMarkersListItemRenderer` plus description timecodes.
4. `heuristicMoments` (`src/lib/contentos/moments.ts`): Shorts-length, **start-aligned** windows (not centered). Prefers chapters; falls back to cold-open / first-third / payoff / CTA. Caps at 6. Native ≤60s sources ship as one whole-take hook.
5. `createClipFromMoment` stores captions from `buildShortsCaptions` (2–4 word beats, last word marked `*hot*`) and SEO from `heuristicSeo` (Shorts / Reels / TikTok variants). **No paid API.**
6. Editor: Play selection respects IN→OUT; Auto Shorts captions rebuild cues; download `.vtt` (`captionsToVtt`) and export JSON EDL. `mediaStatus` stays `"preview"` until a future render pass.

`src/lib/contentos/xai-moments.ts` is a stub — do not call a paid moments API unless the product explicitly wires it.

## Persistence

| Store | What | Where |
| --- | --- | --- |
| Postgres / PGLite | Users, sessions, posts, sources, moments, clips, seed markers | Server |
| `sessionStorage` `contentos.demo-identity.v1` | Per-browser demo email/password | Login only |

Generated captions and SEO live on the `clips` row. There is no object storage for rendered video.

## File map

```
src/styles.css                         → tokens + shell/editor CSS
src/routes/__root.tsx                  → Syne / Manrope / Plex Mono, theme-color #07090e
src/routes/login.tsx                   → auth gate + private studio
src/routes/index.tsx                   → Studio dashboard
src/routes/library.tsx                 → post tracker
src/routes/queue.tsx                   → week calendar
src/routes/clip.index.tsx              → analyze YouTube
src/routes/clip.$clipId.tsx            → Shorts editor
src/routes/clips.tsx                   → export list
src/routes/api/auth/$.ts               → Better Auth handler
src/components/contentos/app-shell.tsx → rail + mobile dock + AuthGate
src/components/contentos/shorts-stage.tsx
src/components/contentos/timeline.tsx
src/lib/contentos/server.ts            → all server functions
src/lib/contentos/types.ts
src/lib/contentos/moments.ts
src/lib/contentos/shorts-captions.ts
src/lib/contentos/seo.ts
src/lib/contentos/youtube.ts
src/lib/contentos/seed.ts
src/lib/auth/server.ts                 → frozen Better Auth wiring
src/lib/auth/email-password.ts         → local email flag (on)
migrations/0001_auth.sql
migrations/0002_contentos.sql
docs/stitch-mcp-setup.md
```

## Invariants for the next build

1. **Auth screen first.** Do not put Studio/Library on an anonymous first paint.
2. **Per-user rows only.** Every query stays scoped to `context.userId`. Seed with the `user_seeds` claim-first pattern.
3. **Free heuristics stay free.** Viral windows, captions, and SEO must work without a paid key. Do not silently require xAI / ASR.
4. **Start-aligned Shorts-length windows.** Do not center cuts on a beat; begin on it. Honor chapters when YouTube provides them.
5. **Export is preview + VTT/EDL** until a dedicated render pass exists. Do not pretend an MP4 was transcoded.
6. **Duration override exists** because watch-page scrapes fail in sandboxed egress. Keep `reanalyzeSourceDuration`.
7. **Open a private studio** mints a unique per-browser account — never a shared global demo user.
8. **Visual world is The Deep-Ink Cutting Room.** New UI goes through `DESIGN.md` (ink panels, Syne/Manrope, lime-as-marker). Do not introduce a second product look.
9. **Kickers and Lucide icons are incumbent, not system law.** Do not copy `.cos-kicker` onto new surfaces; prefer the brand square + lime marker.
10. **Do not commit secrets.** Broker client secrets, `BETTER_AUTH_SECRET`, and `DATABASE_URL` stay in env.

## How this documentation stays current

An hourly Cursor automation (“Design and System documentation”) compares `HEAD` to the **Documented from** SHA above.

- If the SHA matches and `DESIGN.md` / `HANDOFF.md` exist, it reports **No changes**.
- If the studio was built or rebuilt (new commits touching UI, auth, clipping, or tokens), it re-extracts the visual system into `DESIGN.md` + `.impeccable/design.json` and rewrites this handoff from the shipped artifact.
- Confirmed incumbent decisions stay; the build wins where they diverge.
- Do not commit secrets, env values, or identity tokens into either file.
