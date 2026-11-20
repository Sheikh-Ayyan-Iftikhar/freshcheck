"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-blocks";
import { useCheck } from "@/hooks/use-check";
import { formatDate } from "@/lib/utils";
import type { Source } from "@/types/check";
import { ClaimCard } from "./claim-card";
import { CorrectedAnswer } from "./corrected-answer";
import { HighlightedAnswer } from "./highlighted-answer";
import { ProgressPanel } from "./progress-panel";
import { ScoreSummary } from "./score-summary";
import { SourceCard } from "./source-card";

export function ResultsView({ id }: { id: string }) {
  const { data, error, loading, refetch } = useCheck(id);

  // Scroll to a claim anchor (e.g. /results/x#claim_1) once content has rendered.
  useEffect(() => {
    if (data?.status === "completed" && window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.status]);

  const sources: { source: Source; note: string }[] = [];
  const seen = new Set<string>();
  (data?.claims ?? []).forEach((c, i) =>
    c.sources.forEach((s) => {
      const key = s.url || `${c.id}-${s.title}`;
      if (seen.has(key)) return;
      seen.add(key);
      sources.push({ source: s, note: `Claim ${i + 1}` });
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/history" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to history
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Analysis results</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {id}{data?.created_at ? ` · ${formatDate(data.created_at)}` : ""}
        </p>
      </div>

      {data?.is_mock && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Demo data — this result was generated locally in mock mode. It is not a real verification.</p>
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-4"><Skeleton className="h-52" /><Skeleton className="h-40" /></div>
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data?.status === "processing" ? (
        <ProgressPanel progress={data.progress} stage={data.stage} />
      ) : data?.status === "failed" ? (
        <ErrorState message={data.error ?? "The analysis failed on the backend."} onRetry={refetch} />
      ) : data ? (
        <>
          <ScoreSummary check={data} />
          <HighlightedAnswer answer={data.original_answer} claims={data.claims} />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Claim analysis</h2>
            {data.claims.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">No factual claims were extracted from this answer.</Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {data.claims.map((c) => <ClaimCard key={c.id} claim={c} />)}
              </div>
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Sources and evidence</CardTitle>
              <CardDescription>Evidence returned by the backend. Links open in a new tab.</CardDescription>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sources were returned for this analysis.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {sources.map((s, i) => <SourceCard key={i} source={s.source} note={s.note} />)}
                </div>
              )}
            </CardContent>
          </Card>

          <CorrectedAnswer text={data.corrected_answer} isMock={data.is_mock} />
        </>
      ) : null}
    </div>
  );
}
