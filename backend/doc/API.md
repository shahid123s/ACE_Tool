# ACE Platform Backend API Documentation

This document serves as a reference for the Backend API, implementing advanced authentication with Access and Refresh Tokens.

## 🔐 Credentials & Authentication

### Default Admin User
When the system starts with an empty database, the following admin user is seeded:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@ace.com` |
| **Password** | `password` |
| **Role** | `admin` |

### Authentication Mechanism
The system uses a **Dual Token Architecture**:
1.  **Access Token (JWT)**: Short-lived (15 mins), sent in JSON response body. Used for API access via `Authorization: Bearer <token>` header.
2.  **Refresh Token (Opaque)**: Long-lived (7 days), stored in **HttpOnly Cookie**. Used to obtain new access tokens.

### Security Rationale
-   **HttpOnly Cookies**: Protect refresh tokens from XSS attacks (unable to be read by client JS).
-   **Strict SameSite**: Prevents CSRF attacks on the refresh endpoint.
-   **Token Rotation**: Every refresh request issues a NEW refresh token and revokes the old one.
-   **Reuse Detection**: Attempting to use a revoked refresh token triggers a security alert and **revokes the entire token family**, forcing re-login. This detects and mitigates stolen token scenarios.
-   **Hashing**: Refresh tokens are hashed in the database, preventing immediate session hijack if the DB is leaked.

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
- **Description**: Authenticates a user and issues Access (Body) and Refresh (Cookie) tokens.
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "admin@ace.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "accessToken": "eyJh..."
    }
  }
  ```
- **Cookies Set**: `refreshToken` (HttpOnly, Secure, SameSite=Strict)

#### Refresh Token
- **URL**: `POST /api/auth/refresh`
- **Description**: Rotates the refresh token and issues a new access token.
- **Auth Required**: No (Requires Valid Refresh Cookie)
- **Body**: None
- **Cookies Required**: `refreshToken`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJh..."
    }
  }
  ```
- **Cookies Set**: New `refreshToken` (Rotated)

#### Logout
- **URL**: `POST /api/auth/logout`
- **Description**: Revokes the current refresh token and clears the cookie.
- **Auth Required**: No (Requires Valid Refresh Cookie)
- **Cookies Required**: `refreshToken`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Cookies Set**: Clears `refreshToken`

### 👤 Users

#### Create User
- **URL**: `POST /api/users/users`
- **Description**: Creates a new user.
- **Auth Required**: Yes (Bearer Token)
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "..."
    }
  }
  ```

#### Get User Profile
- **URL**: `GET /api/users/users/:id`
- **Description**: Retrieves a user's public profile.
- **Auth Required**: Yes (Bearer Token)
- **Params**: `id`
- **Response**:
  ```json
  {
    "success": true,
    "data": { "id": "...", ... }
  }
  ```
