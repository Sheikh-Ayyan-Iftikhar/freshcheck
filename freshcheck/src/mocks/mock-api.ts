import type { CheckResult, CheckSummary, CreateCheckResponse } from "@/types/check";
import { buildMockResultFromAnswer, seededChecks } from "./mock-data";

/** Simulates the backend entirely in the browser (mock mode only). */

const JOBS_KEY = "freshcheck.mock.jobs";
const DURATION_MS = 5000;
const STAGES = [
  "Extracting claims",
  "Searching current sources",
  "Comparing evidence",
  "Drafting corrections",
];

interface Job { id: string; answer: string; createdAt: string; startedAt: number }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(JOBS_KEY) ?? "[]") as Job[];
  } catch {
    return [];
  }
}
function saveJobs(jobs: Job[]) {
  try { window.localStorage.setItem(JOBS_KEY, JSON.stringify(jobs.slice(-30))); } catch { /* ignore */ }
}

function resolveJob(job: Job): CheckResult {
  const elapsed = Date.now() - job.startedAt;
  if (elapsed < DURATION_MS) {
    const progress = Math.min(95, Math.round((elapsed / DURATION_MS) * 100));
    return {
      id: job.id, status: "processing", progress,
      stage: STAGES[Math.min(STAGES.length - 1, Math.floor((elapsed / DURATION_MS) * STAGES.length))],
      created_at: job.createdAt, original_answer: job.answer,
      total_claims: 0, current_claims: 0, stale_claims: 0, contradicted_claims: 0, unverifiable_claims: 0,
      claims: [], is_mock: true,
    };
  }
  return buildMockResultFromAnswer(job.id, job.createdAt, job.answer);
}

function toSummary(r: CheckResult): CheckSummary {
  return {
    id: r.id, status: r.status, freshness_score: r.freshness_score ?? null,
    created_at: r.created_at ?? new Date().toISOString(),
    answer_preview: (r.original_answer ?? "").slice(0, 180),
    total_claims: r.total_claims, current_claims: r.current_claims, stale_claims: r.stale_claims,
    contradicted_claims: r.contradicted_claims, unverifiable_claims: r.unverifiable_claims, is_mock: true,
  };
}

export const mockApi = {
  async createCheck(answer: string): Promise<CreateCheckResponse> {
    await wait(500);
    const now = Date.now();
    const job: Job = { id: `mock_${now.toString(36)}`, answer, createdAt: new Date(now).toISOString(), startedAt: now };
    saveJobs([...loadJobs(), job]);
    return { id: job.id, status: "processing" };
  },

  async getCheck(id: string): Promise<CheckResult> {
    await wait(250);
    const seeded = seededChecks.find((c) => c.id === id);
    if (seeded) return seeded;
    const job = loadJobs().find((j) => j.id === id);
    if (!job) throw new Error("That analysis could not be found (mock data is stored in this browser only).");
    return resolveJob(job);
  },

  async listChecks(): Promise<CheckSummary[]> {
    await wait(300);
    const all = [...seededChecks, ...loadJobs().map(resolveJob)];
    return all
      .map(toSummary)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },
};
