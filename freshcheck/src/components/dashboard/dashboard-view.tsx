"use client";

import Link from "next/link";
import { Activity, ArrowRight, BarChart3, CheckCircle2, Clock, PlusCircle } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { StatusBadge } from "@/components/analysis/status-badge";
import { CLAIM_STATUS } from "@/components/analysis/status";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-blocks";
import { appConfig } from "@/config/app-config";
import { useChecks, useRecentStaleClaims } from "@/hooks/use-check";
import { cn, formatDate, scoreColor } from "@/lib/utils";

export function DashboardView() {
  const { data, loading, error, refetch } = useChecks();
  const completed = (data ?? []).filter((c) => c.status === "completed" && c.freshness_score != null);
  const { items: staleItems, loading: staleLoading } = useRecentStaleClaims(data);

  const total = data?.length ?? 0;
  const fresh = completed.filter((c) => (c.freshness_score ?? 0) >= appConfig.freshThreshold).length;
  const stale = completed.length - fresh;
  const avg = completed.length
    ? Math.round(completed.reduce((a, c) => a + (c.freshness_score ?? 0), 0) / completed.length)
    : null;

  const trend = [...completed]
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .map((c) => ({ date: formatDate(c.created_at, false), score: c.freshness_score }));

  const dist = (["current", "stale", "contradicted", "unverifiable"] as const)
    .map((k) => ({
      key: k,
      name: CLAIM_STATUS[k].label,
      value: (data ?? []).reduce((a, c) => a + (c[`${k}_claims` as const] ?? 0), 0),
      color: CLAIM_STATUS[k].hex,
    }))
    .filter((d) => d.value > 0);

  const stats = [
    { label: "Total analyses", value: total, icon: Activity, tone: "text-primary" },
    { label: "Fresh answers", value: fresh, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "Stale answers", value: stale, icon: Clock, tone: "text-red-400" },
    { label: "Avg. freshness score", value: avg ?? "—", icon: BarChart3, tone: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome to FreshCheck</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Paste an AI-generated answer and see which claims are still current, which have gone stale, and what the web says now.
          </p>
        </div>
        <Link href="/new-check" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          <PlusCircle className="h-4 w-4" /> New Analysis
        </Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {s.label} <s.icon className={cn("h-4 w-4", s.tone)} />
                </div>
                {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>}
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Freshness score overview</CardTitle>
                <CardDescription>Score of each completed analysis over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-56" /> : trend.length < 1 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No completed analyses yet.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                        <defs>
                          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#scoreFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Claim status distribution</CardTitle>
                <CardDescription>Across all analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-56" /> : dist.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No claim data yet.</p>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dist} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} stroke="none">
                            {dist.map((d) => <Cell key={d.key} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {dist.map((d) => (
                        <li key={d.key} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name}
                          </span>
                          <span className="tabular-nums">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent analyses</CardTitle>
                <Link href="/history" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  [0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)
                ) : (data ?? []).length === 0 ? (
                  <EmptyState title="No analyses yet" description="Run your first check to see it here." action={<Link href="/new-check" className={buttonVariants({ size: "sm" })}>New Analysis</Link>} />
                ) : (
                  (data ?? []).slice(0, 5).map((c) => (
                    <Link key={c.id} href={`/results/${c.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ background: `${scoreColor(c.freshness_score)}22`, color: scoreColor(c.freshness_score) }}>
                        {c.status === "completed" ? c.freshness_score ?? "—" : "…"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{c.answer_preview || "(no preview)"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently detected stale information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading || staleLoading ? (
                  [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)
                ) : staleItems.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No stale claims detected yet.</p>
                ) : (
                  staleItems.map(({ claim, checkId }) => (
                    <Link key={claim.id} href={`/results/${checkId}#${claim.id}`} className="block rounded-xl border border-border p-3 transition-colors hover:bg-muted/40">
                      <div className="mb-1 flex items-center gap-2">
                        <StatusBadge status={claim.status} />
                        <span className="text-xs capitalize text-muted-foreground">{claim.category}</span>
                      </div>
                      <p className="line-clamp-2 text-sm">{claim.original_text}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
