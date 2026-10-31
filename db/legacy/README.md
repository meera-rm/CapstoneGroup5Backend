# Legacy schema (not used)

`schema.sql`, `seed.sql`, `prod_schema.sql` and `prod_seed.sql` are the original 2022 schema and seed data (local and production versions). They are kept for reference only.

They are **out of date**: no Google sign-in columns, the old `email_subscriptions` table instead of `subscriptions`, and the schema files drop every table.

To create or update a database, use the migrations instead:

```bash
npm run db:migrate
```
