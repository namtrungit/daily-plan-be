# Backend study plan (`daily-plan-be`) — by day

Use this file as the **single source of truth** for backend progress. Check off items as you finish. When you open a new chat, point the assistant at this file (or `@daily-plan-be/PLAN.md`) so context carries over.

**Stack target:** NestJS + PostgreSQL + JWT. ORM: pick **Prisma** or **TypeORM** on Day 1 and stick with it.

**Decisions** (see repo root `AGENTS.md` → Decisions log):

- **Calendar dates:** **Option A** — API uses `YYYY-MM-DD` as the calendar day; store as date-only in DB (see `docs/STUDY_PLAN.md`).
- **ORM:** **Prisma** (with `@prisma/adapter-pg` + PostgreSQL).

---

## Progress snapshot

| Day | Theme                         | Status |
|-----|-------------------------------|--------|
| 0   | Nest scaffold (default app)   | Done   |
| 1   | Postgres + config + ORM     | Done   |
| 2   | Schema + migrations           | [ ]    |
| 3   | Auth (register/login) + JWT | [ ]    |
| 4   | `GET /plans?date=` + user scope | [ ]  |
| 5   | CRUD `PlanItem` under day plan | [ ]   |
| 6   | Health, validation, errors, CORS | [ ] |

_Update the Status column as you go._

---

## Day 0 — Scaffold (done)

- [x] Nest CLI project under `daily-plan-be/`
- [x] Default `AppModule` / `AppController` running

**Deliverable:** `npm run start:dev` works.

---

## Day 1 — PostgreSQL + configuration + ORM bootstrap (done)

**Goals**

- [x] PostgreSQL running locally (Docker or host) and a database created for this app
- [x] `.env` with `DATABASE_URL` (or equivalent); `.env.example` with placeholders (no secrets)
- [x] `@nestjs/config` (or equivalent) loading env in `AppModule`
- [x] Install and initialize **Prisma** or **TypeORM**; Nest integration module wired
- [x] First successful connection (e.g. trivial query or migrate status)

**Deliverable:** App boots with DB config; no domain models yet.

**Notes / files:** `src/app.module.ts`, `src/main.ts`, ORM config files (`prisma/schema.prisma` or `data-source`/entities folder).

---

## Day 2 — Domain model + migrations

**Goals**

- [ ] `User` (at minimum: id, credentials fields you choose, timestamps)
- [ ] `DayPlan` — **unique** `(userId, date)` where `date` is calendar day (`YYYY-MM-DD` rule from decisions)
- [ ] `PlanItem` — belongs to `DayPlan`; fields aligned with product: title, optional time, notes, done flag, ordering if needed
- [ ] Migration(s) applied; DB tables match schema

**Deliverable:** Schema in DB; relations enforced.

---

## Day 3 — Authentication (JWT)

**Goals**

- [ ] Register + login (or login-only if you seed users) with hashed passwords (`bcrypt` or similar)
- [ ] Issue JWT on login; `@nestjs/jwt` + Passport JWT strategy / guard (or Nest-approved pattern)
- [ ] Extract `userId` (or sub) in guards for downstream controllers

**Deliverable:** Protected route example (can be dummy) that returns 401 without token.

---

## Day 4 — Get plan by date (authenticated)

**Goals**

- [ ] `GET /plans?date=YYYY-MM-DD` (or `GET /plans/:date` — pick one and document here)
- [ ] Scope to **current user** only
- [ ] **Find or create** `DayPlan` for that user + date if missing (empty items list)
- [ ] DTO + `class-validator` for query param; global or controller `ValidationPipe`

**Deliverable:** Frontend-ready JSON for “one day’s plan” including items (may be empty).

---

## Day 5 — CRUD for plan items

**Goals**

- [ ] Create / update / delete (and optionally list-only if GET plan already lists items) for `PlanItem` under a `DayPlan`
- [ ] Routes nested under plans or by `dayPlanId` — choose REST shape and keep it consistent
- [ ] Authorization: items only accessible if they belong to the user’s `DayPlan`

**Deliverable:** Full checklist lifecycle for a single day.

---

## Day 6 — Operational + API polish

**Goals**

- [ ] `GET /health` (simple OK or DB ping via `@nestjs/terminus` if you want)
- [ ] Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted` as appropriate)
- [ ] Consistent error JSON shape for REST failures
- [ ] `enableCors()` in `main.ts` when preparing for Next.js (origins from env in production)

**Deliverable:** API feels “production-shaped” for local dev and future deploy.

---

## Quick context for assistants (copy-paste)

```text
Backend lives in daily-plan-be/ (NestJS). Follow daily-plan-be/PLAN.md day-by-day.
Domain: User, DayPlan (unique per user + calendar date), PlanItem.
Next unchecked day in PLAN.md table = current focus.
```

When a day is finished, check boxes and update **AGENTS.md** “Next 3 tasks” at repo root so high-level docs stay aligned.
