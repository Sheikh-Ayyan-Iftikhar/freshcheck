import axios, { AxiosError } from "axios";
import { appConfig } from "@/config/app-config";

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

/** Turn any thrown value into a message that is safe to show to users. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<{ detail?: unknown; message?: unknown; error?: unknown }>;
    if (!e.response) {
      return e.code === "ECONNABORTED"
        ? "The backend took too long to respond. Please try again."
        : `Can't reach the backend at ${appConfig.apiBaseUrl}. Check that it is running.`;
    }
    const d = e.response.data;
    const msg = [d?.detail, d?.message, d?.error].find((v) => typeof v === "string") as string | undefined;
    if (e.response.status === 404) return msg ?? "That analysis could not be found.";
    if (e.response.status >= 500) return msg ?? "The backend reported an error. Please try again shortly.";
    return msg ?? `Request failed (${e.response.status}).`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
