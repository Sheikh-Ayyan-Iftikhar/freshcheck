"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/check";
import { CLAIM_STATUS } from "./status";

interface Segment { text: string; claim?: Claim }

/** Uses backend offsets when valid; falls back to locating the claim text; otherwise leaves it unhighlighted. */
function buildSegments(answer: string, claims: Claim[]): Segment[] {
  const ranges: { start: number; end: number; claim: Claim }[] = [];
  for (const claim of claims) {
    let { start_offset: s, end_offset: e } = claim;
    const validOffsets =
      s != null && e != null && s >= 0 && e > s && e <= answer.length &&
      answer.slice(s, e).trim().length > 0;
    if (!validOffsets) {
      const idx = claim.original_text ? answer.indexOf(claim.original_text) : -1;
      if (idx < 0) continue;
      s = idx;
      e = idx + claim.original_text.length;
    }
    ranges.push({ start: s as number, end: e as number, claim });
  }
  ranges.sort((a, b) => a.start - b.start);

  const out: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue; // skip overlaps
    if (r.start > cursor) out.push({ text: answer.slice(cursor, r.start) });
    out.push({ text: answer.slice(r.start, r.end), claim: r.claim });
    cursor = r.end;
  }
  if (cursor < answer.length) out.push({ text: answer.slice(cursor) });
  return out;
}

export function HighlightedAnswer({ answer, claims }: { answer?: string | null; claims: Claim[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Original answer</CardTitle>
        <CardDescription>Highlighted by claim status. Select a highlight to jump to its analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {Object.values(CLAIM_STATUS).map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", s.dot)} /> {s.label}
            </span>
          ))}
        </div>
        {answer ? (
          <p className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-7">
            {buildSegments(answer, claims).map((seg, i) =>
              seg.claim ? (
                <a
                  key={i}
                  href={`#${seg.claim.id}`}
                  title={`${CLAIM_STATUS[seg.claim.status].label} — ${seg.claim.category}`}
                  className={cn(
                    "rounded px-0.5 underline decoration-2 underline-offset-4 transition-colors hover:brightness-125",
                    CLAIM_STATUS[seg.claim.status].mark,
                  )}
                >
                  {seg.text}
                </a>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            The backend did not return the original answer text.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
