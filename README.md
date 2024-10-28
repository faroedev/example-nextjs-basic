# Faroe and Next.js basic example

A basic Next.js example using Faroe and SQLite.

- Email and password authentication
- Email verification
- Password reset

## Set up

Create `sqlite.db` in the root of the project, and run `schema.sql`.

```
sqlite3 sqlite.db
```

Install and initialize Faroe on port 4000.

```
./faroe serve
```

Install dependencies and start the dev server.

```
pnpm i
pnpm dev
```

## Notes

- The client's IP address is hard-coded as `0.0.0.0`.
