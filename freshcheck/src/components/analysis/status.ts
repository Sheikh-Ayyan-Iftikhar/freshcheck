import { CheckCircle2, Clock, HelpCircle, ShieldAlert, type LucideIcon } from "lucide-react";
import type { ClaimStatus, Volatility } from "@/types/check";

export const CLAIM_STATUS: Record<
  ClaimStatus,
  { label: string; icon: LucideIcon; badge: string; mark: string; dot: string; hex: string }
> = {
  current: {
    label: "Current", icon: CheckCircle2, hex: "#10b981", dot: "bg-emerald-500",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    mark: "bg-emerald-500/20 decoration-emerald-500/60",
  },
  stale: {
    label: "Stale", icon: Clock, hex: "#ef4444", dot: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
    mark: "bg-red-500/20 decoration-red-500/60",
  },
  unverifiable: {
    label: "Unverifiable", icon: HelpCircle, hex: "#f59e0b", dot: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    mark: "bg-amber-500/20 decoration-amber-500/60",
  },
  contradicted: {
    label: "Contradicted", icon: ShieldAlert, hex: "#a855f7", dot: "bg-purple-500",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    mark: "bg-purple-500/20 decoration-purple-500/60",
  },
};

export const VOLATILITY_STYLE: Record<Volatility, string> = {
  low: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  medium: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
};
