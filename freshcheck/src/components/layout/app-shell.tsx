"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, PlusCircle, Settings, ShieldCheck, FlaskConical } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { appConfig } from "@/config/app-config";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-check", label: "New Check", icon: PlusCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">FreshCheck</span>
    </Link>
  );
}

function ProfileBlock() {
  const { name } = useProfile();
  const initials = (name || "Guest").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name || "Guest"}</p>
        <p className="truncate text-xs text-muted-foreground">Local profile</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = NAV.find((n) => isActive(pathname, n.href));

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 border-r border-border bg-card/60 p-5 lg:flex">
        <Logo />
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <ProfileBlock />
      </aside>

      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden"><Logo /></div>
            <span className="hidden text-sm text-muted-foreground lg:inline">{current?.label ?? "FreshCheck"}</span>
          </div>
          <div className="flex items-center gap-3">
            {appConfig.useMocks && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                <FlaskConical className="h-3 w-3" /> Mock mode
              </span>
            )}
            <Link href="/new-check" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
              <PlusCircle className="h-4 w-4" /> New Analysis
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl animate-fade-in px-4 py-6 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              isActive(pathname, href) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
