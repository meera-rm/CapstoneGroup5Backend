# ScholarSheep API

Backend for **ScholarSheep**, a reading-log app where students track the books they read, teachers follow their students' progress, and everyone builds a personal dictionary of new words.

Built with **Node.js, Express and PostgreSQL**. Users sign in with **email/password or Google**, receive a **JWT**, and **role-based access control (RBAC)** decides what each role can do.

- **Frontend:** React app deployed on Netlify
- **API:** deployed on Vercel 
- **Database:** PostgreSQL on AWS RDS 
---

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 |
| Web framework | Express |
| Database | PostgreSQL (AWS RDS in production) |
| DB client | pg-promise |
| Password hashing | bcryptjs |
| Tokens | jsonwebtoken (access + refresh tokens) |
| Google sign-in | google-auth-library (verifies Google ID tokens) |
| Hosting | Vercel (API), Netlify (frontend) |

---

## How authentication works

Both login methods end the same way: the server issues the same JWT, so permissions work the same no matter how someone signed in.

```
Email + password ──┐  bcrypt checks the password
                   ├──▶ server issues JWT { id, username, email, role, avatar }
Google sign-in ────┘  google-auth-library verifies Google's ID token
                        ↓
     every protected request: authenticate → authorize(role) → route
```

- **`authenticate`** (`middleware/auth.js`) reads `Authorization: Bearer <token>` and verifies it. Failures return **401**.
- **`authorize(...roles)`** checks the role inside the token. A role that isn't allowed gets **403**.
- New accounts always start as **`student`**. Only an admin can change a role.
- Passwords are stored only as bcrypt hashes and are never returned by the API.
- No Passport: with two sign-in methods and token-based auth, it would add a dependency without removing any code.

### Roles

| Role | Can do |
|---|---|
| `student` | Use their own account |
| `parent` | Use their own account |
| `teacher` | Everything a student can, plus view all users |
| `admin` | Everything, including changing roles and deleting users |

---

## Getting started

### 1. Prerequisites
- Node.js 22
- PostgreSQL (local) or access to the RDS database
- A Google OAuth Client ID ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)) for Google sign-in

### 2. Install

```bash
git clone git@github.com:meera-rm/CapstoneGroup5Backend.git
cd CapstoneGroup5Backend
npm install
```

### 3. Environment variables

Create a `.env` file in the project root. It's already in `.gitignore`, so it won't be committed.

```bash
PORT=3010

# Production / RDS: if this is set, it is used instead of the PG_* values
DATABASE_URL=postgres://USER:PASSWORD@your-db.xxxxx.us-east-1.rds.amazonaws.com:5432/DBNAME

# Local Postgres (used when DATABASE_URL is not set)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=
PG_USER=postgres
PG_PASSWORD=

# JWT secrets: long random strings, different from each other
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# Same Client ID the frontend uses for the Google button
GOOGLE_CLIENT_ID=
```

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default 3010) | Local server port |
| `DATABASE_URL` | production | RDS connection string; SSL is turned on automatically |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` | local | Local Postgres connection |
| `ACCESS_TOKEN_SECRET` | yes | Signs access tokens (valid 1 day) |
| `REFRESH_TOKEN_SECRET` | yes | Signs refresh tokens (valid 7 days) |
| `GOOGLE_CLIENT_ID` | for Google sign-in | Checks that Google tokens were issued for this app |

Add the same variables in **Vercel → Project → Settings → Environment Variables** for production.

Don't add `?sslmode=require` to `DATABASE_URL`. SSL is configured in `db/dbConfig.js`, and `sslmode` in the URL overrides it.

### 4. Set up the database

**Migrations** create or update the tables. They're safe to run more than once:

```bash
node migrations/migrations.js
```

The runner executes, in order: `initial_schema.sql`, `legacy_tables.sql`, `logs_pagination_index.sql`, `google_login.sql`.

**Local only (optional):** reset and seed a local database:

```bash
npm run db:init   # runs db/schema.sql (drops and recreates tables)
npm run db:seed   # runs db/seed.sql
```

`db:init` drops tables. Never point it at production.

### 5. Run

```bash
npm start          # node server.js → Listening on port 3010
```

Check it's up:

```bash
curl http://localhost:3010/api/health
```

---

## API overview

Base URL (local): `http://localhost:3010`

Full request and response examples with curl: **[docs/APICURL.md](docs/APICURL.md)**

### Auth: `/api/auth`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Sign up with email and password (always `student`) |
| POST | `/api/auth/login` | public | Log in with email and password |
| POST | `/api/auth/google` | public | Sign in with a Google ID token from the frontend |
| GET | `/api/auth/me` | logged in | The current user, read fresh from the database |

Successful register, login and Google sign-in all return:

```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "user": { "user_id": 1, "user_name": "...", "user_role": "student", "user_avatar": "", "user_email": "..." } }
```

