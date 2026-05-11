# Crypto Market Intelligence Platform

## Overview
A real-time cryptocurrency dashboard that tracks live market prices, manages personal portfolios, and triggers price alerts. The platform uses a background worker to fetch data from CoinGecko and broadcasts updates to users via WebSockets for a live, interactive experience.

## 📺 Video Walkthrough
[INSERT YOUR LOOM/YOUTUBE LINK HERE]

---

## 🛠️ Tech Stack & Justification

- **Backend:** Node.js + Express + TypeScript
  - *Justification:* Node.js provides a non-blocking I/O model ideal for handling concurrent WebSocket connections and real-time data streams. TypeScript ensures type safety across the complex data structures of market prices.
- **Database:** PostgreSQL + Prisma
  - *Justification:* PostgreSQL is used for its reliability and support for relational data (Users, Alerts, Portfolio). Prisma is used as the ORM for type-safe database access and streamlined migrations.
- **Real-time:** Socket.io
  - *Justification:* Provides a reliable bi-directional communication layer for live price broadcasting and instant alert notifications with automatic reconnection handling.
- **Frontend:** React + TailwindCSS + Recharts
  - *Justification:* React's component-based architecture allows for a modular and maintainable UI. TailwindCSS enables rapid, professional styling, and Recharts provides high-performance data visualization for price history.

---

## 🏗️ Architecture
The system follows a decoupled architecture where data ingestion is separated from the client-facing API.

```text
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│    CoinGecko API     │ ────►│  Background Worker   │ ────►│      Postgres DB     │
│ (External Price Feed)│      │  (Data Ingestion)    │      │   (Prisma Schema)    │
└──────────────────────┘      └──────────┬───────────┘      └──────────┬───────────┘
                                         │                             │
                                         ▼                             │
┌──────────────────────┐      ┌──────────────────────┐                 │
│    React Frontend    │ ◄─── │     Express API      │ ◄───────────────┘
│   (Vite + Tailwind)  │      │   (Socket.io Hub)    │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           └──────── WebSocket ──────────┘
                (Real-time Updates)
```

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🚀 Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Installation & Startup
1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd crypto-market-intelligence-platform
   ```

2. **Configure Environment:**
   The project comes with a pre-configured `docker-compose.yml`. For local development outside of Docker, copy `.env.example` to `.env`.

3. **Start the Platform:**
   ```bash
   docker-compose up --build
   ```

### Application URLs
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **API Documentation (Swagger):** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## 🔑 Demo Credentials
- **Email:** `demo@kuvaka.io`
- **Password:** `demo123`

---

## 🧪 Testing
The project includes 10+ unit and integration tests covering critical paths such as authentication, alert triggering, and portfolio calculations.
```bash
# To run tests
cd backend
npm test
```

---

## ⚠️ Known Limitations & Future Improvements
- **Redis Integration:** While price caching is currently handled in-memory, adding Redis would improve scalability for multi-instance deployments.
- **Advanced Charts:** Expanding the analytics dashboard with more complex indicators (RSI, Moving Averages).
- **Email/Push Notifications:** Implementing external notification services beyond in-app WebSockets.