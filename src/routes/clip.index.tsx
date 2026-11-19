import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Scissors, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import {
  analyzeYoutube,
  createClipFromMoment,
  listSources,
  reanalyzeSourceDuration,
} from "@/lib/contentos/server";
import type { ViralMoment, YoutubeSource } from "@/lib/contentos/types";
import { formatTimecode, reasonLabel } from "@/lib/contentos/types";

export const Route = createFileRoute("/clip/")({ component: ClipAnalyzePage });

function ClipAnalyzePage() {
  return (
    <AuthGate>
      <ClipAnalyze />
    </AuthGate>
  );
}

function ClipAnalyze() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=jNQXAC9IVRw");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<YoutubeSource | null>(null);
  const [moments, setMoments] = useState<ViralMoment[]>([]);
  const [history, setHistory] = useState<YoutubeSource[]>([]);
  const [durationEstimated, setDurationEstimated] = useState(false);
  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    void listSources()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  async function analyze(durationOverride?: number) {
    setBusy(true);
    setError(null);
    try {
      const result = await analyzeYoutube({
        data: {
          url,
          ...(durationOverride && durationOverride > 0 ? { durationSec: durationOverride } : {}),
        },
      });
      setSource(result.source);
      setMoments(result.moments);
      setDurationEstimated(Boolean(result.durationEstimated));
      setDurationInput(String(result.source.durationSec));
      setHistory((h) => [result.source, ...h.filter((s) => s.id !== result.source.id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
    } finally {
      setBusy(false);
    }
  }

  async function applyDuration() {
    if (!source) return;
    const durationSec = Number(durationInput);
    if (!(durationSec > 0)) {
      setError("Enter duration in seconds (e.g. 19 or 612)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await reanalyzeSourceDuration({
        data: { sourceId: source.id, durationSec },
      });
      setSource(result.source);
      setMoments(result.moments);
      setDurationEstimated(false);
      setDurationInput(String(result.source.durationSec));
      setHistory((h) => [result.source, ...h.filter((s) => s.id !== result.source.id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update duration");
    } finally {
      setBusy(false);
    }
  }

  async function makeClip(momentId: string) {
    setBusy(true);
    setError(null);
    try {
      const clip = await createClipFromMoment({ data: { momentId, aspect: "9:16" } });
      void navigate({ to: "/clip/$clipId", params: { clipId: clip.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create clip");
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Clipping suite"
      action={
        <Link to="/clips" className="cos-btn secondary">
          View exports
        </Link>
      }
    >
      <div className="cos-clip-hero">
        <section className="cos-panel">
          <h2>Paste a YouTube URL</h2>
          <p className="sub">
            We pull metadata + chapters when available, rank Shorts-length viral windows (≈15–35s),
            and open the editor with hard in/out points.
          </p>
          <div className="cos-url-bar">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              onKeyDown={(e) => {
                if (e.key === "Enter") void analyze();
              }}
            />
            <button type="button" className="cos-btn" disabled={busy || !url.trim()} onClick={() => void analyze()}>
              <Sparkles size={16} />
              {busy ? "Analyzing…" : "Analyze"}
            </button>
          </div>
          {error ? (
            <p className="cos-error" style={{ marginTop: 12 }}>
              {error}
            </p>
          ) : null}

          {source ? (
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "160px 1fr", gap: 14 }}>
              <img className="cos-thumb" src={source.thumbnailUrl ?? undefined} alt="" />
              <div>
                <h2 style={{ fontSize: "1.2rem" }}>{source.title}</h2>
                <p className="sub">
                  {source.channelTitle ?? "YouTube"} · {formatTimecode(source.durationSec)}
                  {durationEstimated ? " (estimated)" : ""} · {source.youtubeId}
                </p>
                {durationEstimated ? (
                  <p className="sub" style={{ color: "var(--color-lime)" }}>
                    Exact runtime was blocked by YouTube — set the real length to rebuild moment windows.
                  </p>
                ) : null}
                <div className="cos-form-grid" style={{ marginTop: 12, maxWidth: 420 }}>
                  <div className="cos-field">
                    <label htmlFor="dur">Duration (seconds)</label>
                    <input
                      id="dur"
                      type="number"
                      min={1}
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                    />
                  </div>
                  <div className="cos-field" style={{ alignSelf: "end" }}>
                    <button
                      type="button"
                      className="cos-btn secondary"
                      disabled={busy}
                      onClick={() => void applyDuration()}
                    >
                      Rebuild moments
                    </button>
                  </div>
                </div>
                <a
                  className="cos-btn ghost"
                  href={source.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginTop: 8, display: "inline-flex" }}
                >
                  Open source
                </a>
              </div>
            </div>
          ) : null}

          {moments.length ? (
            <div className="cos-moments">
              {moments.map((m, i) => {
                const dur = Math.max(0, m.endSec - m.startSec);
                const watchAt = source
                  ? `${source.youtubeUrl}${source.youtubeUrl.includes("?") ? "&" : "?"}t=${Math.floor(m.startSec)}s`
                  : null;
                return (
                  <article key={m.id} className="cos-moment" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className="score">{Math.round(m.score * 100)}</div>
                    <div>
                      <span className="cos-pill">{reasonLabel(m.reasonType)}</span>
                      <strong style={{ display: "block", marginTop: 8 }}>
                        {formatTimecode(m.startSec)} → {formatTimecode(m.endSec)}
                        <span className="sub" style={{ marginLeft: 8 }}>
                          · {Math.round(dur)}s cut
                          {dur > 40 ? " (trim later)" : ""}
                        </span>
                      </strong>
                      <p>{m.reasonText}</p>
                      {watchAt ? (
                        <a
                          className="sub"
                          href={watchAt}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--color-lime)" }}
                        >
                          Preview on YouTube at IN
                        </a>
                      ) : null}
                    </div>
                    <button type="button" className="cos-btn" disabled={busy} onClick={() => void makeClip(m.id)}>
                      <Scissors size={15} /> Make clip
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="cos-panel">
          <h2>Recent sources</h2>
          <p className="sub">Demo seed + anything you’ve analyzed this session.</p>
          <div className="cos-list">
            {history.slice(0, 6).map((s) => (
              <button
                key={s.id}
                type="button"
                className="cos-row"
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: 0,
                  color: "inherit",
                }}
                onClick={() => {
                  setUrl(s.youtubeUrl);
                  setSource(s);
                  setMoments([]);
                  setDurationInput(String(s.durationSec));
                  void analyzeYoutube({ data: { url: s.youtubeUrl } })
                    .then((result) => {
                      setSource(result.source);
                      setMoments(result.moments);
                      setDurationEstimated(Boolean(result.durationEstimated));
                      setDurationInput(String(result.source.durationSec));
                    })
                    .catch((err) => setError(err instanceof Error ? err.message : "Reload failed"));
                }}
              >
                <div>
                  <strong>{s.title}</strong>
                  <small>
                    {s.channelTitle ?? "YouTube"} · {formatTimecode(s.durationSec)}
                  </small>
                </div>
                <span className="cos-pill muted">Reload</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
