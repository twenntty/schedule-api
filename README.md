# SchedGO — API

Backend service for **SchedGO**, a scheduling platform for educational
institutions. Built with **Node.js + Express + MongoDB (Mongoose)**. It powers
the public timetable and the role-based management dashboard used by the
[web client](../schedule-site).

---

## Features

- **JWT authentication** stored in an **httpOnly cookie** (XSS-safe), with
  role-based access control (`admin`, `institution`, `user`).
- Management of specialties, courses, groups, teachers, rooms, periods and the
  weekly schedule.
- Public timetable read endpoints and `.ics` / `.xlsx` week export.
- Public "join us" request intake for institutions.

---

## Tech Stack

- [Node.js](https://nodejs.org/) 18+ · [Express 4](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [cookie-parser](https://github.com/expressjs/cookie-parser)
- [exceljs](https://github.com/exceljs/exceljs), [ical-generator](https://github.com/sebbo2002/ical-generator), [moment](https://momentjs.com/)

---

## Prerequisites

- **Node.js** 18 or newer and **npm** 9+
- A **MongoDB** database (local or MongoDB Atlas)

---

## Getting Started

```bash
# 1. Clone and enter the project
git clone <your-repository-url>
cd schedule-api

# 2. Install dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env
#    then fill in MONGO_URI and JWT_SECRET

# 4. Run
npm run dev     # development, auto-reload (nodemon)
# or
npm start       # production
```

The API listens on **http://localhost:3001** by default.

---

## Environment Variables

See [`.env.example`](./.env.example).

| Variable       | Description                                        | Example                                   |
| -------------- | -------------------------------------------------- | ----------------------------------------- |
| `MONGO_URI`    | MongoDB connection string                          | `mongodb+srv://user:pass@cluster/scheduleDB` |
| `PORT`         | Port the server listens on                         | `3001`                                    |
| `JWT_SECRET`   | Secret used to sign JWTs — use a long random value | `openssl rand -hex 32`                    |
| `FRONTEND_URL` | Allowed CORS origin (the web client)               | `http://localhost:3000`                   |
| `NODE_ENV`     | `development` or `production`                       | `development`                             |

> The `token` cookie is `httpOnly` and, when `NODE_ENV=production`, `Secure`.
> Never commit `.env` — it is git-ignored.

---

## Available Scripts

| Command       | Description                                  |
| ------------- | -------------------------------------------- |
| `npm start`   | Start the server (`node server.js`).         |
| `npm run dev` | Start with auto-reload via nodemon.          |
| `npm test`    | Run the Jest test suite.                     |

---

## Authentication

- `POST /auth/register` · `POST /auth/login` — set the auth cookie.
- `POST /auth/logout` — clear it.
- `GET /auth/me` — current user from the cookie.

Write endpoints require a valid cookie **and** an appropriate role; the public
timetable and request-intake endpoints are open.

---

## Project Structure

```
config/       Database connection
middleware/   Auth + role guard
models/       Mongoose schemas
routes/       Express routers
server.js     App entry point
```

---

## License

Licensed under the **[PolyForm Noncommercial License 1.0.0](./LICENSE)** — free to
use, run, modify and self-host for any **noncommercial** purpose; selling it or
using it for the commercial promotion of services is not permitted.
