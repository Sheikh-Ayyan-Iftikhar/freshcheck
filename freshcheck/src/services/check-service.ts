import { api } from "@/lib/api";
import { appConfig } from "@/config/app-config";
import { mockApi } from "@/mocks/mock-api";
import type {
  CheckResult, CheckStatus, CheckSummary, Claim, ClaimStatus, CreateCheckResponse, Source, Volatility,
} from "@/types/check";

/* ---- Defensive normalisers: the backend contract is proposed, so never trust shape ---- */

const STATUSES: CheckStatus[] = ["processing", "completed", "failed"];
const CLAIM_STATUSES: ClaimStatus[] = ["current", "stale", "contradicted", "unverifiable"];
const VOLS: Volatility[] = ["low", "medium", "high"];

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeSource(raw: any): Source {
  return {
    title: str(raw?.title, "Untitled source"),
    url: str(raw?.url),
    snippet: str(raw?.snippet),
    published_date: typeof raw?.published_date === "string" ? raw.published_date : null,
    retrieved_at: str(raw?.retrieved_at),
  };
}

function normalizeClaim(raw: any, i: number): Claim {
  return {
    id: str(raw?.id, `claim_${i + 1}`),
    original_text: str(raw?.original_text),
    category: str(raw?.category, "general"),
    volatility: VOLS.includes(raw?.volatility) ? raw.volatility : "medium",
    status: CLAIM_STATUSES.includes(raw?.status) ? raw.status : "unverifiable",
    confidence: num(raw?.confidence),
    current_information: typeof raw?.current_information === "string" ? raw.current_information : null,
    explanation: typeof raw?.explanation === "string" ? raw.explanation : null,
    sources: Array.isArray(raw?.sources) ? raw.sources.map(normalizeSource) : [],
    start_offset: num(raw?.start_offset),
    end_offset: num(raw?.end_offset),
  };
}

export function normalizeCheck(raw: any): CheckResult {
  const claims: Claim[] = Array.isArray(raw?.claims) ? raw.claims.map(normalizeClaim) : [];
  const count = (s: ClaimStatus) => claims.filter((c) => c.status === s).length;
  return {
    id: str(raw?.id),
    status: STATUSES.includes(raw?.status) ? raw.status : "processing",
    progress: num(raw?.progress),
    stage: typeof raw?.stage === "string" ? raw.stage : null,
    created_at: typeof raw?.created_at === "string" ? raw.created_at : null,
    original_answer: typeof raw?.original_answer === "string" ? raw.original_answer : null,
    freshness_score: num(raw?.freshness_score),
    total_claims: num(raw?.total_claims) ?? claims.length,
    current_claims: num(raw?.current_claims) ?? count("current"),
    stale_claims: num(raw?.stale_claims) ?? count("stale"),
    contradicted_claims: num(raw?.contradicted_claims) ?? count("contradicted"),
    unverifiable_claims: num(raw?.unverifiable_claims) ?? count("unverifiable"),
    claims,
    corrected_answer: typeof raw?.corrected_answer === "string" ? raw.corrected_answer : null,
    error: typeof raw?.error === "string" ? raw.error : null,
  };
}

function normalizeSummary(raw: any): CheckSummary {
  return {
    id: str(raw?.id),
    status: STATUSES.includes(raw?.status) ? raw.status : "processing",
    freshness_score: num(raw?.freshness_score),
    created_at: str(raw?.created_at, new Date(0).toISOString()),
    answer_preview: str(raw?.answer_preview ?? raw?.original_answer).slice(0, 180),
    total_claims: num(raw?.total_claims) ?? 0,
    current_claims: num(raw?.current_claims) ?? 0,
    stale_claims: num(raw?.stale_claims) ?? 0,
    contradicted_claims: num(raw?.contradicted_claims) ?? 0,
    unverifiable_claims: num(raw?.unverifiable_claims) ?? 0,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---- Public service ---- */

export async function createCheck(answer: string): Promise<CreateCheckResponse> {
  if (appConfig.useMocks) return mockApi.createCheck(answer);
  const { data } = await api.post("/api/checks", { answer });
  if (!data?.id) throw new Error("The backend did not return an analysis ID.");
  return { id: String(data.id), status: STATUSES.includes(data.status) ? data.status : "processing" };
}

export async function getCheck(id: string): Promise<CheckResult> {
  if (appConfig.useMocks) {
    const r = await mockApi.getCheck(id);
    return { ...r, is_mock: true };
  }
  const { data } = await api.get(`/api/checks/${encodeURIComponent(id)}`);
  return normalizeCheck(data);
}

export async function listChecks(): Promise<CheckSummary[]> {
  if (appConfig.useMocks) return mockApi.listChecks();
  const { data } = await api.get("/api/checks");
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return items.map(normalizeSummary);
}

export type BackendStatus =
  | { mode: "mock" }
  | { mode: "live"; ok: true; latencyMs: number }
  | { mode: "live"; ok: false; error: string };

/** The contract has no health endpoint, so we probe GET /api/checks. */
export async function checkBackend(): Promise<BackendStatus> {
  if (appConfig.useMocks) return { mode: "mock" };
  const t0 = performance.now();
  try {
    await api.get("/api/checks", { timeout: 5000 });
    return { mode: "live", ok: true, latencyMs: Math.round(performance.now() - t0) };
  } catch (e) {
    const { getErrorMessage } = await import("@/lib/api");
    return { mode: "live", ok: false, error: getErrorMessage(e) };
  }
}
