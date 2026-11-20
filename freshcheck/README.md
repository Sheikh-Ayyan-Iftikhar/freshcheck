# FreshCheck — Frontend

Next.js (App Router) + TypeScript + Tailwind frontend for **FreshCheck**, the AI stale-answer detector.
Frontend only — the backend, Tavily and the verification engine live elsewhere.

## Quick start
```bash
npm install
cp .env.example .env.local   # already included as .env.local
npm run dev                  # http://localhost:3000
```
Mock mode is **on by default**, so the whole app works with no backend.

## Connecting the real backend
In `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCKS=false
```
Restart `npm run dev`. No UI code changes needed. Never put API secrets in `NEXT_PUBLIC_*` variables.

## Routes
`/` dashboard · `/new-check` submit · `/results/[id]` results · `/history` · `/settings`

## Architecture
| Layer | File |
|---|---|
| Types | `src/types/check.ts` |
| Axios client + error messages | `src/lib/api.ts` |
| Service (mock/live switch, response normalisation) | `src/services/check-service.ts` |
| Hooks (polling, list, submit lock) | `src/hooks/use-check.ts` |
| Mock data / mock backend simulator | `src/mocks/mock-data.ts`, `src/mocks/mock-api.ts` |
| Config | `src/config/app-config.ts` |

## API contract (proposed — confirm with backend dev)
- `POST /api/checks` `{answer}` → `{id, status}`
- `GET /api/checks/:id` → result (see `CheckResult`)
- `GET /api/checks` → array of summaries (or `{items: [...]}`) — see `CheckSummary`
- Progress uses **polling** of `GET /api/checks/:id` (every 1.5 s). SSE (`/events`) can be swapped into `useCheck`.

**Fields the frontend needs beyond the original sketch** (all optional/handled gracefully):
- `original_answer` on the result and `answer_preview` + `created_at` on list items
- `contradicted_claims` count, `progress` (0–100) and `stage` while processing
- `start_offset` / `end_offset` per claim for precise highlighting (falls back to text matching)
- Claim `status` values: `current | stale | contradicted | unverifiable`

## Using 21st.dev components
The UI primitives in `src/components/ui` follow shadcn/ui conventions (Tailwind + CSS-variable tokens in `globals.css`), so components from https://21st.dev can be added with `npx shadcn@latest init` followed by `npx shadcn@latest add "<component url from 21st.dev>"`.

## Notes
- Mock results are labelled "Demo data" in the UI and stored in `localStorage`.
- The profile and theme settings are browser-local only; there is no authentication.
- Fonts load from Google Fonts (Inter) at build time, so the first build needs internet access.
