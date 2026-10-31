# Staging environment plan

**Status:** not set up yet. This is the plan for later.

A staging environment is a second, complete copy of the app (its own backend URL, its own database and its own frontend) where changes are tested before they reach real users. Nothing done in staging touches production data.

## Target setup

| | Production | Staging |
|---|---|---|
| Git branch | `main` | `staging` |
| Backend | `capstone-group5-backend.vercel.app` | Vercel **Preview** URL for the `staging` branch |
| Database | `reading_log` on RDS | `reading_log_staging` (separate database, same RDS instance) |
| Frontend | Netlify production site | Netlify **branch deploy** of `staging` |
| JWT secrets | production values | **different** values |
| Swagger "Try it out" | GET only | all methods (test data) |

## Checklist

- [ ] 1. Create the staging database
- [ ] 2. Create the `staging` branch
- [ ] 3. Configure Vercel Preview environment variables
- [ ] 4. Switch the Swagger read-only check to `VERCEL_ENV`
- [ ] 5. Set up the Netlify branch deploy
- [ ] 6. Use the staging → main workflow

## 1. Create the staging database

One RDS instance can hold several databases, each with completely separate data, so there's no need for (or cost of) a second RDS server.

1. Connect to RDS with `psql`, using the RDS endpoint and master user, to the `postgres` database.
2. Create the database:
   ```sql
   CREATE DATABASE reading_log_staging;
   ```
3. Build the tables by running the migrations against it (set `DATABASE_URL` to the RDS URL ending in `/reading_log_staging`):
   ```bash
   npm run db:migrate
   ```
   The seeds (books, teachers, students, dictionary words) run automatically because the tables start empty.

Optional, for extra safety: create a separate Postgres user that can only access `reading_log_staging`, so a staging mistake can never reach production.

## 2. Create the `staging` branch

```
feature branch  →  staging  →  main
  (work)          (test)       (real users)
```

```bash
git checkout main
git pull
git checkout -b staging
git push -u origin staging
```

## 3. Vercel Preview environment (backend)

Every branch except `main` gets a Preview deployment automatically. Give previews their own settings in **Vercel → Settings → Environment Variables**, where each variable has **Production / Preview / Development** checkboxes:

| Variable | Preview (staging) value |
|---|---|
| `DATABASE_URL` | RDS URL ending in `/reading_log_staging` |
| `ACCESS_TOKEN_SECRET` | new random value (different from production) |
| `REFRESH_TOKEN_SECRET` | new random value (different from production) |
| `GOOGLE_CLIENT_ID` | can be the same as production |

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- Make sure the production `DATABASE_URL` is checked for **Production only**. If it's also checked for Preview, staging writes to real data.
- **Staging URL:** after pushing `staging`, Vercel creates a stable branch URL shaped like `capstone-group5-backend-git-staging-<team>.vercel.app` (Deployments → filter by branch `staging`).
- **Deployment Protection:** the project uses Standard Protection, which puts preview URLs behind a Vercel login. To let the staging frontend and Swagger reach it, turn protection off for previews (Settings → Deployment Protection), or only test while logged in to Vercel.

## 4. Swagger read-only check

Vercel sets `NODE_ENV=production` on Preview deployments too, so `NODE_ENV` can't tell production and staging apart. Vercel's `VERCEL_ENV` can: it's `production`, `preview` or `development`.

In `app.js`, change the `supportedSubmitMethods` condition from `process.env.NODE_ENV === 'production'` to `process.env.VERCEL_ENV === 'production'`:

| Environment | Swagger "Try it out" |
|---|---|
| Production | GET only |
| Staging (preview) | all methods |
| Local | all methods |

## 5. Netlify branch deploy (frontend)

1. **Site configuration → Build & deploy → Branches and deploy contexts:** add `staging` as a branch deploy. Netlify builds it at a URL like `staging--<site>.netlify.app`.
2. **Environment variables:** give `VITE_API_URL` a different value per deploy context:
   - Production: `https://capstone-group5-backend.vercel.app/api`
   - Branch deploys (`staging`): staging backend URL + `/api`
3. **CORS:** if `app.js` limits CORS origins, add the Netlify staging URL to the allowed list.

## 6. Workflow

1. Merge work into `staging` and push. Vercel and Netlify rebuild automatically.
2. Test on the staging frontend, and use the staging Swagger page freely (including deletes).
3. When it works, merge `staging` into `main` and push. Production updates.
4. New migration? Run it on staging first, then on production after merging.

## Common mistakes

| Mistake | Result |
|---|---|
| Production `DATABASE_URL` also checked for Preview | Staging writes to real data |
| Same JWT secrets in both environments | A staging token works in production |
| `VITE_API_URL` not set for the branch context | Staging frontend calls the production backend |
| Deployment Protection left on unknowingly | Staging returns a Vercel login page instead of JSON |
| Using `NODE_ENV` to tell environments apart | Both say `production`; use `VERCEL_ENV` |

## References

- [Vercel: Environments](https://vercel.com/docs/deployments/environments)
- [Vercel: System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables) (`VERCEL_ENV`)
- [Vercel: Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Netlify: Deploy overview and contexts](https://docs.netlify.com/site-deploys/overview/)
- [PostgreSQL: CREATE DATABASE](https://www.postgresql.org/docs/current/sql-createdatabase.html)
