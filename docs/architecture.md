# ACE Platform Architecture Guide

This document outlines the architectural structure for the ACE platform, designed for scalability, maintainability, and alignment with enterprise standards.

## 1. Root Monorepo Structure

The project follows a lightweight monorepo structure to manage both frontend and backend in a single repository.

```
/
├── package.json          # Root dependencies and workspaces (if using npm workspaces)
├── .gitignore            # Global git ignore
├── .editorconfig         # Code consistency configuration
├── README.md             # Project documentation
├── docs/                 # Documentation folder
│   ├── architecture.md   # This file
│   └── folder-structure.md
├── backend/              # Fastify Backend Application
└── frontend/             # React Frontend Application
```

---

## 2. Frontend Architecture: Feature-Based (React + Vite + Tailwind)

**Goal:** Modular, scalable, and easy to maintain.
**Pattern:** Vertical Slices (Feature-Based) rather than technical layers (by generic folders).

### Folder Structure

```
frontend/
├── index.html
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js
├── src/
│   ├── main.jsx          # Application Entry Point
│   ├── App.jsx           # Root Component
│   │
│   ├── app/              # Application-wide configurations & wrappers
│   │   ├── routes/       # App routing (Router setup)
│   │   ├── store/        # Global state store (if needed)
│   │   └── providers/    # Context providers (Theme, Auth, Query)
│   │
│   ├── assets/           # Global assets (images, fonts)
│   │
│   ├── components/       # SHARED generic components (dumb components)
│   │   ├── ui/           # Atomic UI elements (Buttons, Inputs, Cards)
│   │   ├── layout/       # Layout components (Sidebar, Navbar)
│   │   └── logic/        # Shared functional components (ErrorBoundary)
│   │
│   ├── features/         # BUSINESS FEATURES (Vertical Slices)
│   │   ├── auth/         # Example Feature: Authentication
│   │   │   ├── components/  # Components specific to Auth (LoginForm)
│   │   │   ├── hooks/       # Hooks specific to Auth (useLogin)
│   │   │   ├── api/         # API calls for Auth (login, register)
│   │   │   ├── routes/      # Routes for Auth (/login, /register)
│   │   │   └── index.js     # Public API for other modules to import
│   │   │
│   │   ├── dashboard/    # Example Feature: Dashboard
│   │   │   ├── ...
│   │   └── users/        # Example Feature: User Management
│   │
│   ├── hooks/            # Shared custom hooks (useDebounce, useOnClickOutside)
│   ├── lib/              # Third-party library specific configurations
│   │   ├── axios.js      # Axios instance with interceptors
│   │   └── utils.js      # Common utility functions (cn, date formatting)
│   └── services/         # Shared external services (Analytics, Storage)
```

### Key Decisions
*   **Features Directory:** Contains the bulk of the application logic. Each feature is self-contained.
*   **Lib Directory:** Abstracts third-party dependencies. If we switch from Axios to Fetch, we only change `src/lib/axios.js`.
*   **Components Directory:** strictly for *shared* components. Feature-specific components stay in `src/features`.

---

## 3. Backend Architecture: DDD & Clean Architecture (Fastify)

**Goal:** Decouple business logic from frameworks and databases.
**Pattern:** Clean Architecture (Onion Architecture) + Domain-Driven Design (DDD).

### Folder Structure

```
backend/
├── src/
│   ├── index.js             # Entry Point (starts the server)
│   │
│   ├── app.js               # Fastify App Factory (register plugins)
│   │
│   ├── config/              # Environment variables and config loading
│   │   └── env.js
│   │
│   ├── domain/              # LAYER 1: Enterprise Business Logic (The "Core")
│   │   │                    # PURE JS. NO dependencies on frameworks/DB.
│   │   ├── errors/          # Custom Domain Errors
│   │   └── user/            # User Domain Module
│   │       ├── User.js      # User Entity (Class)
│   │       ├── UserRepository.js # Interface Definition (JSDoc/Abstract Class)
│   │       └── UserValueObjects.js
│   │
│   ├── application/         # LAYER 2: Application Business Rules (Use Cases)
│   │   │                    # Orchestrates domain objects.
│   │   └── user/
│   │       ├── CreateUser.js # Use Case: Create User
│   │       ├── GetUser.js    # Use Case: Get User
│   │       └── dtos/         # Data Transfer Objects (Input/Output definitions)
│   │
│   ├── infrastructure/      # LAYER 3: Frameworks & Drivers (The "Details")
│   │   │                    # Implements interfaces from Domain/Application.
│   │   ├── database/
│   │   │   ├── mongoose/    # Concrete DB Implementation
│   │   │   │   ├── models/  # Mongoose Schemas
│   │   │   │   └── repositories/ # Implementation of Domain repositories
│   │   │   └── connection.js
│   │   ├── logger/          # Logger Implementation (Pino)
│   │   └── server/          # HTTP Server config (Fastify plugins)
│   │
│   ├── presentation/        # LAYER 4: Interface Adapters (API)
│   │   │                    # Handles HTTP requests/responses.
│   │   └── http/
│   │       ├── routes/      # Fastify Routes
│   │       ├── controllers/ # Request Handlers (calls Use Cases)
│   │       └── middlewares/ # Auth, Validation
│   │
│   └── shared/              # Shared utilities helpers
│       └── constants.js
```

### Key Decisions
*   **Domain Layer:** The heart of the software. It knows nothing about the database or the web.
*   **Dependency Rule:** Source code dependencies only point inwards. Infrastructure depends on Application/Domain. Domain depends on nothing.
*   **Repositories:** Defined as interfaces in `domain`, implemented in `infrastructure`.

---

## 4. Flow of Request Lifecycle

1.  **Request**: Client sends `POST /api/users` (Presentation Layer).
2.  **Route**: Fastify Route matches URL and calls the **Controller**.
3.  **Controller**:
    *   Validates input (using schemas).
    *   Instantiates the **CreateUser Use Case** (Application Layer).
    *   Calls `createUser.execute(userData)`.
4.  **Use Case**:
    *   Orchestrates the business logic.
    *   Creates a **User Entity** (Domain Layer).
    *   Calls `userRepository.save(user)` (Domain Interface).
5.  **Repository Implementation** (Infrastructure Layer):
    *   Maps Domain Entity to Database Model (Mongoose/SQL).
    *   Persists data to the **Database**.
    *   Returns the saved data.
6.  **Response**:
    *   Use Case returns result to Controller.
    *   Controller formats the HTTP response & sends back JSON.

## 5. Architectural Decisions Review

1.  **Fastify**: Chosen for high performance and low overhead compared to Express.
2.  **Vite**: Chosen for extremely fast build times and modern HMR.
3.  **Tailwind**: Utility-first CSS for rapid UI development and consistency.
4.  **DDD**: Ensures the software model matches the business domain, crucial for "enterprise-ready" scalability.
5.  **Clean Architecture**: Ensures testability and independence of frameworks. You can swap Fastify for Express or MongoDB for Postgres without touching the Domain logic.

---

## Next Steps

See [folder-structure.md](./folder-structure.md) for detailed explanation of each directory and file.
