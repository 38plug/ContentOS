import { useMemo } from "react";
import { askJarvis, type JarvisSnapshot } from "./ask-jarvis";
import { cashOf, useConsole } from "./console-store";
import { jarvisFallback, runLocalIntent } from "./local-intent";
import type { AgentId } from "./types";

export function useJarvisSnapshot(): JarvisSnapshot {
  const operator = useConsole((s) => s.operator);
  const currency = useConsole((s) => s.currency);
  const finance = useConsole((s) => s.finance);
  const jobs = useConsole((s) => s.jobs);
  const candidates = useConsole((s) => s.candidates);
  const interviews = useConsole((s) => s.interviews);
  const tasks = useConsole((s) => s.tasks);
  return useMemo(
    () => ({
      operator,
      currency,
      cash: cashOf(finance),
      income: finance.filter((e) => e.type === "income").reduce((n, e) => n + e.amount, 0),
      expense: finance.filter((e) => e.type === "expense").reduce((n, e) => n + e.amount, 0),
      openJobs: jobs.filter((j) => j.status === "Active").length,
      candidates: candidates.length,
      interviewsToday: interviews.map((i) => `${i.time} ${i.candidate} (${i.status})`),
      hireflowTasks: tasks.filter((t) => t.company === "hireflow" && t.status !== "done").map((t) => t.title),
      qrruptTasks: tasks.filter((t) => t.company === "qrrupt" && t.status !== "done").map((t) => t.title),
      lastFinance: finance.slice(0, 4).map((e) => `${e.type} ${e.amount} ${e.description}`),
    }),
    [operator, currency, finance, jobs, candidates, interviews, tasks],
  );
}

export async function converse(
  message: string,
  snapshot: JarvisSnapshot,
  spoken = false,
): Promise<{ text: string; agent: AgentId; source: "local" | "model" }> {
  const local = runLocalIntent(message);
  if (local) return { text: local.reply, agent: local.agent, source: "local" };
  try {
    const res = await askJarvis({ data: { message, snapshot, spoken } });
    if (res.ok && res.text.trim()) return { text: res.text.trim(), agent: "jarvis", source: "model" };
  } catch {
    /* local core */
  }
  return { text: jarvisFallback(message, snapshot), agent: "jarvis", source: "local" };
}
