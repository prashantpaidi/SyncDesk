# API Documentation

This document provides a reference for the REST API endpoints available in the SyncDesk backend.

## 🔑 Authentication

Base Path: `/api/auth`

| Method | Endpoint    | Description             | Auth Required | Request Body              |
|--------|-------------|-------------------------|---------------|---------------------------|
| POST   | `/register` | Register a new user     | No            | `RegisterRequest` (JSON)  |
| POST   | `/login`    | Login and receive JWT   | No            | `LoginRequest` (JSON)     |

## 🎟️ Ticket Management

Base Path: `/api/tickets`

| Method | Endpoint            | Description                 | Auth Required | Roles                 |
|--------|---------------------|-----------------------------|---------------|-----------------------|
| POST   | `/`                 | Create a new ticket         | Yes           | Any                   |
| GET    | `/`                 | List all relevant tickets   | Yes           | Any (Filtered by role)|
| GET    | `/{id}`             | Get ticket details          | Yes           | Any                   |
| PATCH  | `/{id}/status`      | Update ticket status        | Yes           | See status transitions below |
| PATCH  | `/{id}/assign/{uid}`| Assign ticket to user       | Yes           | MANAGER, ADMIN        |
| DELETE | `/{id}`             | Delete a ticket             | Yes           | ADMIN                 |

**Ticket status transitions**

Changing a ticket's status is a workflow action rather than an administrative one, so `ADMIN` has no override. A `CLOSED` ticket cannot be transitioned again. Callers without the required role receive `403`.

| Target status       | Allowed roles         | Allowed from            |
|---------------------|-----------------------|-------------------------|
| `RESOLVED`          | `AGENT`, `MANAGER`    | `OPEN`, `IN_PROGRESS`   |
| `OPEN` (reopen)     | `AGENT`, `MANAGER`    | `RESOLVED`              |
| `CLOSED`            | `CUSTOMER`            | `RESOLVED`              |
| `IN_PROGRESS`       | any authenticated user| any status except `CLOSED` |
| `REOPENED`          | any authenticated user| any status except `CLOSED` |

### 💬 Ticket Comments

| Method | Endpoint            | Description                 | Auth Required |
|--------|---------------------|-----------------------------|---------------|
| POST   | `/{id}/comments`    | Add comment to ticket       | Yes           |
| GET    | `/{id}/comments`    | Get comments for a ticket   | Yes           |

## 📊 Dashboard

Base Path: `/api/dashboard`

| Method | Endpoint   | Description              | Auth Required | Roles                  |
|--------|------------|--------------------------|---------------|------------------------|
| GET    | `/metrics` | Aggregate ticket metrics | Yes           | AGENT, MANAGER, ADMIN  |

Returns global aggregate counts: total tickets, count per status, count per priority and the
unassigned count. The payload is identical for every authorised caller, so it is served
cache-aside from Redis under a single shared key (`dashboardMetrics::global`, 60 s TTL) and
evicted whenever a ticket is created, reassigned, status-changed or deleted. Customers receive
`403`; anonymous callers receive `401`.

## 👤 User Management

Base Path: `/api/users`

| Method | Endpoint | Description        | Auth Required | Roles          |
|--------|----------|--------------------|---------------|----------------|
| GET    | `/`      | List all users     | Yes           | MANAGER, ADMIN |

---
**Note:** All protected endpoints require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <token>`
