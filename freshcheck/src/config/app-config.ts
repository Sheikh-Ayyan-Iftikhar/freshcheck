export const appConfig = {
  name: "FreshCheck",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  /** Mock mode is ON unless NEXT_PUBLIC_USE_MOCKS is explicitly "false". */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
  pollIntervalMs: 1500,
  requestTimeoutMs: 15000,
  /** Answers scoring at or above this are treated as "fresh" in dashboard stats. */
  freshThreshold: 70,
  maxAnswerLength: 8000,
} as const;
