import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./id";
import {
  seedAgents,
  seedCalendar,
  seedCandidates,
  seedEmployers,
  seedFinance,
  seedInterviews,
  seedJobs,
  seedKnowledge,
  seedMeetings,
  seedTasks,
} from "./seeds";
import type {
  AgentId,
  CalEvent,
  Candidate,
  ChatMsg,
  Company,
  DeskTask,
  Employer,
  FinanceEntry,
  InboxMsg,
  Interview,
  Job,
  KnowledgeNode,
  Meeting,
  SubAgent,
} from "./types";

type ConsoleState = {
  candidates: Candidate[];
  jobs: Job[];
  employers: Employer[];
  interviews: Interview[];
  tasks: DeskTask[];
  finance: FinanceEntry[];
  meetings: Meeting[];
  calendar: CalEvent[];
  knowledge: KnowledgeNode[];
  agents: SubAgent[];
  chat: ChatMsg[];
  inbox: InboxMsg[];
  currency: string;
  operator: string;
  addCandidate: (input: Omit<Candidate, "id" | "createdAt">) => Candidate;
  addJob: (input: Omit<Job, "id" | "createdAt">) => Job;
  addEmployer: (input: Omit<Employer, "id" | "createdAt">) => Employer;
  addInterview: (input: Omit<Interview, "id" | "createdAt">) => Interview;
  addTask: (input: Omit<DeskTask, "id" | "createdAt">) => DeskTask;
  setTaskStatus: (id: string, status: DeskTask["status"]) => void;
  addFinance: (input: Omit<FinanceEntry, "id" | "createdAt">) => FinanceEntry;
  addMeeting: (input: Omit<Meeting, "id" | "createdAt">) => Meeting;
  addEvent: (input: Omit<CalEvent, "id" | "createdAt">) => CalEvent;
  learn: (node: Omit<KnowledgeNode, "id" | "createdAt">) => void;
  pushChat: (msg: Omit<ChatMsg, "id" | "createdAt">) => void;
  assignAgent: (id: AgentId, task: string) => void;
  clearAgent: (id: AgentId) => void;
  addInbox: (msg: Omit<InboxMsg, "id" | "date">) => void;
};

function stamp<T extends { id: string; createdAt: string }>(
  prefix: string,
  input: Omit<T, "id" | "createdAt">,
): T {
  return { ...(input as T), id: uid(prefix), createdAt: new Date().toISOString() };
}

export const useConsole = create<ConsoleState>()(
  persist(
    (set, get) => ({
      candidates: seedCandidates,
      jobs: seedJobs,
      employers: seedEmployers,
      interviews: seedInterviews,
      tasks: seedTasks,
      finance: seedFinance,
      meetings: seedMeetings,
      calendar: seedCalendar,
      knowledge: seedKnowledge,
      agents: seedAgents,
      chat: [
        {
          id: "c0",
          role: "assistant",
          agent: "jarvis",
          createdAt: new Date().toISOString(),
          text: "Plug. Dual desk is live. HireFlow pipeline on the left, Qrrupt books on the right. I will not mix them. Ask for the brief, a hire, or a cash move.",
        },
      ],
      inbox: [],
      currency: "$",
      operator: "Plug",
      addCandidate: (input) => {
        const item = stamp<Candidate>("cand", input);
        set((s) => ({ candidates: [item, ...s.candidates] }));
        get().learn({
          company: "hireflow",
          kind: "memory",
          title: `Candidate ${item.name}`,
          detail: `${item.appliedFor} · ${item.market} · ${item.status}`,
        });
        return item;
      },
      addJob: (input) => {
        const item = stamp<Job>("job", input);
        set((s) => ({ jobs: [item, ...s.jobs] }));
        get().learn({
          company: "hireflow",
          kind: "memory",
          title: `Job ${item.title}`,
          detail: `${item.employer} · ${item.vacancies} seats · ${item.location}`,
        });
        return item;
      },
      addEmployer: (input) => {
        const item = stamp<Employer>("emp", input);
        set((s) => ({ employers: [item, ...s.employers] }));
        return item;
      },
      addInterview: (input) => {
        const item = stamp<Interview>("int", input);
        set((s) => ({ interviews: [item, ...s.interviews] }));
        return item;
      },
      addTask: (input) => {
        const item = stamp<DeskTask>("task", input);
        set((s) => ({ tasks: [item, ...s.tasks] }));
        return item;
      },
      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      addFinance: (input) => {
        const item: FinanceEntry = {
          ...input,
          id: uid("fin"),
          createdAt: Date.now(),
        };
        set((s) => ({ finance: [item, ...s.finance] }));
        get().learn({
          company: "qrrupt",
          kind: "memory",
          title: `${item.type} ${item.amount}`,
          detail: `${item.category} · ${item.description} · ${item.date}`,
        });
        return item;
      },
      addMeeting: (input) => {
        const item: Meeting = { ...input, id: uid("mtg"), createdAt: Date.now() };
        set((s) => ({ meetings: [item, ...s.meetings] }));
        return item;
      },
      addEvent: (input) => {
        const item: CalEvent = { ...input, id: uid("cal"), createdAt: Date.now() };
        set((s) => ({ calendar: [item, ...s.calendar] }));
        return item;
      },
      learn: (node) => {
        const item: KnowledgeNode = {
          ...node,
          id: uid("k"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ knowledge: [...s.knowledge, item].slice(-80) }));
      },
      pushChat: (msg) => {
        const item: ChatMsg = {
          ...msg,
          id: uid("msg"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ chat: [...s.chat, item].slice(-80) }));
      },
      assignAgent: (id, task) =>
        set((s) => ({
          agents: s.agents.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "working",
                  currentTask: task,
                  queue: [task, ...a.queue].slice(0, 8),
                }
              : a,
          ),
        })),
      clearAgent: (id) =>
        set((s) => ({
          agents: s.agents.map((a) =>
            a.id === id ? { ...a, status: "idle", currentTask: null } : a,
          ),
        })),
      addInbox: (msg) =>
        set((s) => ({
          inbox: [{ ...msg, id: uid("in"), date: new Date().toISOString() }, ...s.inbox],
        })),
    }),
    { name: "atlas-consoles-v1" },
  ),
);

export function cashOf(finance: FinanceEntry[]) {
  return finance.reduce((n, e) => n + (e.type === "income" ? e.amount : -e.amount), 0);
}

export function companyOfMessage(text: string): Company | "atlas" {
  const t = text.toLowerCase();
  const hf = /hireflow|candidate|job|interview|employer|pipeline|placement|telegram/.test(t);
  const qr = /qrrupt|cash|pay|invoice|salary|expense|income|ledger|p&l|ads|drop/.test(t);
  if (hf && !qr) return "hireflow";
  if (qr && !hf) return "qrrupt";
  return "atlas";
}
