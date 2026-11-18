import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import { listClips } from "@/lib/contentos/server";
import type { Clip } from "@/lib/contentos/types";
import { formatTimecode } from "@/lib/contentos/types";

export const Route = createFileRoute("/clips")({ component: ClipsPage });

function ClipsPage() {
  return (
    <AuthGate>
      <ClipsView />
    </AuthGate>
  );
}

function ClipsView() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listClips()
      .then(setClips)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load clips"));
  }, []);

  return (
    <AppShell
      title="Clip exports"
      action={
        <Link to="/clip" className="cos-btn">
          New analysis
        </Link>
      }
    >
      {error ? <p className="cos-error">{error}</p> : null}
      <section className="cos-panel">
        <h2>Ready packages</h2>
        <p className="sub">Edit decisions, aspect, and growth copy stored per clip.</p>
        <div className="cos-list">
          {clips.map((clip) => (
            <Link key={clip.id} to="/clip/$clipId" params={{ clipId: clip.id }} className="cos-row">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {clip.source?.thumbnailUrl ? (
                  <img
                    src={clip.source.thumbnailUrl}
                    alt=""
                    width={72}
                    height={40}
                    style={{ borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-line)" }}
                  />
                ) : null}
                <div>
                  <strong>{clip.title}</strong>
                  <small>
                    {formatTimecode(clip.inSec)}–{formatTimecode(clip.outSec)} · {clip.aspect} ·{" "}
                    {clip.exportPackage.fileName}
                  </small>
                </div>
              </div>
              <span className="cos-pill">{clip.exportPackage.mediaStatus}</span>
            </Link>
          ))}
          {!clips.length && !error ? <p className="sub">No clips yet.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
