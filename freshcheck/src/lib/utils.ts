import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { appConfig } from "@/config/app-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string | null, withTime = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function scoreLabel(score?: number | null): string {
  if (score == null) return "Pending";
  if (score >= appConfig.freshThreshold) return "Mostly fresh";
  if (score >= 40) return "Partially stale";
  return "Stale";
}

export function scoreColor(score?: number | null): string {
  if (score == null) return "#64748b";
  if (score >= appConfig.freshThreshold) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

/** Only allow http(s) links to be rendered as anchors. */
export function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
