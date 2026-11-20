"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FlaskConical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-blocks";
import { appConfig } from "@/config/app-config";
import { useChecks } from "@/hooks/use-check";
import { cn, formatDate, scoreColor, scoreLabel } from "@/lib/utils";

type Filter = "all" | "fresh" | "stale" | "processing" | "failed";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fresh", label: "Fresh" },
  { id: "stale", label: "Stale" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export function HistoryView() {
  const { data, loading, error, refetch } = useChecks();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      if (q && !c.answer_preview.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      switch (filter) {
        case "fresh": return c.status === "completed" && (c.freshness_score ?? 0) >= appConfig.freshThreshold;
        case "stale": return c.status === "completed" && (c.freshness_score ?? 0) < appConfig.freshThreshold;
        case "processing": return c.status === "processing";
        case "failed": return c.status === "failed";
        default: return true;
      }
    });
  }, [data, query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you&apos;ve checked so far.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search analyses…" className="pl-9" aria-label="Search analyses" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        (data ?? []).length === 0 ? (
          <EmptyState title="No analyses yet" description="Your checked answers will appear here." action={<Link href="/new-check" className={buttonVariants({ size: "sm" })}>New Analysis</Link>} />
        ) : (
          <EmptyState title="No matches" description="Try a different search or filter." />
        )
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <Link key={c.id} href={`/results/${c.id}`} className="block">
              <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
                <div
                  className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{ background: `${scoreColor(c.freshness_score)}1f`, color: scoreColor(c.freshness_score) }}
                >
                  <span className="text-xl font-bold tabular-nums">{c.status === "completed" ? c.freshness_score ?? "—" : "…"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm">{c.answer_preview || "(no preview available)"}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatDate(c.created_at)}</span>
                    <span>{c.status === "completed" ? scoreLabel(c.freshness_score) : c.status}</span>
                    {c.status === "completed" && <span>{c.total_claims} claims · {c.stale_claims + c.contradicted_claims} flagged</span>}
                    {c.is_mock && (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400"><FlaskConical className="h-3 w-3" /> Demo</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
