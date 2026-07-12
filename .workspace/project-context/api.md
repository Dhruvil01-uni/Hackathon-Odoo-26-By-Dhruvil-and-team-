# API Tracker

## Completed APIs

- GET /health
- POST /auth/login
- GET /auth/me
- POST /auth/logout
- GET /vehicles
- GET /vehicles/dispatchable
- GET /vehicles/:id
- POST /vehicles
- PUT /vehicles/:id
- DELETE /vehicles/:id
- GET /drivers
- GET /drivers/dispatchable
- GET /drivers/:id
- POST /drivers
- PUT /drivers/:id
- DELETE /drivers/:id
- GET /trips
- GET /trips/:id
- POST /trips
- PUT /trips/:id
- POST /trips/:id/dispatch
- POST /trips/:id/complete
- POST /trips/:id/cancel
- DELETE /trips/:id
- GET /maintenance
- GET /maintenance/:id
- POST /maintenance
- PUT /maintenance/:id
- POST /maintenance/:id/complete
- DELETE /maintenance/:id
- GET /fuel
- GET /fuel/:id
- POST /fuel
- PUT /fuel/:id
- DELETE /fuel/:id
- GET /expenses
- GET /expenses/:id
- POST /expenses
- PUT /expenses/:id
- DELETE /expenses/:id
- GET /dashboard
- GET /reports
- GET /reports/export.csv

---

## Planned APIs

- /users
- /settings

---

## External APIs

-

---

## Authentication

JWT authentication with RBAC middleware. Login returns a bearer token and safe user object. Logout is stateless and client-side token invalidation is expected for MVP.

---

## Notes

All endpoints must use a consistent response format: success, message, data, and errors when applicable.

Implemented response shape:

- success
- message
- data
- errors
