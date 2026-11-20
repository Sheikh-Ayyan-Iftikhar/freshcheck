export type CheckStatus = "processing" | "completed" | "failed";
export type ClaimStatus = "current" | "stale" | "contradicted" | "unverifiable";
export type Volatility = "low" | "medium" | "high";

export interface Source {
  title: string;
  url: string;
  snippet: string;
  published_date?: string | null;
  retrieved_at: string;
}

export interface Claim {
  id: string;
  original_text: string;
  category: string;
  volatility: Volatility;
  status: ClaimStatus;
  confidence?: number | null; // 0..1
  current_information?: string | null;
  explanation?: string | null;
  sources: Source[];
  /** Optional character offsets into `original_answer` (end exclusive). */
  start_offset?: number | null;
  end_offset?: number | null;
}

export interface CheckResult {
  id: string;
  status: CheckStatus;
  progress?: number | null; // 0..100
  stage?: string | null;
  created_at?: string | null;
  /**
   * NOT in the original contract — proposed addition so the results page can
   * render the original answer. Backend should echo the submitted text.
   */
  original_answer?: string | null;
  freshness_score?: number | null;
  total_claims: number;
  current_claims: number;
  stale_claims: number;
  contradicted_claims: number;
  unverifiable_claims: number;
  claims: Claim[];
  corrected_answer?: string | null;
  error?: string | null;
  is_mock?: boolean;
}

export interface CheckSummary {
  id: string;
  status: CheckStatus;
  freshness_score?: number | null;
  created_at: string;
  answer_preview: string;
  total_claims: number;
  current_claims: number;
  stale_claims: number;
  contradicted_claims: number;
  unverifiable_claims: number;
  is_mock?: boolean;
}

export interface CreateCheckRequest {
  answer: string;
}

export interface CreateCheckResponse {
  id: string;
  status: CheckStatus;
}
