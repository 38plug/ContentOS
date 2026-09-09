import { createServerFn } from "@tanstack/react-start";

export type JarvisSnapshot = {
  operator: string;
  currency: string;
  cash: number;
  income: number;
  expense: number;
  openJobs: number;
  candidates: number;
  interviewsToday: string[];
  hireflowTasks: string[];
  qrruptTasks: string[];
  lastFinance: string[];
};

function apiKey() {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY || "";
}

function systemPrompt(s: JarvisSnapshot) {
  return `You are JARVIS, chief of staff for Plug. Two isolated companies:
HIREFLOW = recruitment agency (jobs, candidates, interviews, employers, Telegram intake).
QRRUPT = clothing / holding finance console (cash, income, expense, paydays, tasks).
Never mix candidate names into Qrrupt money talk, or bank figures into client mail.
Voice: short, dry, precise. Address Plug. No emoji. No corporate filler.
If a specialist should own it, say which: HF-OPS, HF-FRONT, QR-LEDGER, QR-OPS, MUSE, CODER, SCOUT.
GO required: paying anyone, sending client mail, production deploy.
You are awake and on duty. Answer the human. Spoken replies must be one or two short sentences.
Snapshot:
- cash ${s.currency}${s.cash} (in ${s.income} / out ${s.expense})
- HireFlow: ${s.openJobs} jobs, ${s.candidates} candidates
- Interviews: ${s.interviewsToday.join("; ") || "none listed"}
- HF tasks: ${s.hireflowTasks.join("; ") || "none"}
- QR tasks: ${s.qrruptTasks.join("; ") || "none"}
- Recent books: ${s.lastFinance.join("; ") || "none"}`;
}

export const askJarvis = createServerFn({ method: "POST" })
  .validator((input: { message: string; snapshot: JarvisSnapshot; spoken?: boolean }) => input)
  .handler(async ({ data }) => {
    const key = apiKey();
    if (!key) return { ok: false as const, error: "no-key" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: data.spoken ? 180 : 420,
        messages: [
          { role: "system", content: systemPrompt(data.snapshot) },
          { role: "user", content: data.message.slice(0, 2000) },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false as const, error: `xAI ${res.status}${detail ? `: ${detail.slice(0, 80)}` : ""}` };
    }
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });

export const speakJarvis = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => input)
  .handler(async ({ data }) => {
    const key = apiKey();
    if (!key) return { ok: false as const, error: "no-key" };
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, 400);
    if (!text) return { ok: false as const, error: "empty" };

    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ text, voice_id: "rex", language: "en" }),
    });
    if (!res.ok) return { ok: false as const, error: `tts ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "audio/mpeg";
    return { ok: true as const, mime, b64: buf.toString("base64") };
  });
