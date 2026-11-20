import { ExternalLink } from "lucide-react";
import { formatDate, hostname, safeUrl } from "@/lib/utils";
import type { Source } from "@/types/check";

export function SourceCard({ source, note }: { source: Source; note?: string }) {
  const href = safeUrl(source.url);
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{source.title || "Untitled source"}</p>
          {href ? (
            <a
              href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate text-xs text-primary hover:underline"
            >
              <span className="truncate">{hostname(href)}</span> <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">{source.url || "No URL provided"}</span>
          )}
        </div>
        {note && <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{note}</span>}
      </div>
      {source.snippet && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{source.snippet}”</p>}
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <div><dt className="inline">Published: </dt><dd className="inline text-foreground/80">{source.published_date ? formatDate(source.published_date, false) : "Not available"}</dd></div>
        <div><dt className="inline">Retrieved: </dt><dd className="inline text-foreground/80">{formatDate(source.retrieved_at)}</dd></div>
      </dl>
    </div>
  );
}
