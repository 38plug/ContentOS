import type {
  CalEvent,
  Candidate,
  DeskTask,
  Employer,
  FinanceEntry,
  Interview,
  Job,
  KnowledgeNode,
  Meeting,
  SubAgent,
} from "./types";

const now = "2026-08-31T12:00:00.000Z";

export const seedCandidates: Candidate[] = [
  {
    id: "cand-1",
    createdAt: now,
    name: "John Smith",
    status: "Screening",
    appliedFor: "Call Center",
    companyCountry: "Vietnam",
    market: "Crypto",
    communicationMode: "Only Call",
    source: "Telegram",
    job: "Sales Agent",
    nationality: "Brazilian",
    location: "Vietnam",
  },
  {
    id: "cand-2",
    createdAt: now,
    name: "Camila Rodrigues",
    status: "Interview Scheduled",
    appliedFor: "Call Center",
    companyCountry: "Vietnam",
    market: "Crypto",
    communicationMode: "Real Face — videocall and call",
    source: "Referral",
    job: "Sales Agent",
    nationality: "Brazilian",
    location: "Vietnam",
  },
];

export const seedJobs: Job[] = [
  {
    id: "job-1",
    createdAt: now,
    title: "Sales Agent",
    employer: "Nova Commerce",
    location: "Ho Chi Minh City, Vietnam",
    vacancies: 8,
    applicants: 124,
    status: "Active",
    market: "Crypto",
  },
  {
    id: "job-2",
    createdAt: now,
    title: "Call Center",
    employer: "Nova Commerce",
    location: "Ho Chi Minh City, Vietnam",
    vacancies: 6,
    applicants: 31,
    status: "Active",
    market: "Stock Market",
  },
  {
    id: "job-3",
    createdAt: now,
    title: "Translator",
    employer: "Pacific Desk",
    location: "Remote / HCMC",
    vacancies: 2,
    applicants: 9,
    status: "Active",
    market: "Law Enforcement",
  },
];

export const seedEmployers: Employer[] = [
  {
    id: "emp-1",
    createdAt: now,
    name: "Nova Commerce",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    industry: "E-commerce",
    status: "Active",
  },
  {
    id: "emp-2",
    createdAt: now,
    name: "Pacific Desk",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    industry: "Operations",
    status: "Active",
  },
];

export const seedInterviews: Interview[] = [
  {
    id: "int-1",
    createdAt: now,
    time: "09:00",
    date: "2026-09-01",
    candidate: "Camila Rodrigues",
    job: "Sales Agent",
    status: "Confirmed",
  },
  {
    id: "int-2",
    createdAt: now,
    time: "10:30",
    date: "2026-09-01",
    candidate: "Kenji Sato",
    job: "Customer Success",
    status: "Pending",
  },
  {
    id: "int-3",
    createdAt: now,
    time: "13:00",
    date: "2026-09-01",
    candidate: "Amina Yusuf",
    job: "Call Center Lead",
    status: "Confirmed",
  },
];

export const seedTasks: DeskTask[] = [
  {
    id: "task-hf-1",
    createdAt: now,
    title: "Confirm Kenji Sato interview",
    due: "Today, 11:00",
    assignee: "Plug",
    status: "Pending",
    company: "hireflow",
  },
  {
    id: "mtaakl-op",
    createdAt: "2026-08-30T16:17:44.352Z",
    title: "Operation Console System erstellen",
    description: "Create a operational System to track our Incomes",
    assignee: "Plug",
    status: "done",
    company: "qrrupt",
  },
  {
    id: "mta2a0an2mbela",
    createdAt: "2026-08-30T16:19:45.791Z",
    title: "Resolve ETHERUM Live Track problem",
    description: "Error Code: Couldn't fetch this one Internal error",
    assignee: "Plug",
    status: "todo",
    company: "qrrupt",
  },
  {
    id: "mta2oteiw5d1ud",
    createdAt: "2026-08-30T16:31:16.698Z",
    title: "Edit Chat Code (show who is texting)",
    description: "Edit the chat code to show what time and which User send a Message",
    assignee: "Plug",
    status: "done",
    company: "qrrupt",
  },
  {
    id: "mtc4sbguydmrfz",
    createdAt: "2026-08-31T03:05:31.662Z",
    title: "Chinese Financial and Team Management System",
    description: "Create a system for chinese companies to do the financial and team Management",
    assignee: "Plug",
    status: "inprogress",
    company: "qrrupt",
    tag: "System Creation",
  },
  {
    id: "mtfz9axnnhi66s",
    createdAt: "2026-08-31T19:41:51.131Z",
    title: "Test Task",
    description: "Erstellt via Dashboard-Befehl",
    assignee: "Plug",
    status: "todo",
    company: "qrrupt",
  },
];

