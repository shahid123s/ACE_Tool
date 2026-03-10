# ACE Platform Backend API Documentation

This document serves as a reference for the Backend API, detailing the REST endpoints, authentication mechanisms, and request/response structures.

## 🔐 Credentials & Authentication

### SuperAdmin Account (Seeded on Startup)
The SuperAdmin is the highest-privilege user and is automatically seeded when the database is empty.
| Field | Value |
| :--- | :--- |
| **Email** | `brototype.studentexcellence@gmail.com` |
| **Password** | `Brototype@SET#123` |
| **Role** | `superadmin` |

> **Note:** The SuperAdmin account is the only account that can create new `admin` users. This flow requires OTP verification sent to the SuperAdmin's email.

### Authentication Mechanism (Dual Token Architecture)
- **Access Token (JWT)**: Short-lived (15 mins), sent in JSON response body. Required for authenticated API access via the `Authorization: Bearer <token>` header.
- **Refresh Token (Opaque)**: Long-lived (7 days), stored in an **HttpOnly Cookie**. Used to obtain new access tokens via the `/api/auth/refresh` endpoint. It features token rotation, reuse detection (revokes families), and secure database storage.

---

## 📡 API Endpoints

### 🟢 System

#### Health Check
- **URL**: `GET /api/users/health`
- **Description**: Checks if the API is running.
- **Auth Required**: No
- **Response**: `{ "status": "ok", "timestamp": "..." }`

---

### 🔓 Authentication (`/api/auth`)

#### Login
- **URL**: `POST /login`
- **Description**: Authenticates a user and issues tokens.
- **Auth Required**: No
- **Body**: `{ "email": "admin@ace.com", "password": "password" }`
- **Response**: `{ "success": true, "data": { "user": { ... }, "accessToken": "eyJh..." } }`
- **Cookies**: Sets `refreshToken` (HttpOnly, Secure, SameSite=Strict)

#### Refresh Token
- **URL**: `POST /refresh`
- **Description**: Rotates the refresh token and issues a new access token.
- **Auth Required**: Valid `refreshToken` Cookie
- **Response**: `{ "success": true, "data": { "accessToken": "eyJh..." } }`

#### Logout
- **URL**: `POST /logout`
- **Description**: Revokes the current refresh token and clears the cookie.
- **Auth Required**: Valid `refreshToken` Cookie
- **Response**: `{ "success": true, "message": "Logged out successfully" }`

#### Get Current User
- **URL**: `GET /me`
- **Description**: Retrieves the authenticated user's profile.
- **Auth Required**: Yes (Bearer Token)
- **Response**: `{ "success": true, "data": { "user": { ... } } }`

#### Forgot Password
- **URL**: `POST /forgot-password`
- **Description**: Sends an OTP to the user's email for password resetting.
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com" }`

#### Reset Password
- **URL**: `POST /reset-password`
- **Description**: Resets the user's password using the OTP.
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com", "otp": "123456", "newPassword": "newSecretPassword" }`

---

### 👤 Users (`/api/users`)

#### Create User
- **URL**: `POST /users`
- **Description**: Creates a new basic user.
- **Auth Required**: No
- **Body**: `{ "name": "...", "email": "..." }`

#### Get User Profile
- **URL**: `GET /users/:id`
- **Description**: Retrieves user details by ID.
- **Auth Required**: Yes

---

### 🛡️ Admin (`/api/admin`)
*All Admin routes require Authentication AND the `admin` role.*

#### Create Student
- **URL**: `POST /students`
- **Description**: Creates a single student, generates a password, and emails them.
- **Body**:  `{ "aceId": "ACE123", "name": "Jane Doe", "email": "jane@example.com", "phone": "1234567890", "batch": "A", "domain": "Web", "tier": "Tier-1" }`
- **Response**: `{ "success": true, "data": { "user": { ... }, "tempPassword": "..." } }`

#### Bulk Create Students
- **URL**: `POST /students/bulk`
- **Description**: Batch creates multiple students.
- **Body**: `{ "students": [ { "aceId": "...", "name": "...", ... } ] }`
- **Response**: `{ "success": true, "data": { "successful": [{ "user": {}, "tempPassword": "" }], "failed": [{ "student": {}, "reason": "" }] } }`

#### Get All Students
- **URL**: `GET /students`

#### Update Student
- **URL**: `PUT /students/:id`
- **Body**: Supports partial updates and adding `status` or `stage`.

