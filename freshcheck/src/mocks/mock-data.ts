import type { Claim, ClaimStatus, CheckResult, Volatility } from "@/types/check";

/**
 * MOCK DATA ONLY. Everything here is fictional ("Acme Cloud" etc.) and is shown
 * in the UI with a "Demo data" label. It is never a real verification result.
 */

export interface ClaimDraft {
  text: string;
  start: number;
  end: number;
  status: ClaimStatus;
  category: string;
  volatility: Volatility;
  confidence: number | null;
  current_information: string | null;
  explanation: string;
  source: { title: string; url: string; snippet: string; published_date: string | null };
}

export function assembleMockResult(
  id: string,
  createdAt: string,
  answer: string,
  drafts: ClaimDraft[],
): CheckResult {
  const claims: Claim[] = drafts.map((d, i) => ({
    id: `${id}_claim_${i + 1}`,
    original_text: d.text,
    category: d.category,
    volatility: d.volatility,
    status: d.status,
    confidence: d.confidence,
    current_information: d.current_information,
    explanation: d.explanation,
    start_offset: d.start,
    end_offset: d.end,
    sources:
      d.status === "unverifiable"
        ? []
        : [{ ...d.source, retrieved_at: createdAt }],
  }));

  const count = (s: ClaimStatus) => claims.filter((c) => c.status === s).length;
  const total = claims.length;
  const current = count("current");
  const unverifiable = count("unverifiable");
  const score = total === 0 ? 0 : Math.round(((current + unverifiable * 0.5) / total) * 100);

  let corrected = answer;
  [...drafts]
    .sort((a, b) => b.start - a.start)
    .forEach((d) => {
      if ((d.status === "stale" || d.status === "contradicted") && d.current_information) {
        corrected = corrected.slice(0, d.start) + d.current_information + corrected.slice(d.end);
      }
    });

  return {
    id,
    status: "completed",
    created_at: createdAt,
    original_answer: answer,
    freshness_score: score,
    total_claims: total,
    current_claims: current,
    stale_claims: count("stale"),
    contradicted_claims: count("contradicted"),
    unverifiable_claims: unverifiable,
    claims,
    corrected_answer: corrected,
    is_mock: true,
  };
}

const SRC = (slug: string, title: string, snippet: string, date: string | null = null) => ({
  title,
  url: `https://example.com/mock/${slug}`,
  snippet,
  published_date: date,
});

function locate(answer: string, text: string) {
  const start = answer.indexOf(text);
  return { start, end: start + text.length };
}

/* ---------- Seeded sample analyses ---------- */

const ANSWER_A =
  "Acme Cloud Pro costs $20 per month. It includes 100 GB of storage. The free plan was discontinued in 2023. Acme Cloud is headquartered in Austin, Texas. The latest SDK release is version 2.4.";
const ANSWER_B =
  "Zephyr UI is a React component library. It supports dark mode out of the box. Its documentation lives at docs.zephyr.example. The library is released under the MIT license.";
const ANSWER_C =
  "Nimbus Hosting offers a free tier with 5 projects. Its Starter plan costs $5 per month. Support is available 24/7 by phone. The CEO of Nimbus Hosting is Jordan Lee.";

const d = (
  answer: string,
  text: string,
  rest: Omit<ClaimDraft, "text" | "start" | "end">,
): ClaimDraft => ({ text, ...locate(answer, text), ...rest });

