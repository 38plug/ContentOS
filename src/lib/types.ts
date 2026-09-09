export type Company = "hireflow" | "qrrupt";
export type Scope = Company | "atlas";

export type Candidate = {
  id: string;
  createdAt: string;
  name: string;
  status: string;
  appliedFor: string;
  companyCountry: string;
  market: string;
  communicationMode: string;
  source: string;
  job?: string;
  nationality?: string;
  location?: string;
};

export type Job = {
  id: string;
  createdAt: string;
  title: string;
  employer: string;
  location: string;
  vacancies: number;
  applicants: number;
  status: string;
  market?: string;
};

export type Employer = {
  id: string;
  createdAt: string;
  name: string;
  country: string;
  city: string;
  industry: string;
  status: string;
};

export type Interview = {
  id: string;
  createdAt: string;
  time: string;
  date: string;
  candidate: string;
  job: string;
  status: string;
};

export type DeskTask = {
  id: string;
  createdAt: string;
  title: string;
  due?: string;
  assignee: string;
  status: "todo" | "inprogress" | "done" | "Pending";
  description?: string;
  company: Company;
  tag?: string;
};

export type FinanceEntry = {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  person: string;
  category: string;
  description: string;
  createdAt: number;
};

export type Meeting = {
  id: string;
  date: string;
  time: string;
  title: string;
  agenda: string;
  person: string;
  attendees: string[];
  createdAt: number;
};

export type CalEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  notes: string;
  person: string;
  repeat: string;
  important: boolean;
  repeatDay?: number;
  createdAt: number;
};

export type KnowledgeNode = {
  id: string;
  company: Scope;
  kind: "memory" | "skill" | "lesson";
  title: string;
  detail: string;
  createdAt: string;
};

export type AgentId =
  | "jarvis"
  | "hf-ops"
  | "hf-front"
  | "qr-ledger"
  | "qr-ops"
  | "muse"
  | "coder"
  | "scout";

export type SubAgent = {
  id: AgentId;
  name: string;
  title: string;
  company: Scope;
  status: "idle" | "working" | "blocked";
  currentTask: string | null;
  queue: string[];
};

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  agent: AgentId;
};

export type InboxMsg = {
  id: string;
  name: string;
  handle: string;
  message: string;
  date: string;
};
