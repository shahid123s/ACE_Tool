# RTK Query Architecture & Login Flow

This guide explains how Redux Toolkit (RTK) and RTK Query are structured in this project and how the authentication flow works.

## 1. Directory Structure

The Redux logic is centralized in the `src/app` directory:

```text
src/app/
├── apiService.ts    # RTK Query API definition (Endpoints, Base Query)
├── authSlice.ts     # Redux Toolkit Slice (Authentication State)
├── hooks.ts         # Typed Hooks (useAppDispatch, useAppSelector)
└── store.ts         # Redux Store Configuration
```

## 2. RTK Query Flow (The "How It Works")

RTK Query is used for **server state** (data from APIs). It handles loading states, caching, and re-fetching automatically.

### Login flow step-by-step:

1.  **Component Level (`Login.tsx`):**
    - The user enters credentials and clicks login.
    - We call `login({ email, password }).unwrap()`.

2.  **API Service (`apiService.ts`):**
    - The `login` mutation is triggered.
    - It sends a `POST /auth/login` request to the backend.
    - The `baseQuery` automatically handles the base URL and formatting.

3.  **Authentication Slice (`authSlice.ts`):**
    - Once the login succeeds, we receive `{ user, token }`.
    - We `dispatch(setCredentials({ user, token }))`.
    - The `authSlice` reducer takes this data and does two things:
        1.  Updates the **Redux Store** (memory).
        2.  Saves the `user` and `token` to **localStorage** (persistence).

4.  **Root Component Logic (`App.tsx`):**
    - The `ProtectedRoute` uses `useAppSelector(selectIsAuthenticated)`.
    - As soon as the store updates, `isAuthenticated` becomes `true`.
    - The application allows the user to see protected pages (Dashboard/Admin).

## 3. Persistent State

When the page reloads:
- `authSlice.ts` initializes its state by reading from `localStorage`.
- We added a safety check: `(storedUser && storedUser !== 'undefined') ? JSON.parse(storedUser) : null`.
- This prevents the "undefined is not valid JSON" error if `localStorage` was corrupted with a plain "undefined" string.

## 4. Refresh Token Flow (Silent Auth)

We implemented a robust refresh token mechanism using `async-mutex` to handle token expiration seamlessly.

### How it works:
1.  **Initial Login:**
    - The backend returns `{ user, accessToken }`.
    - It sets a secure `httpOnly` cookie containing the `refreshToken`.
    - We store `accessToken` in Redux and `localStorage`.

2.  **API Requests (`baseQueryWithReauth`):**
    - Every API call goes through our custom `baseQueryWithReauth` wrapper.
    - If a request fails with **401 Unauthorized**:
        1.  We **lock** the mutex to prevent multiple parallel refresh calls.
        2.  We call `POST /auth/refresh`. The browser automatically sends the `refreshToken` cookie.
        3.  **If successful:**
            - We get a new `accessToken`.
            - We dispatch `tokenReceived({ accessToken })` to update the store.
            - We **retry** the original failed request with the new token.
        4.  **If failed:**
            - The session is truly expired.
            - We dispatch `logout()` and redirect to `/login`.
        5.  We release the mutex.

### Why Mutex?
If a page loads and fires 5 API calls simultaneously, and the token is expired, all 5 would fail. Without a mutex, we would trigger 5 refresh calls. The first one would succeed, invalidating the old refresh token, causing the other 4 to fail. The mutex ensures we only refresh **once**, and the other 4 calls wait and then use the *new* token.

## 5. Why casing matters

The filesystem use of casing must match the import casing. If the import is `@/components/ui/Button` but the file is `button.tsx`, the build will fail on case-sensitive systems. We have standardized on the naming preferred by the user.