export const seedFinance: FinanceEntry[] = [
  {
    id: "mtaaklgyjxpjq9",
    date: "2026-08-14",
    type: "expense",
    amount: 500,
    person: "Plug",
    category: "Other",
    createdAt: 1787760716722,
    description: "Police Bill",
  },
  {
    id: "mtaan2em91olgt",
    date: "2026-08-23",
    type: "income",
    amount: 500,
    person: "Plug",
    category: "Services",
    createdAt: 1787760831982,
    description: "Agency Commission",
  },
  {
    id: "mthk46nq0bdyj1",
    person: "Plug",
    createdAt: 1788200010422,
    type: "income",
    amount: 660,
    category: "Salary",
    description: "4 days of work",
    date: "2026-08-31",
  },
  {
    id: "mthkcrq3d1nyan",
    person: "Plug",
    createdAt: 1788200410972,
    type: "expense",
    amount: 100,
    category: "Owed Money",
    description: "Salo Payback",
    date: "2026-08-31",
  },
];

export const seedMeetings: Meeting[] = [
  {
    id: "mta4ge6emeh9yk",
    date: "2026-08-26",
    time: "02:35",
    title: "Weekly Business Meeting",
    agenda: "Contracts, Salarys and Overall",
    person: "Plug",
    attendees: ["Plug", "Professor_M"],
    createdAt: 1787750442950,
  },
];

export const seedCalendar: CalEvent[] = [
  {
    id: "mtah40owzlh3zy",
    date: "2026-08-31",
    time: "",
    notes: "Salary Payment",
    title: "Payday",
    person: "Plug",
    repeat: "",
    createdAt: 1787771700608,
    important: false,
    repeatDay: 31,
  },
  {
    id: "mtfz55yhi0swus",
    date: "2026-08-06",
    time: "08:00",
    notes: "Monthly automation",
    title: "Payday",
    person: "Plug",
    repeat: "monthly",
    createdAt: 1788104318057,
    important: true,
    repeatDay: 6,
  },
];

export const seedKnowledge: KnowledgeNode[] = [
  {
    id: "k1",
    company: "atlas",
    kind: "skill",
    title: "Dual-company isolation",
    detail: "HireFlow never writes Qrrupt books. Qrrupt never sees candidate names.",
    createdAt: now,
  },
  {
    id: "k2",
    company: "hireflow",
    kind: "skill",
    title: "Pipeline stages",
    detail: "Applicants → Screening → Qualified → Interview → Offer → Onboarding → Placed.",
    createdAt: now,
  },
  {
    id: "k3",
    company: "hireflow",
    kind: "memory",
    title: "Telegram intake",
    detail: "Register candidates from @overseasjobsHR. Roles: Model, Typer, Call Center, Translator.",
    createdAt: now,
  },
  {
    id: "k4",
    company: "qrrupt",
    kind: "memory",
    title: "August cash",
    detail: "Loaded Plug backup 2026-08-31. Currency USD. Agency commission + salary vs police bill + payback.",
    createdAt: now,
  },
  {
    id: "k5",
    company: "qrrupt",
    kind: "skill",
    title: "GO gates",
    detail: "Pays, production deploys, and live client mail need Plug to type GO.",
    createdAt: now,
  },
  {
    id: "k6",
    company: "atlas",
    kind: "lesson",
    title: "Operator is Plug",
    detail: "Timezone Asia/Ho_Chi_Minh. Crew includes Professor_M.",
    createdAt: now,
  },
];

export const seedAgents: SubAgent[] = [
  { id: "jarvis", name: "JARVIS", title: "Chief of staff", company: "atlas", status: "idle", currentTask: null, queue: [] },
  { id: "hf-ops", name: "HF-OPS", title: "Jobs & pipeline", company: "hireflow", status: "idle", currentTask: null, queue: [] },
  { id: "hf-front", name: "HF-FRONT", title: "Client / candidate drafts", company: "hireflow", status: "idle", currentTask: null, queue: [] },
  { id: "qr-ledger", name: "QR-LEDGER", title: "Cash & P&L", company: "qrrupt", status: "idle", currentTask: null, queue: [] },
  { id: "qr-ops", name: "QR-OPS", title: "Brand operations", company: "qrrupt", status: "idle", currentTask: null, queue: [] },
  { id: "muse", name: "MUSE", title: "Copy & drops", company: "qrrupt", status: "idle", currentTask: null, queue: [] },
  { id: "coder", name: "CODER", title: "Apps & sites", company: "atlas", status: "idle", currentTask: null, queue: [] },
  { id: "scout", name: "SCOUT", title: "Research", company: "atlas", status: "idle", currentTask: null, queue: [] },
];

export const ROLES = ["Model", "Typer", "Call Center", "Translator"] as const;
export const MARKETS = ["Security", "Law Enforcement", "Crypto", "Stock Market", "Casino", "Love Story"] as const;
export const MODES = [
  "Real Face — videocall and call",
  "AI — videocall or voicecall using AI",
  "Only Call",
] as const;
export const FINANCE_CATEGORIES = ["Salary", "Services", "Other", "Owed Money", "Ads", "Inventory", "Tools"] as const;
