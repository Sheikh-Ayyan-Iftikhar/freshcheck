"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { appConfig } from "@/config/app-config";
import { getErrorMessage } from "@/lib/api";
import { createCheck, getCheck, listChecks } from "@/services/check-service";
import type { CheckResult, CheckSummary, Claim } from "@/types/check";

/**
 * Polls GET /api/checks/:id until the analysis completes or fails.
 * (SSE via /api/checks/:id/events can replace this later without touching UI.)
 */
export function useCheck(id: string) {
  const [data, setData] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    async function poll() {
      try {
        const res = await getCheck(id);
        if (cancelled) return;
        failures = 0;
        setData(res);
        setError(null);
        setLoading(false);
        if (res.status === "processing") timer = setTimeout(poll, appConfig.pollIntervalMs);
      } catch (e) {
        if (cancelled) return;
        failures += 1;
        // Tolerate brief network blips while an analysis is running.
        if (failures < 3 && data?.status === "processing") {
          timer = setTimeout(poll, appConfig.pollIntervalMs * 2);
          return;
        }
        setError(getErrorMessage(e));
        setLoading(false);
      }
    }

    setLoading(true);
    setError(null);
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, refetch };
}

export function useChecks() {
  const [data, setData] = useState<CheckSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listChecks()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, refetch };
}

/** Submit hook with duplicate-submission protection. */
export function useCreateCheck() {
  const inFlight = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (answer: string) => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setSubmitting(true);
    try {
      return await createCheck(answer);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting };
}

export interface StaleItem { claim: Claim; checkId: string }

/** Loads details for the latest completed analyses to surface stale claims on the dashboard. */
export function useRecentStaleClaims(summaries: CheckSummary[] | null, limit = 3) {
  const [items, setItems] = useState<StaleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const key = summaries?.map((s) => s.id).join(",") ?? "";
  useEffect(() => {
    if (!summaries) return;
    let cancelled = false;
    const ids = summaries
      .filter((s) => s.status === "completed" && s.stale_claims + s.contradicted_claims > 0)
      .slice(0, limit)
      .map((s) => s.id);
    if (ids.length === 0) { setItems([]); return; }
    setLoading(true);
    Promise.allSettled(ids.map((id) => getCheck(id)))
      .then((results) => {
        if (cancelled) return;
        const out: StaleItem[] = [];
        results.forEach((r) => {
          if (r.status !== "fulfilled") return;
          r.value.claims
            .filter((c) => c.status === "stale" || c.status === "contradicted")
            .forEach((claim) => out.push({ claim, checkId: r.value.id }));
        });
        setItems(out.slice(0, 6));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit]);

  return { items, loading };
}
