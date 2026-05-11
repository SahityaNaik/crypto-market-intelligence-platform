# System Architecture

This document outlines the architectural design and data flow of the Crypto Market Intelligence Platform.

## System Design Diagram

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

## Architectural Components

### 1. External Data Source (CoinGecko)
- Provides real-time price data for 10+ cryptocurrencies.
- Accessed via a rate-limited REST API.

### 2. Background Worker (The Engine)
- A separate process that runs continuously.
- Fetches data every 10 seconds.
- Handles exponential backoff and caching to respect API rate limits.
- Calculates volatility and price changes before storing them.
- Triggers the Alert Engine when price thresholds are met.

### 3. Data Layer (PostgreSQL + Prisma)
- **PostgreSQL:** Stores persistent data including user profiles, portfolio holdings, active alerts, and historical price points.
- **Prisma ORM:** Provides a type-safe interface for database interactions and manages migrations.

### 4. Application Server (Express + Socket.io)
- **REST API:** Handles user authentication, portfolio management, and alert creation.
- **WebSocket (Socket.io):** Broadcasts live price updates to all connected clients and sends instant notifications when alerts are triggered.

### 5. Client Layer (React)
- A responsive dashboard built with TypeScript and TailwindCSS.
- Uses **Recharts** for interactive price visualization.
- Maintains a persistent WebSocket connection for real-time UI updates without page refreshes.
