import { cashOf, useConsole } from "./console-store";
import { MARKETS, ROLES } from "./seeds";
import type { JarvisSnapshot } from "./ask-jarvis";
import type { AgentId, Company } from "./types";

export type LocalResult = {
  reply: string;
  agent: AgentId;
  company: Company | "atlas";
};

export function runLocalIntent(raw: string): LocalResult | null {
  const text = raw.trim();
  const t = text.toLowerCase();
  const store = useConsole.getState();

  if (/\b(awake|you there|you up|online|hello|hey jarvis|hi jarvis|good morning|good evening)\b/.test(t) || /^(hi|hey|hello|jarvis)\??$/.test(t)) {
    const cash = cashOf(store.finance);
    const open = store.jobs.filter((j) => j.status === "Active").length;
    return {
      agent: "jarvis",
      company: "atlas",
      reply: `Online. Dual desk is live. HireFlow ${open} jobs, Qrrupt ${store.currency}${cash} on the books. What do you need, Plug?`,
    };
  }

  if (/^(brief|status|report|what's stuck|whats stuck)/.test(t) || t === "brief") {
    const cash = cashOf(store.finance);
    const open = store.jobs.filter((j) => j.status === "Active").length;
    const pending = store.interviews.filter((i) => i.status !== "Confirmed").length;
    const todo = store.tasks.filter((x) => x.status !== "done").length;
    return {
      agent: "jarvis",
      company: "atlas",
      reply: `08:30 desk. HireFlow: ${open} active jobs, ${store.candidates.length} candidates, ${pending} interviews not confirmed. Qrrupt cash ${store.currency}${cash}. ${todo} open tasks. One decision: tell me GO on anything that spends or emails a client.`,
    };
  }

  const money = text.match(
    /\b(income|expense|paid|spent|got|received)\b.*?(\d+(?:\.\d+)?)(?:\s*(?:usd|\$))?.*?(?:for|on|-)?\s*(.*)$/i,
  );
  if (/\b(income|expense|paid|spent|got|received|add (an )?expense|add income)\b/.test(t) && /(\d+)/.test(t)) {
    const amount = Number((text.match(/(\d+(?:\.\d+)?)/) || [])[1] || 0);
    const isIncome = /\b(income|got|received|commission|salary)\b/.test(t);
    const desc = (money?.[3] || text).slice(0, 80);
    store.addFinance({
      date: new Date().toISOString().slice(0, 10),
      type: isIncome ? "income" : "expense",
      amount,
      person: "Plug",
      category: isIncome ? "Services" : "Other",
      description: desc || (isIncome ? "Income" : "Expense"),
    });
    store.assignAgent("qr-ledger", `${isIncome ? "Income" : "Expense"} ${amount}`);
    return {
      agent: "qr-ledger",
      company: "qrrupt",
      reply: `Logged ${isIncome ? "income" : "expense"} ${store.currency}${amount}. Books now ${store.currency}${cashOf(useConsole.getState().finance)}. I did not pay anyone.`,
    };
  }

  const cand = text.match(/add candidate[:\s]+(.+)/i);
  if (cand) {
    const name = cand[1].trim();
    store.addCandidate({
      name,
      status: "New Applicant",
      appliedFor: ROLES[2],
      companyCountry: "Vietnam",
      market: MARKETS[2],
      communicationMode: "Only Call",
      source: "JARVIS",
    });
    store.assignAgent("hf-ops", `Intake ${name}`);
    return {
      agent: "hf-ops",
      company: "hireflow",
      reply: `${name} is on the HireFlow desk as New Applicant / Call Center. Open Register if you want market and mode changed.`,
    };
  }

  const job = text.match(/add job[:\s]+(.+)/i);
  if (job) {
    const title = job[1].trim();
    store.addJob({
      title,
      employer: "Nova Commerce",
      location: "Ho Chi Minh City, Vietnam",
      vacancies: 1,
      applicants: 0,
      status: "Active",
      market: "Crypto",
    });
    store.assignAgent("hf-ops", `Open ${title}`);
    return {
      agent: "hf-ops",
      company: "hireflow",
      reply: `Job “${title}” opened under Nova Commerce. HF-OPS owns pipeline.`,
    };
  }

  if (/cash|balance|runway|p&l|pnl/.test(t) && !/candidate|job/.test(t)) {
    const cash = cashOf(store.finance);
    const inSum = store.finance.filter((e) => e.type === "income").reduce((n, e) => n + e.amount, 0);
    const out = store.finance.filter((e) => e.type === "expense").reduce((n, e) => n + e.amount, 0);
    return {
      agent: "qr-ledger",
      company: "qrrupt",
      reply: `Qrrupt books: in ${store.currency}${inSum}, out ${store.currency}${out}, net ${store.currency}${cash}. ${store.finance.length} lines from your 31 Aug backup plus anything we logged after. No wallet keys in this console.`,
    };
  }

  return null;
}

export function jarvisFallback(raw: string, snap: JarvisSnapshot): string {
  const t = raw.toLowerCase();
  if (/\b(awake|there|online|hello|hi|hey|you up|good morning|good evening|jarvis)\b/.test(t)) {
    return `Online. Dual desk is live. HireFlow ${snap.openJobs} jobs, Qrrupt ${snap.currency}${snap.cash} on the books. What do you need, Plug?`;
  }
  if (/\b(who are you|what are you|your name)\b/.test(t)) {
    return `JARVIS. Chief of staff for HireFlow and Qrrupt. I route. Specialists execute. I do not mix the two companies.`;
  }
  if (/\b(help|what can you|commands|how do)\b/.test(t)) {
    return `Say brief, cash, add expense 40 ads, add candidate Ana, or open voice mode and just talk. GO before money or client mail.`;
  }
  if (/\b(thank|thanks)\b/.test(t)) {
    return `On it. I'll stay on the desk.`;
  }
  const stuck = [...snap.hireflowTasks, ...snap.qrruptTasks].slice(0, 2);
  return `Heard. ${stuck.length ? `On the board: ${stuck.join("; ")}.` : "Desk is quiet."} HireFlow ${snap.candidates} candidates, Qrrupt ${snap.currency}${snap.cash}. Tell me the move.`;
}

