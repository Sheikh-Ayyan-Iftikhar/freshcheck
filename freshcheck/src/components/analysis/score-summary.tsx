import { Card } from "@/components/ui/card";
import { scoreColor, scoreLabel } from "@/lib/utils";
import type { CheckResult } from "@/types/check";
import { ScoreRing } from "./score-ring";
import { CLAIM_STATUS } from "./status";

export function ScoreSummary({ check }: { check: CheckResult }) {
  const tiles = [
    { label: "Total claims", value: check.total_claims, dot: "bg-primary" },
    { label: "Current", value: check.current_claims, dot: CLAIM_STATUS.current.dot },
    { label: "Stale", value: check.stale_claims, dot: CLAIM_STATUS.stale.dot },
    { label: "Unverifiable", value: check.unverifiable_claims, dot: CLAIM_STATUS.unverifiable.dot },
    ...(check.contradicted_claims > 0
      ? [{ label: "Contradicted", value: check.contradicted_claims, dot: CLAIM_STATUS.contradicted.dot }]
      : []),
  ];
  return (
    <Card className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-center md:gap-10">
      <ScoreRing score={check.freshness_score} />
      <div className="w-full flex-1">
        <p className="text-sm text-muted-foreground">Overall status</p>
        <p className="text-2xl font-semibold" style={{ color: scoreColor(check.freshness_score) }}>
          {scoreLabel(check.freshness_score)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${t.dot}`} /> {t.label}
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
