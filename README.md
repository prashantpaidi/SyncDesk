# SyncDesk

SyncDesk is a full-stack web application featuring a Java Spring Boot backend and a modern React frontend. It provides user authentication (registration and login) powered by JWT and uses PostgreSQL for data persistence.

## Technologies Used

### Backend
- **Java 21**
- **Spring Boot 4.0.2** (Security, Data JPA, Validation)
- **PostgreSQL**
- **JWT** (for Authentication)
- **Lombok**
- **Maven** (Build Tool)

### Frontend
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS 4**
- **React Router 7**
- **React Query** (Data Fetching)
- **React Hook Form & Zod** (Form Handling & Validation)
- **Lucide React & React Icons**

## Getting Started

### Prerequisites
- [Java 21](https://jdk.java.net/21/) or higher
- [Node.js](https://nodejs.org/) & npm
- [Docker](https://www.docker.com/) & Docker Compose (for running the database)

### Running the Environment

#### 1. Start the Database
The project includes a `docker-compose.yml` file to quickly spin up a PostgreSQL instance.

```bash
cd backend
```
Make sure to create a `.env` file in the `backend` directory containing the following variables:
```env
POSTGRES_DB=syncdesk
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
```

Then, run:
```bash
docker-compose up -d
```

#### 2. Start the Backend
The backend uses the Maven Wrapper.

**On Windows:**
```bash
cd backend
mvnw.cmd spring-boot:run
```

**On macOS/Linux:**
```bash
cd backend
./mvnw spring-boot:run
```

#### 3. Start the Frontend
The frontend is built with React and Vite. Navigate to the `frontend` directory to run it.

```bash
cd frontend
npm install
npm run dev
```

## Features Complete (so-far)
- **User Authentication:** Complete registration and login flows including UI and REST API.
- **Form Validation:** Client-side validation using React Hook Form and Zod, backed by server-side validation.
- **RESTful API:** Structured API endpoints handling cross-origin requests (CORS).
- **Modern UI:** Tailwind CSS for styling and cohesive typography with IBM Plex Mono and Sora fonts.
