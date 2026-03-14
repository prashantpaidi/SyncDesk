# System Architecture

This document describes the high-level architecture and design patterns used in the SyncDesk project.

## 🏛️ Overall Architecture

SyncDesk follows a classic **Client-Server** architecture with a clear separation between the data-driven backend and the interactive frontend.

### Backend (Java Spring Boot)

The backend is built using a layered architecture to ensure maintainability and testability:

1.  **Controller Layer:** Handles incoming HTTP requests, validates input using Jakarta Validation, and returns standardized JSON responses.
2.  **Service Layer:** Contains the core business logic. It orchestrates operations between repositories and maps entities to DTOs.
3.  **Repository Layer:** Uses Spring Data JPA to interact with the PostgreSQL database.
4.  **Entity Layer:** Defines the domain model using JPA annotations.
5.  **Security Layer:** Implements stateless authentication using Spring Security and JWT.

### Frontend (React & TypeScript)

The frontend is organized using a **Feature-based** structure:

1.  **Features:** Encapsulates logic, components, and hooks related to a specific domain (e.g., `auth`, `tickets`).
2.  **Pages:** Higher-level components that represent entire routes and compose feature components.
3.  **Hooks:** Custom React hooks for data fetching (React Query) and shared logic.
4.  **Components:** Shared UI components used throughout the application.

## 🔐 Security Model

- **Authentication:** Users authenticate via `/api/auth/login`. On success, the server issues a JWT.
- **Authorization:** Standard JWT validation filter checks the token on every request. Roles (`ADMIN`, `MANAGER`, `AGENT`, `CUSTOMER`) are embedded in the JWT and checked by Spring Security.
- **Data Protection:** CORS is configured to allow requests only from the frontend origin. Sensitive information is hashed (passwords) or managed via environment variables.

## 🔄 Data Flow

1.  **User Action:** User submits a form or clicks a button on the React UI.
2.  **API Call:** React Hook Form collects data, and a React Query mutation sends a request to the Spring Boot API.
3.  **Processing:** The Controller receives the request, the Service performs business logic, and the Repository persists changes to PostgreSQL.
4.  **Response:** The API returns a DTO. React Query updates the local cache, and the UI re-renders to reflect the changes.

## 🗄️ Database Schema

The core entities are:
- **User:** Stores credentials, profile info, and role.
- **Ticket:** Central entity for support requests, linked to a creator and an assignee.
- **TicketComment:** Linked to a Ticket and a User, providing a history of communication.
