# 🎉 Event Management Dashboard

A **production-grade** Event Management Dashboard built using modern technologies like **Next.js 15**, **TypeScript**, **SQLite**, and more. This project is architected for **scalability**, **component reusability**, and **distributed system thinking**.

> 📌 Ideal for managing, categorizing, and publishing events in a streamlined dashboard UI.

---

## 🖼️ Features

- ✅ Dashboard view for all unpublished events
- 🕓 Event badges indicating:
  - **Past** – Events that have already occurred
  - **New** – Events happening within the next 2 weeks
  - **Upcoming** – Future events beyond 2 weeks
- 🧩 Reusable and scalable components
- 🔒 Authenticated access using NextAuth
- ⚡ Fast and responsive UI with shadcn/ui

---

## ⚙️ Getting Started

Follow these steps to run the project locally:

```bash
1️⃣ Clone the Repository
git clone <repo-url>
cd event-management-dashboard



2️⃣ Install Dependencies
npm install



3️⃣ Set Up Environment Variables
Create a .env.local file in the root of your project and add the following:
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
💡 Replace "your-secret-key" with a strong, secure string.


4️⃣ Run the Setup Scripts
npm run setup
npm run dev


Once running, visit:
🔗 http://localhost:3000

You'll see the homepage with a list of unpublished events, each displayed as a card with a badge on top indicating its status:
```

# 📈 App Scaling Strategy

As our app continues to grow with more users, events, and reminders, we need to make sure it stays fast, responsive, and scalable. This document outlines our scaling strategy using Redis, BullMQ, and real-time updates.

---

## 1. Redis Caching (1-Hour TTL)

We use **Redis** to cache data that’s accessed frequently and is costly to fetch from the database.

### Why Redis?

- **Super Fast** – In-memory storage means response times in microseconds.
- **Scalable** – Supports sharding and clustering for large datasets.
- **Lightweight** – Much quicker than querying the database repeatedly.

### Where We Use Redis:

- Paginated event listings (`GET /api/events`)
- Reminder stats and logs for dashboards
- Frequently used settings that rarely change

### ⏱ Why 1-Hour TTL?

- **Fresh enough** – Data is always less than 60 minutes old.
- **Performance boost** – Cuts down on database traffic.
- **Balanced** – A good mix of speed and up-to-date info.

> Critical updates can manually clear the cache if needed.

### Example Flow:

1. User requests event list.
2. Check Redis cache:
   - If found → return immediately.
   - If not → fetch from DB → save to Redis for 1 hour → return to user.

---

## 2. 🛠 Background Tasks with BullMQ

We use **BullMQ** (backed by Redis) to handle tasks behind the scenes without slowing down the app.

### What BullMQ Does:

- Sends reminders asynchronously
- Processes batch notifications
- Runs scheduled jobs (e.g., daily event emails)

---

## 3. Real-Time Updates with Pub/Sub

To provide real-time updates, we use **Redis Pub/Sub** or external services like **Ably** or **Pusher**.

### Use Cases:

- Broadcasting event updates to connected clients
- Notify users instantly when events are updated
- Real-time dashboard refresh when a new reminder is sent or an event is updated

---

## ✅ Summary

| Component | Purpose                   |
| --------- | ------------------------- |
| Redis     | Fast data caching         |
| BullMQ    | Background job processing |
| Pub/Sub   | Real-time updates         |

This setup helps ensure our app remains efficient, scalable, and user-friendly as we grow.

# 🌍 Deployment Options: AWS vs Vercel

As our app grows and we aim for better performance around the world, simple breakdown of what things look like if **we deploy on AWS** or **Vercel**, and how it impacts scaling, complexity, and our database setup.

---

## Option 1: Deploying on **AWS**

### Multi-Region Deployment

If we go with AWS, we’ll need to manually set up multiple regions. Using **AWS CDK**, we can automate the provisioning of infrastructure, and also version control everything — which is great for keeping things consistent across environments.

### Database Strategy

We’d have a couple of options here:

- **One RDS per region** (with replication) for better local performance. If each region handles region-specific users/events, separate DBs per region makes sense (faster queries, less cross-region latency).
- Or use **Aurora Global Database** to keep data synced across regions automatically.

### Scaling the App

We’d likely **Dockerize** the app and run it using:

- **ECS**, **EKS**, or
- **AWS App Runner** for easy horizontal scaling (more containers when we need more power).

### ⚠️ Complexity Level: High

Managing an AWS-based setup means we handle everything — from networking and failover to DNS routing (using something like **Route53**). It's powerful, but also comes with more responsibility and setup time.

---

## 🟩 Option 2: Deploying on **Vercel**

### 🌍 Multi-Region by Default

Vercel makes global deployment easy. It automatically deploys our app across regions with **edge caching** for static files and some API routes — no extra setup required. But: **our database still needs its own multi-region setup**.

### Database Strategy

We can pair Vercel with:

- A **globally distributed database** like **PlanetScale**, **Neon**, or **Supabase** (with read replicas).
- Or stick with a **single-region database** if we’re okay with a bit of latency for distant users.

### Scaling the App

Vercel takes care of scaling **automatically** — no Docker, no container management. We just push our code, and Vercel handles the rest.

### Complexity Level: Low

This setup is much simpler. We focus on writing code, and Vercel handles the infrastructure — perfect for fast-moving teams or early-stage projects.

---

## 🔍 Summary Comparison

| Feature              | AWS                            | Vercel                        |
| -------------------- | ------------------------------ | ----------------------------- |
| Multi-Region Support | Manual setup (with CDK)        | Automatic (edge caching)      |
| Database Options     | RDS per region / Aurora Global | PlanetScale / Neon / Supabase |
| Scaling              | Docker + ECS/EKS/App Runner    | Handled by Vercel             |
| Complexity           | High (more control)            | Low (less to manage)          |

---

Choosing between AWS and Vercel depends on how much control we want vs. how much simplicity we need. If we want deep customization and full control, AWS is great. If we want to move fast and let the platform handle the heavy lifting, Vercel makes a lot of sense.
