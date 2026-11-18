import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Scissors, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import {
  analyzeYoutube,
  createClipFromMoment,
  listSources,
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

  useEffect(() => {
    void listSources()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  async function analyze() {
    setBusy(true);
    setError(null);
    try {
      const result = await analyzeYoutube({ data: { url } });
      setSource(result.source);
      setMoments(result.moments);
      setDurationEstimated(Boolean(result.durationEstimated));
      setHistory((h) => [result.source, ...h.filter((s) => s.id !== result.source.id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
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
            We pull metadata, rank viral-moment candidates, and open the editor with in/out points.
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
          {error ? <p className="cos-error" style={{ marginTop: 12 }}>{error}</p> : null}

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
                    Exact runtime was blocked by YouTube metadata — moments use an estimated length. Trim precisely in the
                    editor.
                  </p>
                ) : null}
                <a className="cos-btn ghost" href={source.youtubeUrl} target="_blank" rel="noreferrer" style={{ marginTop: 8, display: "inline-flex" }}>
                  Open source
                </a>
              </div>
            </div>
          ) : null}

          {moments.length ? (
            <div className="cos-moments">
              {moments.map((m, i) => (
                <article key={m.id} className="cos-moment" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="score">{Math.round(m.score * 100)}</div>
                  <div>
                    <span className="cos-pill">{reasonLabel(m.reasonType)}</span>
                    <strong style={{ display: "block", marginTop: 8 }}>
                      {formatTimecode(m.startSec)} → {formatTimecode(m.endSec)}
                    </strong>
                    <p>{m.reasonText}</p>
                  </div>
                  <button type="button" className="cos-btn" disabled={busy} onClick={() => void makeClip(m.id)}>
                    <Scissors size={15} /> Make clip
                  </button>
                </article>
              ))}
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
                style={{ width: "100%", textAlign: "left", background: "transparent", border: 0, color: "inherit" }}
                onClick={() => {
                  setUrl(s.youtubeUrl);
                  setSource(s);
                  setMoments([]);
                  void analyzeYoutube({ data: { url: s.youtubeUrl } })
                    .then((result) => {
                      setSource(result.source);
                      setMoments(result.moments);
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
