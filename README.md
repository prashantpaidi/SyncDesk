# SyncDesk

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

## 📖 Additional Documentation

- [Architecture Overview](architecture.md)
- [API Documentation](api_docs.md)
