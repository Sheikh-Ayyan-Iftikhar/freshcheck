"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, Moon, RefreshCw, Sun, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/config/app-config";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { checkBackend, type BackendStatus } from "@/services/check-service";
import { toast } from "sonner";

export function SettingsView() {
  const { name, setName } = useProfile();
  const [draft, setDraft] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => setDraft(name), [name]);
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  async function ping() {
    setChecking(true);
    setStatus(await checkBackend());
    setChecking(false);
  }
  useEffect(() => { ping(); }, []);

  function applyTheme(t: "dark" | "light") {
    setTheme(t);
    document.documentElement.classList.toggle("light", t === "light");
    try { localStorage.setItem("freshcheck.theme", t); } catch { /* ignore */ }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferences are stored in this browser only.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Application</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Name</dt><dd>{appConfig.name}</dd>
            <dt className="text-muted-foreground">Version</dt><dd>0.1.0</dd>
            <dt className="text-muted-foreground">Data source</dt>
            <dd>{appConfig.useMocks ? "Mock data (demo)" : "Live backend"}</dd>
            <dt className="text-muted-foreground">API base URL</dt>
            <dd className="break-all">{appConfig.apiBaseUrl}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Backend connection</CardTitle>
            <CardDescription>Checks whether the FreshCheck API is reachable.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={ping} disabled={checking}>
            <RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} /> Recheck
          </Button>
        </CardHeader>
        <CardContent>
          {!status ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</p>
          ) : status.mode === "mock" ? (
            <p className="flex items-center gap-2 text-sm text-amber-400">
              <FlaskConical className="h-4 w-4" /> Mock mode is on — no backend is contacted. Set NEXT_PUBLIC_USE_MOCKS=false to go live.
            </p>
          ) : status.ok ? (
            <p className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Connected ({status.latencyMs} ms)
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-red-400"><XCircle className="h-4 w-4" /> {status.error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <Button key={t} variant={theme === t ? "default" : "outline"} onClick={() => applyTheme(t)} className="capitalize">
              {t === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {t}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>A display name shown in the sidebar. FreshCheck has no accounts or sign-in; this stays on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); setName(draft.trim()); toast.success("Display name saved on this device"); }}
          >
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Display name" maxLength={40} aria-label="Display name" />
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
