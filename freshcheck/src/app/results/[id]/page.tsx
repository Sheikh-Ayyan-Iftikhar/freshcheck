"use client";

import { useParams } from "next/navigation";
import { ResultsView } from "@/components/analysis/results-view";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  return <ResultsView id={decodeURIComponent(params.id)} />;
}
