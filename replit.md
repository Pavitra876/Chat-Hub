# Chatter

A real-time group chat web app with rooms, live messaging via WebSocket, and user presence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/chat-app run dev` — run the frontend (port 18228)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, TanStack Query, Wouter, Framer Motion
- API: Express 5 + WebSocket (ws)
- Auth: Replit Auth (OpenID Connect with PKCE)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas (used by server)
- `lib/db/src/schema/` — Drizzle DB schema (auth.ts, chat.ts)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/websocket.ts` — WebSocket server (rooms presence)
- `artifacts/chat-app/src/` — React frontend
- `lib/replit-auth-web/` — browser auth hook (`useAuth()`)

## Architecture decisions

- WebSocket server lives in the API server at path `/ws`, listed in `artifact.toml paths` for proxy routing
- Real-time messages broadcast to room subscribers via `global.__broadcast(roomId, payload)`
- Online presence tracked in `global.__onlineUsers` Map (userId → Set<WebSocket>)
- Messages endpoint returns last 50 messages (no pagination on first build)
- Auth uses Replit OIDC — no custom login forms; `GET /api/login` starts the flow

## Product

- Browse and create chat rooms
- Real-time messaging via WebSocket (auto-reconnect, exponential backoff)
- Live presence (online user count broadcasts on connect/disconnect)
- Room stats dashboard (total rooms, messages, online users)
- Login via Replit account (single sign-on)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run codegen after every spec change: `pnpm --filter @workspace/api-spec run codegen`
- The `/ws` path must stay in `artifacts/api-server/.replit-artifact/artifact.toml` paths array or WebSocket connections are silently dropped by the proxy
- Zod schema names follow Orval conventions: `CreateRoomBody`, `SendMessageBody` (not `RoomInput`/`MessageInput`)
- Operations with both path + query params generate a `Params` Zod schema that collides with types/; avoid by keeping path-only or query-only params per operation

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `replit-auth` skill for auth flow details
