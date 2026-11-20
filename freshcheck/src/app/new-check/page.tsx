import { NewCheckForm } from "@/components/analysis/new-check-form";

export default function NewCheckPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">Check whether an AI answer is still up to date.</p>
      </div>
      <NewCheckForm />
    </div>
  );
}
