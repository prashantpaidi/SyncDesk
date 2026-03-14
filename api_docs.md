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
| PATCH  | `/{id}/status`      | Update ticket status        | Yes           | AGENT, MANAGER, ADMIN |
| PATCH  | `/{id}/assign/{uid}`| Assign ticket to user       | Yes           | MANAGER, ADMIN        |
| DELETE | `/{id}`             | Delete a ticket             | Yes           | ADMIN                 |

### 💬 Ticket Comments

| Method | Endpoint            | Description                 | Auth Required |
|--------|---------------------|-----------------------------|---------------|
| POST   | `/{id}/comments`    | Add comment to ticket       | Yes           |
| GET    | `/{id}/comments`    | Get comments for a ticket   | Yes           |

## 👤 User Management

Base Path: `/api/users`

| Method | Endpoint | Description        | Auth Required | Roles          |
|--------|----------|--------------------|---------------|----------------|
| GET    | `/`      | List all users     | Yes           | MANAGER, ADMIN |

---
**Note:** All protected endpoints require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <token>`
