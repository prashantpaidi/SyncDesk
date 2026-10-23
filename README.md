# SyncDesk

[![CI](https://github.com/prashantpaidi/SyncDesk/actions/workflows/ci.yml/badge.svg)](https://github.com/prashantpaidi/SyncDesk/actions/workflows/ci.yml)

SyncDesk is a robust, full-stack helpdesk and ticket management system. It features a high-performance **Java Spring Boot 4** backend and a modern, responsive **React 19** frontend.

## 🚀 Key Features

- **Multi-Role Dashboards:** Tailored experiences for Administrators, Managers, Agents, and Customers.
- **Ticket Management:** Create, view, update, and track support tickets throughout their lifecycle.
- **Collaboration:** Add comments to tickets for internal communication and customer updates.
- **Real-time Metrics:** Data-driven insights on dashboards for tracking team performance (Unassigned tickets, Priority counts, Weekly trends).
- **Secure Authentication:** JWT-based stateless authentication with secure persistent storage.
- **Responsive Design:** Premium UI built with Tailwind CSS, featuring dark mode and smooth animations.

## 🛠️ Technology Stack

### Backend
- **Core:** Java 21, Spring Boot 4.0.2
- **Security:** Spring Security, JWT (JJWT)
- **Data:** Spring Data JPA, PostgreSQL
- **Utilities:** Lombok, Jakarta Validation
- **Build:** Maven

### Frontend
- **Core:** React 19, TypeScript, Vite
- **State Management:** TanStack React Query (v5)
- **Routing:** React Router 7
- **Forms:** React Hook Form & Zod
- **Styling:** Tailwind CSS 4, Lucide React
- **Typography:** IBM Plex Mono, Sora

## 📂 Project Structure

```text
SyncDesk/
├── backend/                # Spring Boot Application
│   ├── src/main/java/com/syncdesk/
│   │   ├── config/         # Security & App Configuration
│   │   ├── controller/     # REST API Endpoints
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # JPA Entities (User, Ticket, Comment)
│   │   ├── enums/          # TicketStatus, Role
│   │   ├── repository/     # Data Access Layer
│   │   └── service/        # Business Logic Layer
│   └── docker-compose.yml  # Infrastructure (PostgreSQL)
├── frontend/               # React Application
│   ├── src/
│   │   ├── features/       # Modular features (auth, tickets)
│   │   ├── pages/          # Page components & Dashboards
│   │   ├── components/     # High-level UI components
│   │   └── hooks/          # Shared custom hooks
│   └── index.html
└── docs/                   # Extended Documentation (coming soon)
```

## 🚥 Getting Started

### Backend Setup

1. **Environment Config:** Create a `.env` file in the `backend/` directory:
   ```env
   POSTGRES_DB=syncdesk
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=yourpassword
   JWT_SECRET=your_super_secret_key_at_least_32_characters
   ```

2. **Run Infrastructure:**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Start Application:**
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

The backend test suite consists of integration tests that run against a **real PostgreSQL database** started by [Testcontainers](https://testcontainers.com/). Very little is stubbed: each test drives the real Spring Security filter chain, controllers, services and repositories, and verifies the resulting state and queries against the real PostgreSQL database.

### Prerequisites

- **Docker must be running.** Testcontainers pulls, starts and removes a disposable `postgres:16-alpine` container automatically.
- No local PostgreSQL is required, and no environment variables need to be set — the `test` profile (`backend/src/test/resources/application-test.yml`) provides the configuration, including a throw-away JWT signing key.

### Commands

```bash
cd backend

# Run the test suite
./mvnw test

# Full verification: tests + coverage report
./mvnw verify
```

### Coverage

JaCoCo runs as part of the build. Both commands above produce an HTML report at:

```text
backend/target/site/jacoco/index.html
```

Machine-readable results are written to `backend/target/site/jacoco/jacoco.csv`. Coverage is currently measured but not enforced — the baseline is **70.2% line / 50.0% branch** and future PRs should build on it.

## ✅ Continuous Integration

[CI](.github/workflows/ci.yml) runs on every pull request and on pushes to `main`. The **backend** and **frontend** jobs run in parallel:

- **Backend** — sets up Java 21, restores the Maven cache, and runs `./mvnw -B verify` from `backend/`. This is the same command developers run locally: it compiles, runs the full test suite and the integration tests, and generates the JaCoCo report. The integration tests start a `postgres:16-alpine` database through Testcontainers on the runner, so no external database or production secrets are required. The JaCoCo HTML report is uploaded as the `backend-jacoco-report` artifact.
- **Frontend** — sets up Node 24, restores the npm cache, installs dependencies with `npm ci`, runs `npm run lint`, and produces the production build with `npm run build`.

Concurrency is configured so a newer push to the same branch or PR cancels any in-progress run for that ref.

## 📖 Additional Documentation

- [Architecture Overview](architecture.md)
- [API Documentation](api_docs.md)
