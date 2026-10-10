import { useSyncExternalStore } from "react";

export const JOB_TYPES = ["Onsite", "Remote", "Hybrid"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const CATEGORIES = [
  "IT",
  "Sales",
  "Construction",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "Logistics",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface JobPosting {
  id: string;
  title: string;
  type: JobType;
  category: Category;
  location: string;
  companyName: string;
  companyInfo: string;
  description: string;
  requirements: string;
  additionalInfo: string;
  howToApply: string;
  createdAt: number;
}

export type JobInput = Omit<JobPosting, "id" | "createdAt">;

const day = 86400000;
const now = Date.now();

let jobs: JobPosting[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    type: "Remote",
    category: "IT",
    location: "Sofia, Bulgaria",
    companyName: "Northwind Labs",
    companyInfo: "A 60-person product studio building tools for logistics teams.",
    description: "Own the web app UI, ship features weekly and mentor two mid-level engineers.",
    requirements: "5+ years React & TypeScript\nStrong CSS skills\nGood English",
    additionalInfo: "Salary 6,000–8,000 BGN net · Annual bonus · Private health insurance · 25 days PTO",
    howToApply: "Send your CV and GitHub link to jobs@northwind.example",
    createdAt: now - 1 * day,
  },
  {
    id: "2",
    title: "Account Executive",
    type: "Hybrid",
    category: "Sales",
    location: "Plovdiv, Bulgaria",
    companyName: "Brightline CRM",
    companyInfo: "SaaS CRM used by 3,000 small businesses across Europe.",
    description: "Close mid-market deals and grow existing accounts in the Balkan region.",
    requirements: "3+ years B2B sales\nCRM experience\nDriving licence",
    additionalInfo: "Base 3,500 BGN + uncapped commission · Company car · Food vouchers",
    howToApply: "Apply via careers.brightline.example with a short cover letter.",
    createdAt: now - 3 * day,
  },
  {
    id: "3",
    title: "Site Foreman",
    type: "Onsite",
    category: "Construction",
    location: "Varna, Bulgaria",
    companyName: "Stonebridge Build",
    companyInfo: "Residential and commercial builder with 25 years on the Black Sea coast.",
    description: "Coordinate crews and subcontractors on a 12-storey residential project.",
    requirements: "Civil engineering background\n5+ years on-site leadership\nSafety certification",
    additionalInfo: "4,500 BGN gross · Transport allowance · Social benefits package",
    howToApply: "Call +359 52 000 000 or email hr@stonebridge.example",
    createdAt: now - 6 * day,
  },
  {
    id: "4",
    title: "Performance Marketing Specialist",
    type: "Remote",
    category: "Marketing",
    location: "Anywhere in EU",
    companyName: "Fable & Co",
    companyInfo: "Direct-to-consumer brand selling sustainable home goods.",
    description: "Plan and optimise paid campaigns across Meta, Google and TikTok.",
    requirements: "2+ years paid media\nAnalytical mindset\nGA4 knowledge",
    additionalInfo: "€2,800–3,600/month · Quarterly bonus · Learning budget",
    howToApply: "Email a campaign case study to talent@fable.example",
    createdAt: now - 10 * day,
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const jobStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getAll: () => jobs,
  add(input: JobInput) {
    jobs = [{ ...input, id: crypto.randomUUID(), createdAt: Date.now() }, ...jobs];
    emit();
  },
  update(id: string, input: JobInput) {
    jobs = jobs.map((j) => (j.id === id ? { ...j, ...input } : j));
    emit();
  },
  remove(id: string) {
    jobs = jobs.filter((j) => j.id !== id);
    emit();
  },
};

export function useJobs() {
  return useSyncExternalStore(jobStore.subscribe, jobStore.getAll, jobStore.getAll);
}