#### Enriched Data Queries
- **Worklogs**: 
  - `GET /worklogs` (Query: `userId, date, from, to, status`)
  - `GET /worklogs/:userId`
  - `GET /worklogs/:userId/date/:date`
- **Reports**:
  - `GET /reports` (Query: `type, userId`)
- **Blog Posts**:
  - `GET /blogposts` (Query: `platform, userId`)
  - `POST /blogposts/:id/score` — Body: `{ "score": 85 }`
  - `DELETE /blogposts/:id`

---

### 📝 Worklogs (`/api/worklogs`)
*All Worklog routes require Authentication.*

#### Create Worklog
- **URL**: `POST /`
- **Description**: Saves a draft worklog (limit 1 per day).
- **Body**: `{ "tasks": ["Task 1", "Task 2"], "hoursWorked": 8, "notes": "...", "date": "2024-02-16" }`

#### Update Worklog
- **URL**: `PATCH /:id`
- **Description**: Updates a draft worklog.
- **Body**: `{ "tasks": [], "hoursWorked": 8, "notes": "..." }`

#### Submit Worklog
- **URL**: `POST /:id/submit`
- **Description**: Locks the worklog, making it uneditable.

#### Queries
- **Get Today's Worklog**: `GET /today`
- **Get My Worklogs**: `GET /`

---

### 📊 Reports (`/api/reports`)
*All Report routes require Authentication.*

#### Submit Report
- **URL**: `POST /`
- **Description**: Submits a weekly or monthly report via a Drive link.
- **Body**: `{ "type": "weekly", "period": "2024-W7", "driveLink": "https://docs.google.com/..." }`

#### Queries
- **Get My Reports**: `GET /`
- **Delete Report**: `DELETE /:id` (Only accessible if it allows deletion)

---

### ✍️ Blog Posts (`/api/blogposts`)
*All Blog Post routes require Authentication.*

#### Submit Blog Post
- **URL**: `POST /`
- **Description**: Submits a blog post link for a specific platform.
- **Body**: `{ "title": "My Post", "link": "https://medium.com/...", "platform": "Medium" }`

#### Queries
- **Get My Blog Posts**: `GET /`
- **Delete Blog Post**: `DELETE /:id`

---

### 👑 SuperAdmin (`/api/superadmin`)
*All SuperAdmin routes require Authentication AND the `superadmin` role. A `403 Forbidden` is returned for any other role.*

#### Initiate Admin Creation (Step 1)
- **URL**: `POST /admins/initiate`
- **Description**: Starts the OTP-gated admin creation flow. Stores the new admin's details temporarily in Redis (15-min TTL) and sends a 6-digit OTP to the SuperAdmin's own email.
- **Auth Required**: Yes — `superadmin` role
- **Body**:
  ```json
  { "name": "John Admin", "email": "john@ace.com" }
  ```
- **Response**:
  ```json
  { "success": true, "data": { "message": "OTP sent to your (SuperAdmin) email. Use it to confirm admin creation." } }
  ```

#### Confirm Admin Creation (Step 2)
- **URL**: `POST /admins/confirm`
- **Description**: Verifies the OTP, creates the admin account, cleans up Redis, and emails the new admin their credentials. The OTP is single-use with a 15-minute TTL.
- **Auth Required**: Yes — `superadmin` role
- **Body**:
  ```json
  { "otp": "123456" }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "name": "John Admin", "email": "john@ace.com", "role": "admin", ... },
      "tempPassword": "Admin@xxxxxxxx"
    }
  }
  ```

#### List All Admins
- **URL**: `GET /admins`
- **Description**: Returns all users with the `admin` role.
- **Auth Required**: Yes — `superadmin` role
- **Response**: `{ "success": true, "data": { "admins": [ ... ] } }`

---

#### 🔄 Full Admin Creation Flow

```
1. Login as SuperAdmin → obtain accessToken

2. POST /api/superadmin/admins/initiate
   Authorization: Bearer <superadmin-token>
   Body: { "name": "John Admin", "email": "john@ace.com" }
   ← OTP is emailed to brototype.studentexcellence@gmail.com

3. POST /api/superadmin/admins/confirm
   Authorization: Bearer <superadmin-token>
   Body: { "otp": "123456" }
   ← Admin account created
   ← Credentials emailed to john@ace.com
```
