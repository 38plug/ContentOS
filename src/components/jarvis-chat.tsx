import { Link } from "@tanstack/react-router";
import { Mic, Send, Volume2 } from "lucide-react";
import { useState } from "react";
import { converse, useJarvisSnapshot } from "@/lib/jarvis-session";
import { speakAloud } from "@/lib/speak";
import { useConsole } from "@/lib/console-store";

export function JarvisChat() {
  const chat = useConsole((s) => s.chat);
  const pushChat = useConsole((s) => s.pushChat);
  const snapshot = useJarvisSnapshot();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const message = text.trim();
    if (!message || busy) return;
    setText("");
    pushChat({ role: "user", text: message, agent: "jarvis" });
    setBusy(true);
    try {
      const reply = await converse(message, snapshot, false);
      pushChat({ role: "assistant", text: reply.text, agent: reply.agent });
    } finally {
      setBusy(false);
    }
  }

  const last = [...chat].reverse().find((m) => m.role === "assistant");

  return (
    <section className="rounded-lg border border-line bg-surface flex flex-col min-h-80">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">JARVIS</h2>
          <p className="text-xs text-muted mt-0.5">Chief of staff · dual desk · voice ready</p>
        </div>
        <Link
          to="/voice"
          className="inline-flex items-center gap-2 min-h-11 px-3 rounded-md bg-accent text-bg text-xs font-semibold"
        >
          <Mic className="size-4" /> Voice
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
        {chat.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={
                m.role === "user"
                  ? "inline-block max-w-[90%] rounded-md bg-elevated px-3 py-2 text-sm"
                  : "inline-block max-w-[90%] rounded-md bg-accent-dim px-3 py-2 text-sm text-fg"
              }
            >
              {m.role === "assistant" ? (
                <div className="text-[10px] uppercase tracking-wider text-accent mb-1">{m.agent}</div>
              ) : null}
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 p-3 border-t border-line"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className="flex-1 min-h-11 rounded-md bg-bg border border-line px-3 text-sm text-fg outline-none focus:border-accent"
          placeholder="Ask anything — or open Voice"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {last ? (
          <button
            type="button"
            className="size-11 grid place-items-center rounded-md border border-line bg-elevated"
            aria-label="Speak last reply"
            onClick={() => void speakAloud(last.text)}
          >
            <Volume2 className="size-4" />
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="size-11 grid place-items-center rounded-md bg-accent text-bg disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
