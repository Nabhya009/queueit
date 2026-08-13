
# ✅ PROJECT: **QueueIt – Virtual Queue Management System**

---

## 🎯 PURPOSE

To eliminate long physical waiting lines at common service areas (cafeterias, gyms, labs, etc.) by allowing users to join and track queues remotely through a web interface.

---

## 👤 USER TYPES

1. **Guest/User**: Can join queues, track status, receive alerts.
2. **Admin (Venue Manager)**: Manages queues in real time (start/stop, serve, etc.).
3. **Super Admin**: Manages all venues, categories, and staff accounts.

---

## 🧭 HIGH-LEVEL FLOW

### 🧍 User Side

1. **Open App**

   * Homepage: Select a **location** (e.g., Gym, Cafeteria)
   * See active service **counters** or **queues**

2. **Join a Queue**

   * Click “Join Queue”
   * See: estimated wait time, your token number, current queue length
   * App displays:

     * Token Number
     * Position in Queue
     * ETA

3. **While Waiting**

   * Live updates as the queue moves
   * Alerts when your turn is near (e.g., top 3)
   * Option to **leave the queue**

4. **Once Turn Comes**

   * Admin can mark the token as served/skipped
   * QR scan or button tap for validation
   * System logs your session in history

5. **After Session**

   * Option to rate the service (optional)
   * View queue history in dashboard

---

### 🧑‍💼 Admin Side

1. **Login as Admin**

   * Admin dashboard showing all counters/queues for their location
   * Each queue has:

     * Now Serving
     * Queue length
     * User list
     * Control buttons (Serve, Skip, Pause, Reset)

2. **Live Queue Control**

   * Mark users as served
   * Skip non-responders
   * Add walk-in users manually
   * Pause/resume queue
   * View real-time stats (average wait time, users served)

3. **Analytics**

   * Daily/weekly reports
   * View peak usage times
   * Export queue logs

---

## 🗃️ DATABASE DESIGN (MongoDB)

### 📁 Collections:

#### 1. **Users**

```js
{
  _id,
  name,
  email,
  role: 'user' | 'admin' | 'superadmin',
  history: [{ queueId, tokenNumber, status, servedAt }]
}
```

#### 2. **Venues**

```js
{
  _id,
  name: "Main Cafeteria",
  location: "Block A",
  queues: [ObjectId]
}
```

#### 3. **Queues**

```js
{
  _id,
  name: "Veg Counter",
  venueId,
  isActive: true,
  averageServiceTime: 120, // seconds
  nowServing: 35,
  queue: [userQueueObject]
}
```

#### 4. **userQueueObject (subdocument)**

```js
{
  userId,
  tokenNumber,
  joinedAt,
  status: 'waiting' | 'served' | 'skipped',
  notified: false
}
```

---

## 🔄 BACKEND FLOW (Node.js + Express)

| Endpoint                      | Method | Description                  |
| ----------------------------- | ------ | ---------------------------- |
| `/api/queues/:id/join`        | POST   | User joins queue, gets token |
| `/api/queues/:id/status`      | GET    | Fetch current status         |
| `/api/queues/:id/leave`       | DELETE | User leaves queue            |
| `/api/admin/queues/:id/serve` | PATCH  | Admin serves current token   |
| `/api/admin/queues/:id/skip`  | PATCH  | Admin skips current token    |
| `/api/admin/queues/:id/pause` | PATCH  | Admin pauses/resumes queue   |
| `/api/stats/queue/:id`        | GET    | Analytics for queue          |

---

## 🧑‍💻 FRONTEND FLOW (React)

### Pages:

1. **HomePage**

   * Browse queues by venue/category

2. **QueueJoinPage**

   * Show join button, info
   * After joining: show position, ETA, now serving

3. **LiveQueueStatus**

   * WebSocket or polling for real-time updates
   * Highlights when you’re near the front

4. **AdminDashboard**

   * Queue controls (Serve, Skip, Pause, Reset)
   * Live viewer list

5. **AnalyticsPage (admin only)**

   * Charts: users served, average time, peak hours

---

## 🔔 NOTIFICATIONS FLOW

* On joining queue, store FCM token or session ID
* Notify:

  * When user is top 3
  * If user is skipped
  * When admin pauses or ends queue

Can use:

* Browser push notifications
* Email (via Nodemailer)
* SMS (via Twilio)

---

## ⚙️ OPTIONAL FEATURES

* QR code for identity when user arrives
* “I’m late” button → rejoin back of line
* Guest mode (anonymous tokens, no history)
* Dark mode UI
* Mobile PWA version

---

## 🔐 AUTHENTICATION OPTIONS

* Google OAuth (using `passport-google-oauth20`)
* Admin panel protected with role-based middleware

---

## ✅ USE CASE EXAMPLES

| Place        | Queues                  |
| ------------ | ----------------------- |
| College Cafe | Veg, Non-Veg, Beverages |
| Gym          | Treadmills, Weights     |
| Library Lab  | Study Desks, PCs        |
| Hackathon    | Mentoring Support Queue |
| College Fest | Ticket Counters         |

---

Deadline -4 weeks