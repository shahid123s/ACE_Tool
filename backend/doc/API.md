# ACE Platform Backend API Documentation

This document serves as a reference for the Backend API. It includes authentication details, available endpoints, and instructions for maintaing this documentation.

## 🔐 Credentials & Authentication

### Default Admin User
When the system starts with an empty database, the following admin user is seeded:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@ace.com` |
| **Password** | `password` |
| **Role** | `admin` |

### Authentication Header
Most endpoints require a JWT token obtained via `/api/auth/login`.
**Header Format:**
```
Authorization: Bearer <your_token_here>
```

---

## 📡 API Endpoints

### 🟢 System

#### Health Check
- **URL**: `GET /api/users/health`
- **Description**: Checks if the API is running.
- **Auth Required**: No
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-02-16T10:00:00.000Z"
  }
  ```

### 🔓 Authentication

#### Login
- **URL**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "token": "djk2..."
    }
  }
  ```

#### Register (Not Implemented Yet)
- **URL**: `POST /api/auth/register`
- **Status**: 501 Not Implemented

### 👤 Users

#### Create User
- **URL**: `POST /api/users/users`
- **Description**: Creates a new user.
- **Auth Required**: Yes (Admin only - *To be enforced*)
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "..."
    }
  }
  ```

#### Get User Profile
- **URL**: `GET /api/users/users/:id`
- **Description**: Retrieves a user's public profile.
- **Auth Required**: Yes
- **Params**: `id` (User ID or MongoDB _id)
- **Response**:
  ```json
  {
    "success": true,
    "data": { "id": "...", ... }
  }
  ```

---

## 📝 How to Update This Documentation

1.  **New Endpoints**: When adding a new route in `src/presentation/http/routes`, add a corresponding section here.
2.  **Request/Response Changes**: If DTOs change (e.g., `UserDTO`), update the JSON examples.
3.  **Authentication**: If auth mechanisms change (e.g., Refresh Tokens), update the Credentials section.

> **Tip**: Keep the examples consistent with the TypeScript interfaces (`UserDTO`, `LoginRequest`, etc.).
