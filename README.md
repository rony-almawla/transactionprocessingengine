# Transaction Processing Engine

A RESTful backend API built with Fastify, Prisma, and PostgreSQL for processing transactions with fraud detection, analytics, JWT authentication, and rate limiting.

---

## Features

- **Endpoints**
  - `POST /transactions` – Submit single or batch transactions.
  - `GET /analytics` – Get aggregated transaction insights.
  - `POST /auth/login` – Authenticate a user and receive JWT.
  - `GET /health` – Service health check (database and Redis connectivity).

- **Security**
  - JWT authentication for all endpoints except `/auth/login` and `/health`.
  - Role-based access support (`user` and `admin`).

- **Validation & Normalization**
  - Transactions validated with Joi.
  - Accepts single or multiple transactions.
  - Partial success for batch transactions.

- **Fraud Detection**
  - Flags transactions over $5,000.
  - Flags transactions to high-risk destinations (`CI`, `SO`, `VE`).
  - Flags rapid transactions from the same source (over 5 in 10 minutes).

- **Rate Limiting**
  - Max 100 transactions per 5-minute window per source.
  - Redis primary store, in-memory fallback if Redis unavailable.

- **Analytics**
  - Total transaction volume by source.
  - Average transaction amount per destination.
  - Transactions per UTC hour.

- **Testing**
  - Unit tests for fraud rules, transaction processing, and analytics.
  - Integration tests for API endpoints.

---

## Setup & Installation

1. **Clone the repository**
```bash
git clone https://github.com/rony-almawla/transactionprocessingengine.git
cd transactionprocessingengine
Install dependencies

bash
Copy code
npm install
Configure environment variables

Create a .env file in the root:

ini
Copy code
PORT=4000
DATABASE_URL=postgresql://postgres:123456@localhost:5432/transaction_engine?schema=public
REDIS_URL=redis://default:password@localhost:6379
JWT_SECRET=mySuperSecretKey
Run Prisma migrations

bash
Copy code
npx prisma migrate dev
Start the server

bash
Copy code
node server.js
The API will run at http://localhost:4000.

Swagger documentation
Visit http://localhost:4000/docs for API documentation.

Running Tests
bash
Copy code
npm test
Check coverage:

bash
Copy code
jest --coverage
Notes
Ensure PostgreSQL and Redis are running locally or provide cloud URLs.

Transactions can be submitted in bulk; partial failures are returned with error details.

JWT tokens must be included in Authorization: Bearer <token> header for protected endpoints.

yaml
Copy code

---

This README.md covers all **essential assessment deliverables**: setup instructions, API usage, and testing.  
