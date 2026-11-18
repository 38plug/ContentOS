import { useEffect, useRef, useState } from "react";
import { formatTimecode } from "@/lib/contentos/types";

type Props = {
  durationSec: number;
  inSec: number;
  outSec: number;
  playheadSec: number;
  onChange: (next: { inSec: number; outSec: number }) => void;
  onScrub: (sec: number) => void;
};

export function ClipTimeline({ durationSec, inSec, outSec, playheadSec, onChange, onScrub }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"in" | "out" | "range" | "play" | null>(null);
  const dragOrigin = useRef({ x: 0, inSec: 0, outSec: 0 });

  const duration = Math.max(durationSec, outSec, 1);
  const leftPct = (inSec / duration) * 100;
  const widthPct = ((outSec - inSec) / duration) * 100;
  const playPct = (playheadSec / duration) * 100;

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const sec = ratio * duration;
      if (drag === "play") {
        onScrub(sec);
        return;
      }
      if (drag === "in") {
        onChange({ inSec: Math.min(sec, outSec - 1), outSec });
        return;
      }
      if (drag === "out") {
        onChange({ inSec, outSec: Math.max(sec, inSec + 1) });
        return;
      }
      if (drag === "range") {
        const deltaSec = ((e.clientX - dragOrigin.current.x) / rect.width) * duration;
        const span = dragOrigin.current.outSec - dragOrigin.current.inSec;
        let nextIn = dragOrigin.current.inSec + deltaSec;
        let nextOut = nextIn + span;
        if (nextIn < 0) {
          nextIn = 0;
          nextOut = span;
        }
        if (nextOut > duration) {
          nextOut = duration;
          nextIn = duration - span;
        }
        onChange({ inSec: nextIn, outSec: nextOut });
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, duration, inSec, outSec, onChange, onScrub]);

  return (
    <div className="cos-timeline">
      <div className="cos-timeline-meta">
        <span>IN {formatTimecode(inSec)}</span>
        <span>
          DUR {formatTimecode(outSec - inSec)} · SRC {formatTimecode(duration)}
        </span>
        <span>OUT {formatTimecode(outSec)}</span>
      </div>
      <div
        ref={trackRef}
        className="cos-timeline-track"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).dataset.handle) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
          onScrub(ratio * duration);
          setDrag("play");
        }}
      >
        <div className="cos-timeline-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <i key={i} style={{ left: `${(i / 8) * 100}%` }} />
          ))}
        </div>
        <div
          className="cos-timeline-range"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragOrigin.current = { x: e.clientX, inSec, outSec };
            setDrag("range");
          }}
        >
          <button
            type="button"
            className="cos-handle in"
            data-handle="in"
            aria-label="Set in point"
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag("in");
            }}
          />
          <button
            type="button"
            className="cos-handle out"
            data-handle="out"
            aria-label="Set out point"
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag("out");
            }}
          />
        </div>
        <div className="cos-playhead" style={{ left: `${playPct}%` }} />
      </div>
    </div>
  );
}
