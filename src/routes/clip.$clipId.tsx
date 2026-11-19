import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Download, Library, RefreshCw, Subtitles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import { ShortsStage } from "@/components/contentos/shorts-stage";
import { ClipTimeline } from "@/components/contentos/timeline";
import { buildShortsCaptions, captionsToVtt } from "@/lib/contentos/shorts-captions";
import { getClip, regenerateSeo, updateClip, upsertContentItem } from "@/lib/contentos/server";
import type { Aspect, CaptionCue, Clip, SeoPackage } from "@/lib/contentos/types";
import { ASPECTS, formatTimecode } from "@/lib/contentos/types";
import { uid } from "@/lib/id";

export const Route = createFileRoute("/clip/$clipId")({ component: ClipEditorPage });

function ClipEditorPage() {
  return (
    <AuthGate>
      <ClipEditor />
    </AuthGate>
  );
}

type SeoTab = keyof SeoPackage;

function ClipEditor() {
  const { clipId } = Route.useParams();
  const navigate = useNavigate();
  const [clip, setClip] = useState<Clip | null>(null);
  const [inSec, setInSec] = useState(0);
  const [outSec, setOutSec] = useState(10);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [captions, setCaptions] = useState<CaptionCue[]>([]);
  const [seo, setSeo] = useState<SeoPackage | null>(null);
  const [seoTab, setSeoTab] = useState<SeoTab>("shorts");
  const [playhead, setPlayhead] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getClip({ data: { id: clipId } })
      .then((row) => {
        if (!alive) return;
        if (!row) {
          setError("Clip not found");
          return;
        }
        setClip(row);
        setInSec(row.inSec);
        setOutSec(row.outSec);
        setAspect(row.aspect);
        setCaptions(row.captions);
        setSeo(row.seo);
        setPlayhead(row.inSec);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load clip");
      });
    return () => {
      alive = false;
    };
  }, [clipId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "i" || e.key === "I") {
        setInSec(playhead);
        setMessage(`In point → ${formatTimecode(playhead)}`);
      } else if (e.key === "o" || e.key === "O") {
        const nextOut = Math.max(playhead, inSec + 1);
        setOutSec(nextOut);
        setMessage(`Out point → ${formatTimecode(nextOut)}`);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlayhead((p) => Math.max(0, p - (e.shiftKey ? 1 : 0.25)));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const max = clip?.source?.durationSec ?? outSec;
        setPlayhead((p) => Math.min(max, p + (e.shiftKey ? 1 : 0.25)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playhead, inSec, outSec, clip]);

  const activeCaption = useMemo(
    () => captions.find((c) => playhead >= c.startSec && playhead <= c.endSec)?.text ?? "",
    [captions, playhead],
  );

  const embedSrc = useMemo(() => {
    if (!clip?.source) return "";
    // Preview the actual edit decision: start at playhead (clamped into the
    // selection) and hard-stop at OUT so the iframe doesn't keep playing the
    // rest of the long-form video.
    const start = Math.max(0, Math.floor(Math.min(Math.max(playhead, inSec), Math.max(inSec, outSec - 1))));
    const end = Math.max(start + 1, Math.ceil(outSec));
    return `https://www.youtube.com/embed/${clip.source.youtubeId}?start=${start}&end=${end}&rel=0&modestbranding=1`;
  }, [clip, playhead, inSec, outSec]);

  function playSelection() {
    setPlayhead(inSec);
    setAutoplay(true);
    setPreviewKey((k) => k + 1);
    setMessage(`Playing selection ${formatTimecode(inSec)} → ${formatTimecode(outSec)}`);
  }

  async function save(partial?: {
    inSec?: number;
    outSec?: number;
    aspect?: Aspect;
    captions?: CaptionCue[];
    seo?: SeoPackage;
  }) {
    if (!clip) return;
    setBusy(true);
    setError(null);
    try {
      const next = await updateClip({
        data: {
          id: clip.id,
          inSec: partial?.inSec ?? inSec,
          outSec: partial?.outSec ?? outSec,
          aspect: partial?.aspect ?? aspect,
          captions: partial?.captions ?? captions,
          seo: partial?.seo ?? seo ?? undefined,
        },
      });
      if (next) {
        setClip(next);
        setMessage("Saved edit decisions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRegenSeo() {
    setBusy(true);
    setError(null);
    try {
      const next = await regenerateSeo({ data: { clipId } });
      setSeo(next);
      setMessage("SEO package regenerated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "SEO failed");
    } finally {
      setBusy(false);
    }
  }

  function copyText(label: string, text: string) {
    void navigator.clipboard.writeText(text).then(() => setMessage(`Copied ${label}`));
  }

  function downloadPackage() {
    if (!clip || !seo) return;
    const payload = {
      ...clip.exportPackage,
      title: clip.title,
      aspect,
      inSec,
      outSec,
      captions,
      seo,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (clip.exportPackage.fileName || "clip").replace(/\.mp4$/i, "") + ".edl.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage("Downloaded edit decision package");
  }

  function downloadVtt() {
    if (!clip) return;
    const vtt = captionsToVtt(captions, clip.title);
    const blob = new Blob([vtt], { type: "text/vtt" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (clip.exportPackage.fileName || "clip").replace(/\.mp4$/i, "") + ".shorts.vtt";
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage("Downloaded Shorts captions (.vtt)");
  }

  function regenShortsCaptions() {
    const next = buildShortsCaptions(inSec, outSec, clip?.title ?? "Clip", clip?.title ?? "");
    setCaptions(next);
    setPlayhead(inSec);
    setPreviewKey((k) => k + 1);
    setAutoplay(true);
    setMessage("Generated Shorts-style captions — Play selection to preview");
    void save({ captions: next, inSec, outSec });
  }

  async function addToLibrary() {
    if (!clip) return;
    setBusy(true);
    setError(null);
    try {
      const platform =
        aspect === "9:16" ? ("shorts" as const) : aspect === "1:1" ? ("instagram" as const) : ("youtube" as const);
      const saved = await upsertContentItem({
        data: {
          title: clip.title,
          platform,
          status: "draft",
          notes: `From clip ${clip.id} · ${formatTimecode(inSec)}–${formatTimecode(outSec)} · ${aspect}`,
          views: 0,
          likes: 0,
          comments: 0,
        },
      });
      setMessage("Added to library as draft");
      void navigate({ to: "/library", search: { id: saved.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to library");
    } finally {
      setBusy(false);
    }
  }

  const variant = seo?.[seoTab];

  return (
    <AppShell
      title={clip?.title ?? "Clip editor"}
      action={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/clip" className="cos-btn secondary">
            Back to analyze
          </Link>
          <button type="button" className="cos-btn" disabled={busy || !clip} onClick={() => void save()}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      {error ? <p className="cos-error">{error}</p> : null}
      {message ? <p className="sub" style={{ color: "var(--color-lime)", marginBottom: 12 }}>{message}</p> : null}

      {!clip ? (
        <p className="sub">Loading editor…</p>
      ) : (
        <div className="cos-editor">
          <section className="cos-panel">
            {aspect === "9:16" && clip.source ? (
              <ShortsStage
                youtubeId={clip.source.youtubeId}
                embedSrc={embedSrc}
                autoplay={autoplay}
                iframeKey={`${clip.id}-${previewKey}-${Math.floor(playhead)}-${Math.ceil(outSec)}`}
                caption={activeCaption}
                title={clip.title}
                channelTitle={clip.source.channelTitle}
                clipLabel={`${formatTimecode(inSec)}–${formatTimecode(outSec)}`}
              />
            ) : (
              <div className="cos-preview-frame" data-aspect={aspect}>
                {embedSrc ? (
                  <iframe
                    key={`${clip.id}-${previewKey}-${Math.floor(playhead)}-${Math.ceil(outSec)}`}
                    title="Clip preview"
                    src={`${embedSrc}&autoplay=${autoplay ? 1 : 0}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
                {activeCaption ? (
                  <div className="cos-caption-overlay cos-shorts-caption" style={{ bottom: "14%" }}>
                    {activeCaption.replace(/\*/g, "")}
                  </div>
                ) : null}
              </div>
            )}
            <p className="sub" style={{ marginTop: 8 }}>
              Shorts-style preview with burned captions. Stops at OUT ({formatTimecode(outSec)}). Length{" "}
              <strong style={{ color: "var(--color-ink)" }}>{formatTimecode(outSec - inSec)}</strong>
              {outSec - inSec > 45 ? " — trim under ~35s for Shorts." : " · Shorts-ready."}
            </p>

            <div className="cos-aspect-row">
              {ASPECTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={a === aspect ? "active" : ""}
                  onClick={() => {
                    setAspect(a);
                    void save({ aspect: a });
                  }}
                >
                  {a}
                  {a === "9:16" ? " · primary" : ""}
                </button>
              ))}
            </div>

            <ClipTimeline
              durationSec={clip.source?.durationSec ?? outSec}
              inSec={inSec}
              outSec={outSec}
              playheadSec={playhead}
              onChange={({ inSec: nextIn, outSec: nextOut }) => {
                setInSec(nextIn);
                setOutSec(nextOut);
                setPlayhead((p) => Math.min(Math.max(p, nextIn), nextOut));
              }}
              onScrub={setPlayhead}
            />

            <p className="sub" style={{ marginTop: 10 }}>
              Keys: <span className="cos-kbd">I</span> set in · <span className="cos-kbd">O</span> set out ·{" "}
              <span className="cos-kbd">←</span>/<span className="cos-kbd">→</span> nudge playhead (Shift = 1s)
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" className="cos-btn" onClick={playSelection}>
                Play selection
              </button>
              <button type="button" className="cos-btn secondary" onClick={regenShortsCaptions} disabled={busy}>
                <Subtitles size={15} /> Auto Shorts captions
              </button>
              <button
                type="button"
                className="cos-btn secondary"
                onClick={() => {
                  void save({ inSec, outSec });
                }}
              >
                Commit in/out
              </button>
              <button type="button" className="cos-btn secondary" onClick={downloadPackage}>
                <Download size={15} /> Export package
              </button>
              <button type="button" className="cos-btn secondary" onClick={downloadVtt}>
                <Download size={15} /> Captions .vtt
              </button>
              <button type="button" className="cos-btn secondary" disabled={busy} onClick={() => void addToLibrary()}>
                <Library size={15} /> Add to library
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <h2>Shorts captions</h2>
              <p className="sub">
                Dense on-screen beats like viral Shorts — wrap a word in *stars* to highlight it.
              </p>
              <div className="cos-list">
                {captions.map((cue, idx) => (
                  <div key={cue.id} className="cos-copy-block">
                    <header>
                      Cue {idx + 1}
                      <button
                        type="button"
                        className="cos-btn ghost"
                        onClick={() => {
                          const next = captions.filter((c) => c.id !== cue.id);
                          setCaptions(next);
                        }}
                      >
                        Remove
                      </button>
                    </header>
                    <div className="cos-form-grid">
                      <div className="cos-field">
                        <label>Start (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={cue.startSec}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCaptions((rows) =>
                              rows.map((r) => (r.id === cue.id ? { ...r, startSec: v } : r)),
                            );
                          }}
                        />
                      </div>
                      <div className="cos-field">
                        <label>End (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={cue.endSec}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCaptions((rows) =>
                              rows.map((r) => (r.id === cue.id ? { ...r, endSec: v } : r)),
                            );
                          }}
                        />
                      </div>
                      <div className="cos-field wide">
                        <label>Text</label>
                        <input
                          value={cue.text}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCaptions((rows) =>
                              rows.map((r) => (r.id === cue.id ? { ...r, text: v } : r)),
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="cos-btn secondary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setCaptions((rows) => [
                    ...rows,
                    {
                      id: uid("cue"),
                      startSec: inSec,
                      endSec: Math.min(outSec, inSec + 3),
                      text: "New caption",
                    },
                  ]);
                }}
              >
                Add cue
              </button>
            </div>
          </section>

          <section className="cos-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
              <div>
                <h2>Growth copy</h2>
                <p className="sub">
                  Free built-in packages — tags, caption, description, SEO title for Shorts /
                  Reels / TikTok. No API key needed.
                </p>
              </div>
              <button type="button" className="cos-btn secondary" disabled={busy} onClick={() => void onRegenSeo()}>
                <RefreshCw size={14} /> Regen
              </button>
            </div>

            <div className="cos-seo-tabs">
              {(
                [
                  ["shorts", "YouTube Shorts"],
                  ["reels", "Instagram Reels"],
                  ["tiktok", "TikTok"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={seoTab === key ? "active" : ""}
                  onClick={() => setSeoTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {variant ? (
              <>
                <div className="cos-copy-block">
                  <header>
                    SEO title
                    <button type="button" className="cos-btn ghost" onClick={() => copyText("title", variant.seoTitle)}>
                      <Copy size={13} /> Copy
                    </button>
                  </header>
                  <pre>{variant.seoTitle}</pre>
                </div>
                <div className="cos-copy-block">
                  <header>
                    Caption
                    <button type="button" className="cos-btn ghost" onClick={() => copyText("caption", variant.caption)}>
                      <Copy size={13} /> Copy
                    </button>
                  </header>
                  <pre>{variant.caption}</pre>
                </div>
                <div className="cos-copy-block">
                  <header>
                    Description
                    <button
                      type="button"
                      className="cos-btn ghost"
                      onClick={() => copyText("description", variant.description)}
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </header>
                  <pre>{variant.description}</pre>
                </div>
                <div className="cos-copy-block">
                  <header>
                    Tags
                    <button
                      type="button"
                      className="cos-btn ghost"
                      onClick={() => copyText("tags", variant.tags.join(" "))}
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </header>
                  <pre>{variant.tags.join(" ")}</pre>
                </div>
                <button
                  type="button"
                  className="cos-btn"
                  onClick={() =>
                    copyText(
                      "all",
                      [variant.seoTitle, "", variant.caption, "", variant.description, "", variant.tags.join(" ")].join(
                        "\n",
                      ),
                    )
                  }
                >
                  <Copy size={15} /> Copy all
                </button>
              </>
            ) : (
              <p className="sub">No SEO package yet.</p>
            )}

            <div style={{ marginTop: 20 }}>
              <h2>Export</h2>
              <p className="sub">
                {clip.exportPackage.note} · {formatTimecode(inSec)}–{formatTimecode(outSec)} · {aspect}
              </p>
              <p className="sub" style={{ fontFamily: "var(--font-mono)" }}>
                {clip.exportPackage.fileName}
              </p>
              <span className="cos-pill" style={{ marginTop: 8 }}>
                {clip.exportPackage.mediaStatus}
              </span>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
