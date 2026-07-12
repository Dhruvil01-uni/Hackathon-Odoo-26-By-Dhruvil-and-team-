# Architecture

## System Overview

React/Vite frontend consumes a REST API served by an Express backend. Backend routes delegate to controllers, controllers call services, services enforce business rules and access Prisma, and Prisma persists to PostgreSQL.

---

## Frontend

React 19 + Vite + TypeScript. UI should be organized into pages, layouts, reusable components, hooks, services/API layer, types, and utilities. shadcn/ui components live under `client/src/components/ui`.

---

## Backend

Node.js + Express + TypeScript. Keep responsibilities separated into routes, controllers, services, validators, middleware, constants, types, utils, and Prisma client library.

---

## Database

Prisma schema is the source of truth. Current entities: User, Vehicle, Driver, Trip, Maintenance, FuelLog, Expense. PostgreSQL is the target database.

---

## External APIs

None currently planned.

---

## Authentication

JWT authentication with role-based access control for Fleet Manager, Driver, Safety Officer, and Financial Analyst.

---

## Folder Structure

`client/` contains the primary frontend. `server/` contains backend and Prisma schema. `docs/` contains project documents. `.workspace/` contains project memory and workflows.

---

## Important Design Decisions

- Use top-level `client/` as the primary frontend app.

- Keep Express backend layered: route -> controller -> service -> Prisma.

- Use Prisma 6 with PostgreSQL and generated `@prisma/client`.
