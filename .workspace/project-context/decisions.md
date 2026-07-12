# Engineering Decisions

Document important technical decisions.

---

## Decision

Use the top-level `client/` as the primary frontend app.

Reason

It contains Tailwind v4, shadcn/ui configuration, generated UI dependencies, and the intended alias configuration.

Impact

Feature work should target `client/`. The nested `client/client/` folder should be treated as duplicate scaffolding until cleanup is approved.

---

## Decision

Keep the backend package as CommonJS for Phase 1.

Reason

The existing `server/package.json` already declares CommonJS. Aligning TypeScript to that choice is lower-risk than switching runtime module systems before backend code exists.

Impact

Express backend files should use TypeScript imports, compiled by `tsc` to CommonJS output.

---

## Decision

Implement stateless JWT authentication for the MVP.

Reason

It satisfies the PDF requirement for secure email/password login and RBAC while keeping the 8-hour hackathon scope manageable.

Impact

`/auth/logout` returns success but does not invalidate tokens server-side. Token revocation can be added later with refresh tokens or a token denylist.

---

## Decision

Use the PDF problem statement as the authoritative business brief.

Reason

It contains specific requirements not present in the initial placeholder docs, including cargo-capacity validation, trip dispatch lifecycle, dashboard filters, and reporting formulas.

Impact

The Prisma schema should be adjusted before vehicle/driver/trip APIs to add missing PDF fields and enum values.
