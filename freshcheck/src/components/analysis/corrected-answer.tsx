"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CorrectedAnswer({ text, isMock }: { text?: string | null; isMock?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Corrected answer copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Card className="border-primary/40 bg-primary/[0.04]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Corrected answer</CardTitle>
          <CardDescription>
            {isMock ? "Demo correction generated locally in mock mode." : "Provided by the FreshCheck backend."}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={copy} disabled={!text}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <div className="px-5 pb-5">
        {text ? (
          <p className="whitespace-pre-wrap rounded-xl border border-primary/20 bg-background/60 p-4 text-sm leading-7">{text}</p>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            The backend did not provide a corrected answer for this analysis.
          </p>
        )}
      </div>
    </Card>
  );
}