### Users: `/api/users` (all require a token)

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/users` | teacher, admin | All users; add `?page=1&limit=20` to paginate (max 50) |
| GET | `/api/users/:id` | self, teacher, admin | One user |
| PUT | `/api/users/:id` | self, admin | Edit name, avatar or email; only admins can change `user_role` |
| DELETE | `/api/users/:id` | admin | Delete a user (not your own account) |

### Other resources

| Base route | Controller | Main routes |
|---|---|---|
| `/api/health` | `healthController.js` | `GET /` |
| `/api/books` | `bookController.js` | `GET /`, `GET /:bookId`, `POST /new`, `PUT /:bookId`, `DELETE /:bookId`, nested `/:bookId/logs` |
| `/api/logs` | `logController.js` | `GET /`, `GET /:logId`, `POST /new`, `PUT /:logId`, `DELETE /:logId`, nested `/:logId/comments` |
| `/api/comments` | `commentController.js` | `GET /`, `GET /:commentId`, `GET /logs/:logId`, `POST /new`, `PUT /:commentId`, `DELETE /:commentId` |
| `/api/students` | `studentController.js` | `GET /`, `GET /:studentId`, `POST /new`, `PUT /:studentId`, `DELETE /:studentId`, nested `/:studentId/logs` |
| `/api/teachers` | `teachersController.js` | `GET /`, `GET /:id`, `POST /new`, `PUT /:teacherId`, `DELETE /:id`, nested `/:teacherId/students` |
| `/api/dictionary` | `dictionaryController.js` | `GET /`, `GET /:word`, `POST /`, `PUT /:dictionaryId`, `DELETE /:id` |
| `/api/notes` | `noteController.js` | `GET /`, `GET /:noteId`, `POST /new`, `PUT /:noteId`, `DELETE /:noteId` |
| `/api/subscriptions` | `subscriptionController.js` | `POST /`, `GET /`, `GET /subscribe/:email`, `PUT /update/:updatedEmail`, `DELETE /unsubscribe/:email` |

These routes come from the original version of the app and **don't require a login yet**. To protect one, add the middleware, for example:

```js
const { authenticate, authorize } = require('../middleware/auth');
books.post('/new', authenticate, authorize('teacher', 'admin'), checkPicture, handler);
```

### Status codes

| Code | Meaning |
|---|---|
| 400 | Bad input |
| 401 | Not logged in: missing, invalid or expired token, or wrong email/password |
| 403 | Logged in, but your role isn't allowed |
| 404 | Not found |
| 409 | Conflict, e.g. the email is already in use |
| 500 | Server or database error (details only in the server log) |

---

## Project structure

```
├── server.js              # Starts the server (loads .env first)
├── app.js                 # Express app: middleware + route mounting
├── routes/
│   └── auth.js            # register, login, google, me
├── controllers/           # One Express router per resource (users, books, logs, ...)
├── queries/               # All SQL lives here; controllers call these functions
│   └── users.js           # Never selects password hashes except for login
├── middleware/
│   └── auth.js            # authenticate + authorize(...roles)
├── utils/
│   ├── jwt-helpers.js     # Create and verify access/refresh tokens
│   ├── pagination.js      # ?page & ?limit → offset + metadata
│   └── roles.js           # The list of roles
├── validations/           # Request validators (e.g. checkBooks.js)
├── migrations/            # SQL migrations + migrations.js runner
└── db/
    ├── dbConfig.js        # pg-promise connection (SSL for RDS)
    ├── schema.sql         # Local schema (npm run db:init)
    └── seed.sql           # Local seed data (npm run db:seed)
```

**Conventions**
- **No SQL in routes or controllers.** They call functions from `queries/`.
- **Query functions throw on errors**, and routes catch them and respond with a status code.
- **User queries only return safe columns** (`user_id, user_name, user_role, user_avatar, user_email`). The password hash is read in exactly one place: the login lookup.

---

## Testing locally with curl

```bash
BASE=http://localhost:3010

# Register
curl -i -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Test Student","user_email":"student1@test.com","user_password":"password123"}'

# Log in and save the token
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_email":"student1@test.com","user_password":"password123"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).accessToken")

# Who am I?
curl -i "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN"
```

Every route, with its headers, body, example response and status codes: **[docs/APICURL.md](docs/APICURL.md)**

To test admin-only routes, promote a test user, then log in again to get a token with the new role:

```sql
UPDATE users SET user_role = 'admin' WHERE LOWER(user_email) = 'student1@test.com';
```

---

## Deployment

- **API on Vercel:** set the environment variables above in the Vercel project. `db/dbConfig.js` keeps the connection pool small (`max: 5`), since each Vercel instance opens its own connections.
- **Database on AWS RDS:** RDS for PostgreSQL requires SSL by default, and `dbConfig.js` turns it on whenever `DATABASE_URL` is set.
- **Google sign-in:** in Google Cloud Console, add your local and Netlify frontend URLs as **Authorized JavaScript origins** for the OAuth client.

---

## Roadmap

- [ ] `POST /api/auth/refresh` to swap a refresh token for a new access token
- [ ] Protect the original resource routes (books, logs, students, ...) with `authenticate` / `authorize`
- [ ] Automated tests for the auth and users routes
