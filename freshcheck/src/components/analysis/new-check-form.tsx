"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Eraser, FileText, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { appConfig } from "@/config/app-config";
import { useCreateCheck } from "@/hooks/use-check";
import { getErrorMessage } from "@/lib/api";
import { SAMPLE_ANSWER } from "@/mocks/mock-data";

const schema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "Paste an AI-generated answer to analyze.")
    .max(appConfig.maxAnswerLength, `Answers are limited to ${appConfig.maxAnswerLength.toLocaleString()} characters.`),
});
type FormValues = z.infer<typeof schema>;

export function NewCheckForm() {
  const router = useRouter();
  const { submit, submitting } = useCreateCheck();
  const {
    register, handleSubmit, watch, setValue, reset, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { answer: "" } });

  const length = (watch("answer") ?? "").length;
  const over = length > appConfig.maxAnswerLength;

  async function onSubmit({ answer }: FormValues) {
    try {
      const res = await submit(answer);
      if (res) router.push(`/results/${res.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="answer" className="text-sm font-medium">AI-generated answer</label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={submitting}
              onClick={() => setValue("answer", SAMPLE_ANSWER, { shouldValidate: true })}>
              <FileText className="h-3.5 w-3.5" /> Sample answer
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={submitting || length === 0}
              onClick={() => reset({ answer: "" })}>
              <Eraser className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>

        <Textarea
          id="answer" rows={12} disabled={submitting}
          placeholder="Paste the answer you got from ChatGPT, Claude, Gemini…"
          aria-invalid={!!errors.answer}
          className={errors.answer || over ? "border-red-500/60" : undefined}
          {...register("answer")}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs">
            {errors.answer ? (
              <p className="text-red-400" role="alert">{errors.answer.message}</p>
            ) : (
              <p className="text-muted-foreground">We extract factual claims and compare them with current web evidence.</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs tabular-nums ${over ? "text-red-400" : "text-muted-foreground"}`}>
              {length.toLocaleString()} / {appConfig.maxAnswerLength.toLocaleString()}
            </span>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Analyze Answer"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
