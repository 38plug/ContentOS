import { Link } from "@tanstack/react-router";
import { Mic, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { converse, useJarvisSnapshot } from "@/lib/jarvis-session";
import { silence, speakAloud } from "@/lib/speak";
import { useConsole } from "@/lib/console-store";
import { cn } from "@/lib/cn";

type Phase = "idle" | "listening" | "thinking" | "speaking";

type Recog = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function makeRecog(): Recog | null {
  const C =
    typeof window !== "undefined" &&
    ((window as unknown as { SpeechRecognition?: new () => Recog }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => Recog }).webkitSpeechRecognition);
  if (!C) return null;
  const r = new C();
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = false;
  return r;
}

export function VoiceHud() {
  const snapshot = useJarvisSnapshot();
  const pushChat = useConsole((s) => s.pushChat);
  const learn = useConsole((s) => s.learn);
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [spoken, setSpoken] = useState("Systems online. Tap the core and speak.");
  const [err, setErr] = useState("");
  const recogRef = useRef<Recog | null>(null);
  const hold = useRef(false);

  useEffect(() => {
    const r = makeRecog();
    recogRef.current = r;
    if (!r) setErr("This browser has no speech recognition. Use Chrome or Edge, or type on Command.");
    return () => {
      hold.current = false;
      try {
        r?.stop();
      } catch {
        /* closed */
      }
      silence();
    };
  }, []);

  async function handleUtterance(text: string) {
    const message = text.trim();
    if (!message) {
      setPhase("idle");
      return;
    }
    setHeard(message);
    setPhase("thinking");
    pushChat({ role: "user", text: message, agent: "jarvis" });
    const reply = await converse(message, snapshot, true);
    pushChat({ role: "assistant", text: reply.text, agent: reply.agent });
    learn({
      company: "atlas",
      kind: "memory",
      title: `Voice: ${message.slice(0, 40)}`,
      detail: reply.text.slice(0, 160),
    });
    setSpoken(reply.text);
    setPhase("speaking");
    await speakAloud(reply.text);
    setPhase("idle");
  }

  function listen() {
    const r = recogRef.current;
    if (!r || phase === "thinking" || phase === "speaking") return;
    silence();
    setErr("");
    setHeard("");
    setPhase("listening");
    hold.current = true;
    r.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1] as unknown as {
        isFinal?: boolean;
        0?: { transcript: string };
      };
      const t = last?.[0]?.transcript ?? "";
      setHeard(t);
      if (last?.isFinal && t.trim()) {
        hold.current = false;
        try {
          r.stop();
        } catch {
          /* already */
        }
        void handleUtterance(t);
      }
    };
    r.onerror = (ev) => {
      hold.current = false;
      setPhase("idle");
      if (ev.error === "not-allowed") setErr("Mic blocked. Allow microphone for this site.");
      else if (ev.error !== "aborted") setErr(`Mic: ${ev.error}`);
    };
    r.onend = () => {
      if (hold.current) {
        hold.current = false;
        setPhase("idle");
      }
    };
    try {
      r.start();
    } catch {
      setPhase("idle");
    }
  }

  function stop() {
    hold.current = false;
    try {
      recogRef.current?.stop();
    } catch {
      /* ok */
    }
    silence();
    setPhase("idle");
  }

  const label =
    phase === "listening"
      ? "LISTENING"
      : phase === "thinking"
        ? "PROCESSING"
        : phase === "speaking"
          ? "SPEAKING"
          : "STANDBY";

  return (
    <div className="voice-stage min-h-dvh flex flex-col items-center px-4 py-6">
      <header className="w-full max-w-3xl flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-accent">ATLAS // VOICE</div>
          <div className="font-mono text-xs text-muted mt-1">{label}</div>
        </div>
        <Link
          to="/"
          className="size-11 grid place-items-center rounded-full border border-line bg-surface"
          aria-label="Close voice mode"
          onClick={() => stop()}
        >
          <X className="size-4" />
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
        <button
          className={cn("voice-orb", `is-${phase}`)}
          onClick={() => (phase === "listening" || phase === "speaking" ? stop() : listen())}
          aria-label={phase === "listening" ? "Stop listening" : "Start listening"}
        >
          <span className="voice-ring r1" />
          <span className="voice-ring r2" />
          <span className="voice-ring r3" />
          <span className="voice-core" />
        </button>

        <div className="voice-wave" data-active={phase === "listening" || phase === "speaking" ? "1" : "0"}>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>

        <div className="max-w-lg text-center min-h-24">
          {heard ? <p className="text-sm text-muted mb-2">You: {heard}</p> : null}
          <p className="text-lg sm:text-xl font-medium leading-relaxed">{spoken}</p>
        </div>
      </div>

      <div className="w-full max-w-md flex gap-3 pb-4">
        <button
          className="flex-1 min-h-12 rounded-md bg-accent text-bg font-semibold flex items-center justify-center gap-2"
          onClick={() => (phase === "listening" ? stop() : listen())}
        >
          {phase === "listening" ? <Square className="size-4" /> : <Mic className="size-4" />}
          {phase === "listening" ? "Stop" : "Talk to JARVIS"}
        </button>
      </div>
      {err ? <p className="text-xs text-danger pb-4">{err}</p> : null}
    </div>
  );
}
