import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/types/check";
import { CLAIM_STATUS } from "./status";

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const s = CLAIM_STATUS[status];
  const Icon = s.icon;
  return (
    <Badge className={cn(s.badge, className)}>
      <Icon className="h-3 w-3" /> {s.label}
    </Badge>
  );
}
