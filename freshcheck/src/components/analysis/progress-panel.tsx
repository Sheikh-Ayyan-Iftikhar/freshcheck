import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ProgressPanel({ progress, stage }: { progress?: number | null; stage?: string | null }) {
  const pct = progress ?? null;
  return (
    <Card className="flex flex-col items-center gap-5 p-10 text-center">
      <Loader2 className="h-9 w-9 animate-spin text-primary" />
      <div>
        <p className="text-lg font-semibold">Analyzing your answer…</p>
        <p className="mt-1 text-sm text-muted-foreground">{stage ?? "Working on it — this usually takes a few seconds."}</p>
      </div>
      <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-primary transition-all duration-500 ${pct == null ? "w-1/3 animate-pulse" : ""}`}
          style={pct == null ? undefined : { width: `${pct}%` }}
        />
      </div>
      {pct != null && <p className="text-xs tabular-nums text-muted-foreground">{pct}%</p>}
    </Card>
  );
}
