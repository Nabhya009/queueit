# QueueIt

A digital queue management system. Users join a venue's queue remotely and track their live position and estimated wait time instead of standing in line; admins manage the queue from a dashboard (call next, skip, pause).

**Live app:** https://queueit-steel.vercel.app
**Live API:** https://queueit-2iq1.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after a period of inactivity can take up to 50 seconds to respond while it wakes back up.

**Evaluating?** The live app above needs no setup. Running locally needs the `.env` values described below (MongoDB + Google OAuth credentials); they are not committed to this repo.

## Tech stack

- **MongoDB** (Atlas) via Mongoose
- **Express.js** — REST API
- **React** (Vite) + React Router
- **Node.js**
- Auth: **Passport** + `passport-google-oauth20` (Google Sign-In) issuing a stateless **JWT**
- Deployment: **Render** (backend), **Vercel** (frontend), **MongoDB Atlas** (database)

## Project structure

```
queueit/
  server/
    config/       # DB connection, Passport strategy
    controllers/   # request handlers
    middleware/    # JWT auth + admin role checks
    models/        # Mongoose schemas (User, Venue, Queue)
    routes/        # Express routers
    utils/         # one-off seed script
    server.js
  client/
    src/
      pages/       # route-level screens
      components/  # shared/reusable UI + route guards
      services/    # API calls (fetch wrapper)
      hooks/        # auth context/hook
```

## Running it locally

**Prerequisites:** Node.js **20.19 or newer** (required by Vite 8 and Mongoose 9), a MongoDB connection (local `mongod`, or a free MongoDB Atlas cluster), and a Google OAuth Client ID/Secret (console.cloud.google.com — see "Google OAuth setup" below).

### 1. Backend

```
cd server
npm install
cp .env.example .env   # Windows cmd: copy .env.example .env — then fill in the values, see below
npm run seed            # REQUIRED on a new database: creates the sample venue and queue
npm run dev
```

> **Run the seed.** The app has no screen for creating venues or queues, so on an empty database the home page just shows "No venues yet". `npm run seed` creates *Main Cafeteria → Veg Counter* and is safe to run more than once.

Check it's up: `http://localhost:5000/api/health` should return `{"ok":true}`.

`server/.env` needs:

| Variable | Description |
|---|---|
| `PORT` | e.g. `5000` |
| `MONGO_URI` | MongoDB connection string. Atlas: copy it from *Connect → Drivers* and allow your IP under *Network Access*. Local: use `mongodb://127.0.0.1:27017/queueit` (`127.0.0.1`, not `localhost`, which can fail on newer Node versions) |
| `JWT_SECRET` | any random string, used to sign auth tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from a Google Cloud OAuth Web application client |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/api/auth/google/callback` locally |
| `CLIENT_URL` | `http://localhost:5173` locally |

### 2. Frontend

```
cd client
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm run dev
```

Open `http://localhost:5173`.

> **Ports must line up.** The backend only accepts requests from `CLIENT_URL` and Google sends users back to `GOOGLE_CALLBACK_URL`, so if Vite starts on a different port (e.g. 5174 because 5173 is busy) or you change `PORT`, update `CLIENT_URL`, `GOOGLE_CALLBACK_URL`, the redirect URI in Google Cloud Console, and `VITE_API_URL` to match. Restart `npm run dev` after editing any `.env` file.

### Google OAuth setup (for local testing)

1. console.cloud.google.com → create a project → **APIs & Services → OAuth consent screen**: External, add scopes `.../auth/userinfo.email` and `.../auth/userinfo.profile`, and add your own Google account under **Test users** (the app isn't published, so only whitelisted accounts can sign in).
2. **Credentials → Create Credentials → OAuth client ID**, type Web application. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`.
3. Copy the Client ID/Secret into `server/.env`.

## Using the app

**As a user:**
1. Sign in with Google.
2. Pick a venue/queue from the home page and click Join Queue.
3. See your live token number, position in line, and estimated wait time (auto-refreshes every 5s).
4. Leave the queue at any point.

**As an admin:** a user's `role` field must be manually set to `"admin"` in the database (there's no self-serve promotion flow — this is a deliberate scope decision, not an oversight). To make yourself an admin:

1. Sign in with Google once, so your user document exists.
2. In MongoDB Compass or Atlas *Browse Collections*, open the `users` collection, find your document by email, and change `role` from `"user"` to `"admin"`.
3. **Sign out and sign back in.** The role is stored in your login token, so the old token still says `"user"`.

Then:
1. An "Admin" link appears in the navbar.
2. Pick a queue to see the live waiting list (name, email, token, join time).
3. **Serve Next** / **Skip Next** advances the queue; **Pause/Resume** marks the queue as paused. Pausing is a status flag only — it does not block joins or serving.

## API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/venues` | none | list venues + queue summaries |
| GET | `/api/venues/:id` | none | one venue's detail |
| POST | `/api/queues/:id/join` | user | join a queue, returns token/position/ETA |
| GET | `/api/queues/:id/status` | user | live status, including caller's own ticket if any |
| DELETE | `/api/queues/:id/leave` | user | leave a queue while waiting |
| GET | `/api/admin/queues/:id` | admin | full queue detail + waiting list |
| PATCH | `/api/admin/queues/:id/serve` | admin | serve the next waiting ticket |
| PATCH | `/api/admin/queues/:id/skip` | admin | skip the next waiting ticket |
| PATCH | `/api/admin/queues/:id/pause` | admin | toggle `isPaused` |
| GET | `/api/auth/google` | none | starts Google OAuth flow |
| GET | `/api/auth/google/callback` | none | OAuth callback, issues a JWT |
| GET | `/api/auth/me` | user | current user's profile |

## Key architecture decisions

- **Embedded subdocuments over a separate tickets collection** — `Queue.queue[]` holds each waiting ticket directly on the queue document, and `User.history[]` holds a user's past tickets. Matches the assignment's data model; the tradeoff (losing a DB-level unique index preventing duplicate waiting tickets) is handled in the join logic instead (see next point).
- **Token generation** — join reads `Queue.lastToken`, then in a single update sets it to `lastToken + 1` and pushes the ticket, but only if `lastToken` hasn't changed since the read. If another join got in first, the update matches nothing and the request re-reads and retries. This gives every join a unique token and stops a double-click from creating two waiting tickets.
- **Serve / Skip** — the update filter uses `$elemMatch` on the ticket's `tokenNumber` and `status: "waiting"`, so two admins clicking at once can't both act on the same ticket; the second gets a 409.
- **Queue position** — never stored, always computed at read time from ticket order. This means a user leaving from the middle of the queue needs no renumbering of anyone else.
- **Live updates via polling**, not WebSocket — re-fetches status every 5 seconds. Chosen for simplicity (no new dependencies, no persistent connection to manage) over the added complexity and deployment constraints of a WebSocket-based approach, given a few seconds of staleness is acceptable for this use case.

## AI assistance

Claude was used during development to assist with documentation, code comments, and some implementation/debugging tasks.
