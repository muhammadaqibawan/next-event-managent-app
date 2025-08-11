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

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd event-management-dashboard

2️⃣ Install Dependencies
npm install



3️⃣ Set Up Environment Variables
Create a .env file in the root of your project and add the following:
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
