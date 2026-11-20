import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, hostname, safeUrl } from "@/lib/utils";
import type { Claim } from "@/types/check";
import { StatusBadge } from "./status-badge";
import { CLAIM_STATUS, VOLATILITY_STYLE } from "./status";

export function ClaimCard({ claim }: { claim: Claim }) {
  const s = CLAIM_STATUS[claim.status];
  const conf = claim.confidence != null ? Math.round(claim.confidence * 100) : null;
  return (
    <Card id={claim.id} className="scroll-mt-20 overflow-hidden">
      <div className="h-1" style={{ background: s.hex }} />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={claim.status} />
          <Badge className="border-border bg-muted/50 capitalize text-muted-foreground">{claim.category}</Badge>
          <Badge className={cn("capitalize", VOLATILITY_STYLE[claim.volatility])}>{claim.volatility} volatility</Badge>
          {conf != null && (
            <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              Confidence
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full" style={{ width: `${conf}%`, background: s.hex }} />
              </span>
              <span className="tabular-nums text-foreground/80">{conf}%</span>
            </span>
          )}
        </div>

        <blockquote className="border-l-2 border-border pl-3 text-sm italic text-foreground/90">
          {claim.original_text || "—"}
        </blockquote>

        {claim.current_information && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Updated information</p>
            <p className="mt-1 text-sm">{claim.current_information}</p>
          </div>
        )}

        {claim.explanation && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">Why: </span>
            {claim.explanation}
          </p>
        )}

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Supporting evidence</p>
          {claim.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supporting sources were returned for this claim.</p>
          ) : (
            <ul className="space-y-1">
              {claim.sources.map((src, i) => {
                const href = safeUrl(src.url);
                return (
                  <li key={i} className="text-sm">
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        {src.title || hostname(href)} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{src.title || src.url}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
