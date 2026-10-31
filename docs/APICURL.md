# ScholarSheep API: Auth & Users (curl reference)

Base URL (local): `http://localhost:3010`

All request bodies are JSON. Protected routes need a JWT in the `Authorization` header.

| Header | Value | When |
|---|---|---|
| `Content-Type` | `application/json` | Every request that sends a body (POST, PUT) |
| `Authorization` | `Bearer <accessToken>` | Every protected route |

## Setup

```bash
# Base URL (switch to your Vercel URL for production)
BASE=http://localhost:3010
```

Roles: `student` (default on sign-up), `teacher`, `parent`, `admin`.
Access tokens last 1 day. Refresh tokens last 7 days.

---

## Health

### GET /api/health (public)

```bash
curl -i "$BASE/api/health"
```

---

## Auth: `/api/auth`

### POST /api/auth/register (public)

Creates an email/password account. New users are always `student`, and any `user_role` in the body is ignored.

| Field | Type | Required | Rules |
|---|---|---|---|
| `user_name` | string | yes | |
| `user_email` | string | yes | must be unique (case-insensitive) |
| `user_password` | string | yes | at least 8 characters |
| `user_avatar` | string | no | image URL |

```bash
curl -i -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Test Student","user_email":"student1@test.com","user_password":"password123"}'
```

**201 Created**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "user_id": 1,
    "user_name": "Test Student",
    "user_role": "student",
    "user_avatar": "",
    "user_email": "student1@test.com"
  }
}
```

| Status | When |
|---|---|
| 400 | Missing field, or password shorter than 8 characters |
| 409 | Email already registered |
| 500 | Server or database error |

### POST /api/auth/login (public)

```bash
curl -i -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_email":"student1@test.com","user_password":"password123"}'
```

Log in and save the token into `$TOKEN` for the protected routes below:

```bash
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_email":"student1@test.com","user_password":"password123"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).accessToken")
echo $TOKEN
```

**200 OK**: same shape as register.

| Status | When |
|---|---|
| 400 | Missing email or password |
| 401 | Wrong email or password (same message for both), or the account only uses Google sign-in |

### POST /api/auth/google (public)

Signs in with the ID token from the React `<GoogleLogin />` button. It can't be tested with a made-up token; use the frontend.

| Field | Type | Required |
|---|---|---|
| `credential` | string (Google ID token) | yes |

```bash
curl -i -X POST "$BASE/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"credential":"<google-id-token-from-frontend>"}'
```

**200 OK**: same shape as register. The route either finds the user by Google ID, links Google to an existing email account, or creates a new `student`.

| Status | When |
|---|---|
| 400 | Missing `credential` |
| 401 | Invalid, expired or wrong-app Google token, or unverified Google email |

### GET /api/auth/me (logged in)

Returns the current user, read fresh from the database.

```bash
curl -i "$BASE/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{ "user": { "user_id": 1, "user_name": "Test Student", "user_role": "student", "user_avatar": "", "user_email": "student1@test.com" } }
```

Save your own id for the users routes:

```bash
MY_ID=$(curl -s "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN" \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).user.user_id")
echo $MY_ID
```

| Status | When |
|---|---|
| 401 | No token, invalid token, or expired token |
| 404 | User no longer exists |

---

## Users: `/api/users`

Every route here requires `Authorization: Bearer <token>`.

| Route | Who can use it |
|---|---|
| `GET /api/users` | teacher, admin |
| `GET /api/users/:id` | the user themselves, teacher, admin |
| `PUT /api/users/:id` | the user themselves, admin (only admin can change `user_role`) |
| `DELETE /api/users/:id` | admin (not on their own account) |

### GET /api/users (teacher, admin)

All users:

```bash
curl -i "$BASE/api/users" \
  -H "Authorization: Bearer $TOKEN"
```

Paginated (`limit` defaults to 20, max 50):

```bash
curl -i "$BASE/api/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**200 OK** (paginated)

```json
{
  "users": [ { "user_id": 1, "user_name": "Test Student", "user_role": "student", "user_avatar": "", "user_email": "student1@test.com" } ],
  "pagination": { "page": 1, "limit": 5, "total": 12, "totalPages": 3, "hasNext": true, "hasPrev": false }
}
```

| Status | When |
|---|---|
| 401 | Not logged in |
| 403 | Logged in as student or parent |

### GET /api/users/:id (self, teacher, admin)

```bash
curl -i "$BASE/api/users/$MY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

| Status | When |
|---|---|
| 200 | Returns `{ "user": {...} }` |
| 400 | `:id` is not a positive whole number |
| 403 | A student or parent asking for someone else's account |
| 404 | No user with that id |

### PUT /api/users/:id (self, admin)

Only these fields are read; anything else in the body (like `user_password`) is ignored. Leave out a field to keep its current value.

| Field | Who can change it |
|---|---|
| `user_name` | self, admin |
| `user_avatar` | self, admin |
| `user_email` | self, admin (must not belong to another user) |
| `user_role` | admin only; one of `student`, `teacher`, `parent`, `admin` |

Edit your own name:

```bash
curl -i -X PUT "$BASE/api/users/$MY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Renamed Student"}'
```

Admin changes another user's role:

```bash
curl -i -X PUT "$BASE/api/users/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_role":"teacher"}'
```

| Status | When |
|---|---|
| 200 | Returns the updated `{ "user": {...} }` |
| 400 | Bad id, unknown role, or an admin removing their own admin role |
| 403 | Editing someone else's account (non-admin), or a non-admin sending `user_role` |
| 404 | No user with that id |
| 409 | Email already used by another account |

A role change shows up in `GET /api/auth/me` right away, but the user's existing token keeps the old role until they log in again.

### DELETE /api/users/:id (admin)

```bash
curl -i -X DELETE "$BASE/api/users/2" \
  -H "Authorization: Bearer $TOKEN"
```

| Status | When |
|---|---|
| 200 | Returns the deleted `{ "user": {...} }` |
| 400 | Bad id, or deleting your own account |
| 403 | Not an admin |
| 404 | No user with that id |

---

## Error response shapes

Auth routes and the auth middleware:

```json
{ "error": "Not logged in" }
```

Users routes:

```json
{ "status": "error", "message": "User not found" }
```

| Status | Meaning |
|---|---|
| 400 | Bad input |
| 401 | Not logged in: missing, invalid or expired token, or wrong login |
| 403 | Logged in, but your role isn't allowed to do this |
| 404 | Not found |
| 409 | Conflict: email already in use |
| 500 | Server or database error (details only in the server log) |

---

## Testing as an admin

New accounts are students. To test admin routes locally, promote a test user (run from the backend folder):

```bash
node -e "
const db=require('./db/dbConfig');
db.none(\"UPDATE users SET user_role='admin' WHERE LOWER(user_email)='student1@test.com'\")
  .then(()=>{console.log('promoted'); process.exit(0)}).catch(e=>{console.error(e.message); process.exit(1)});"
```

Then log in again to get a token that carries the `admin` role.
