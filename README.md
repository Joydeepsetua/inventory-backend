# Billing & Inventory — Backend

REST API for a retail counter: product catalogue, stock, cart and GST-style invoicing.

Built with **Express + TypeScript + Sequelize + MySQL**, run directly through `tsx`
(no build step).

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

```bash
# 1. install
npm install

# 2. environment
cp .env.example .env
```

Fill in `.env` — `JWT_SECRET` is blank in the example and the app will not issue
tokens without it:

```ini
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=billing_inventory
DB_USER=root
DB_PASSWORD=

JWT_SECRET=<any long random string>
ACCESS_EXPIRES_IN=1d
REFRESH_EXPIRES_IN=7d
```

Create the database (the app connects to it, it does not create it):

```bash
mysql -u root -p -e "CREATE DATABASE billing_inventory;"
```

Then run migrations and the seeder:

```bash
npm run db:migrate     # creates all tables
npm run db:seed:all    # creates the owner account
```

Start it:

```bash
npm run dev            # watch mode
# npm start            # plain run
```

```
✅ MySQL database connected successfully
🚀 Server is running at http://localhost:3000
```

## Seeded login

```
email     admin@example.com
password  Admin@123
role      OWNER
```

Change this before deploying anywhere real. There is no user-management endpoint yet,
so extra users have to be inserted directly.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | start with file watching |
| `npm start` | start once |
| `npm run db:migrate` | apply pending migrations |
| `npm run db:migrate:status` | show which migrations have run |
| `npm run db:migrate:undo` | roll back the last migration |
| `npm run db:seed:all` | run all seeders |
| `npm run db:seed:undo` | undo all seeders |

Sequelize CLI paths come from `.sequelizerc` (migrations and seeders live under
`src/database/`).

## API

Base URL `http://localhost:3000/api`. Everything except `POST /auth/login` needs
`Authorization: Bearer <access_token>`, and only the `OWNER` and `SALESMAN` roles are
admitted.

| Prefix | Resource |
| --- | --- |
| `/auth` | login |
| `/customers` | customers |
| `/product-categories` | categories |
| `/products` | products |
| `/product-variants` | variants (SKU, price, stock) |
| `/cart` | the current user's open cart |
| `/invoices` | billing |

Full request/response reference with curl examples: **[API.md](./API.md)**.



## Layout

```
index.ts                  entry point
src/
  routes/       index.ts mounts every router under /api
  controllers/  validate input, map errors to status codes
  services/     business logic and transactions
  validator/    Joi schemas
  models/       Sequelize models
  interfaces/   shared types
  middlewares/  authenticate
  utils/        response envelope, jwt, errors
  database/     connection, migrations, seeders
```