export const seededChecks: CheckResult[] = [
  assembleMockResult("mock_demo_1", "2026-11-17T09:12:00Z", ANSWER_A, [
    d(ANSWER_A, "Acme Cloud Pro costs $20 per month.", {
      status: "stale", category: "pricing", volatility: "high", confidence: 0.94,
      current_information: "Acme Cloud Pro costs $29 per month.",
      explanation: "The pricing page was updated; the Pro plan is no longer $20.",
      source: SRC("acme-pricing", "Acme Cloud Pricing (mock)", "Pro — $29/month billed monthly.", "2026-09-02"),
    }),
    d(ANSWER_A, "It includes 100 GB of storage.", {
      status: "current", category: "product features", volatility: "medium", confidence: 0.88,
      current_information: null,
      explanation: "Current plan documentation still lists 100 GB.",
      source: SRC("acme-plans", "Acme Cloud Plans Overview (mock)", "Pro includes 100 GB of storage."),
    }),
    d(ANSWER_A, "The free plan was discontinued in 2023.", {
      status: "contradicted", category: "plans", volatility: "medium", confidence: 0.81,
      current_information: "A limited free plan is still available.",
      explanation: "Evidence shows the free plan was re-introduced after being paused, contradicting the claim.",
      source: SRC("acme-free", "Acme Cloud Free Plan (mock)", "Start for free with up to 5 GB.", "2026-03-14"),
    }),
    d(ANSWER_A, "Acme Cloud is headquartered in Austin, Texas.", {
      status: "unverifiable", category: "company info", volatility: "low", confidence: null,
      current_information: null,
      explanation: "No reliable, current source confirming the headquarters location was found.",
      source: SRC("none", "", ""),
    }),
    d(ANSWER_A, "The latest SDK release is version 2.4.", {
      status: "stale", category: "software versions", volatility: "high", confidence: 0.9,
      current_information: "The latest SDK release is version 3.1.",
      explanation: "Newer major version has been released since 2.4.",
      source: SRC("acme-sdk", "Acme SDK Releases (mock)", "v3.1.0 — latest stable release.", "2026-10-21"),
    }),
  ]),
  assembleMockResult("mock_demo_2", "2026-11-15T14:40:00Z", ANSWER_B, [
    d(ANSWER_B, "Zephyr UI is a React component library.", {
      status: "current", category: "product info", volatility: "low", confidence: 0.97, current_information: null,
      explanation: "Project README confirms this description.",
      source: SRC("zephyr-readme", "Zephyr UI README (mock)", "A React component library."),
    }),
    d(ANSWER_B, "It supports dark mode out of the box.", {
      status: "current", category: "product features", volatility: "medium", confidence: 0.9, current_information: null,
      explanation: "Docs describe built-in theming with dark mode.",
      source: SRC("zephyr-theming", "Theming — Zephyr UI (mock)", "Dark mode is enabled by default."),
    }),
    d(ANSWER_B, "Its documentation lives at docs.zephyr.example.", {
      status: "unverifiable", category: "links", volatility: "low", confidence: null, current_information: null,
      explanation: "Could not confirm the documentation host from current sources.",
      source: SRC("none", "", ""),
    }),
    d(ANSWER_B, "The library is released under the MIT license.", {
      status: "current", category: "licensing", volatility: "low", confidence: 0.95, current_information: null,
      explanation: "License file in the repository is MIT.",
      source: SRC("zephyr-license", "LICENSE — Zephyr UI (mock)", "MIT License"),
    }),
  ]),
  assembleMockResult("mock_demo_3", "2026-11-12T18:05:00Z", ANSWER_C, [
    d(ANSWER_C, "Nimbus Hosting offers a free tier with 5 projects.", {
      status: "stale", category: "plans", volatility: "high", confidence: 0.86,
      current_information: "Nimbus Hosting offers a free tier with 3 projects.",
      explanation: "The free tier project limit was reduced.",
      source: SRC("nimbus-free", "Nimbus Free Tier (mock)", "Free tier: up to 3 projects.", "2026-08-30"),
    }),
    d(ANSWER_C, "Its Starter plan costs $5 per month.", {
      status: "stale", category: "pricing", volatility: "high", confidence: 0.92,
      current_information: "Its Starter plan costs $9 per month.",
      explanation: "Starter pricing increased.",
      source: SRC("nimbus-pricing", "Nimbus Pricing (mock)", "Starter — $9/month.", "2026-08-30"),
    }),
    d(ANSWER_C, "Support is available 24/7 by phone.", {
      status: "contradicted", category: "support", volatility: "medium", confidence: 0.78,
      current_information: "Support is available 24/7 via chat; phone support is for Enterprise only.",
      explanation: "Phone support is limited to Enterprise customers.",
      source: SRC("nimbus-support", "Nimbus Support (mock)", "Phone support — Enterprise plans.", "2026-06-11"),
    }),
    d(ANSWER_C, "The CEO of Nimbus Hosting is Jordan Lee.", {
      status: "unverifiable", category: "leadership", volatility: "medium", confidence: null, current_information: null,
      explanation: "Leadership information could not be confirmed from recent sources.",
      source: SRC("none", "", ""),
    }),
  ]),
];

/* ---------- Generator for user-submitted answers (mock mode) ---------- */

const CYCLE: ClaimStatus[] = ["current", "stale", "unverifiable", "current", "contradicted", "stale"];

const TEMPLATES: Record<ClaimStatus, Omit<ClaimDraft, "text" | "start" | "end" | "status">> = {
  current: {
    category: "general", volatility: "low", confidence: 0.9, current_information: null,
    explanation: "[Demo] Simulated: matching evidence found in a current source.",
    source: SRC("generic-current", "Simulated confirming source (mock)", "This is placeholder evidence generated in mock mode."),
  },
  stale: {
    category: "pricing", volatility: "high", confidence: 0.88,
    current_information: "[Demo] Simulated updated information for this claim.",
    explanation: "[Demo] Simulated: a newer source suggests this information has changed.",
    source: SRC("generic-stale", "Simulated updated source (mock)", "This is placeholder evidence generated in mock mode.", "2026-10-01"),
  },
  contradicted: {
    category: "product features", volatility: "medium", confidence: 0.8,
    current_information: "[Demo] Simulated corrected statement.",
    explanation: "[Demo] Simulated: current evidence contradicts this claim.",
    source: SRC("generic-contradicted", "Simulated contradicting source (mock)", "This is placeholder evidence generated in mock mode.", "2026-09-15"),
  },
  unverifiable: {
    category: "company info", volatility: "low", confidence: null, current_information: null,
    explanation: "[Demo] Simulated: no reliable current source could be found.",
    source: SRC("none", "", ""),
  },
};

export function buildMockResultFromAnswer(id: string, createdAt: string, answer: string): CheckResult {
  const drafts: ClaimDraft[] = [];
  const re = /[^.!?\n]+[.!?]?/g;
  for (const m of answer.matchAll(re)) {
    if (drafts.length >= 6) break;
    const raw = m[0];
    const text = raw.trim();
    if (text.length < 15) continue;
    const start = (m.index ?? 0) + raw.indexOf(text);
    const status = CYCLE[drafts.length % CYCLE.length];
    drafts.push({ text, start, end: start + text.length, status, ...TEMPLATES[status] });
  }
  return assembleMockResult(id, createdAt, answer, drafts);
}

export const SAMPLE_ANSWER = ANSWER_A;
