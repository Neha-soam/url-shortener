<<<<<<< HEAD
# AI-Powered URL Shortener

## Project overview
A URL shortener with Redis-cached redirects, creation-time ML phishing detection, privacy-minimal analytics and security controls.
**Design rule:** keep the redirect path fast (Redis → MongoDB only), run ML once at creation, measure every claim.

## Features
- Shorten + redirect, custom aliases, expiry (TTL), collision-safe short codes
- Redis cache with MongoDB fallback (Redis down ≠ redirects down)
- ML risk score + model version + explanation stored per URL
- Click analytics (no IPs stored, 90-day retention)
- Rate limiting, URL validation, SSRF-hardened fetch helper, JWT auth

## Architecture
`Client → Express → rate limit/auth/validation → controller → service → ML (creation only) → MongoDB → Redis → redirect`. See `docs/architecture.md`.

## Tech stack
Node.js/Express, MongoDB (Mongoose), Redis (ioredis), Python (scikit-learn, Flask), React (Vite), Docker Compose.

## Folder structure
`backend/` API · `ml/` training + prediction service · `frontend/` UI · `tests/` unit/integration/security/load · `docs/` documentation.

## Environment variables
Copy `backend/.env.example` → `backend/.env` and set `JWT_SECRET`. **Never commit `.env`.**

## Installation & running
**Everything with Docker (easiest):**
```bash
cp backend/.env.example backend/.env      # edit JWT_SECRET
docker compose up --build
# API on :4000, ML on :5001
```
**Manually:**
```bash
# Mongo + Redis running locally, then:
cd ml && pip install -r requirements.txt
python -m src.make_sample_data            # SYNTHETIC placeholder data -- replace with a real dataset!
python -m src.train --version v1.0
python -m src.server                      # :5001

cd backend && npm install && cp .env.example .env && npm run dev   # :4000
cd frontend && npm install && npm run dev                          # :5173
```

## API endpoints
See `docs/api.md`.

## Database schema
See `docs/database-schema.md`.

## ML evaluation
See `docs/ml-report.md` (fill in with results from a REAL dataset).

## Testing
```bash
cd backend && npm test                 # unit + SSRF tests (no services needed)
npm run test:integration               # needs the stack running
python -m pytest tests/unit            # ML feature tests (pip install pytest)
k6 run tests/load/redirect.k6.js       # load test (see file header)
```

## Security considerations
Unique index + bounded retry for collisions · scheme allow-list · private-IP/SSRF blocking · rate limiting · Helmet · bcrypt + JWT · no secrets in git · analytics privacy. See `docs/architecture.md`.

## Deployment
Set real secrets, `TRUST_PROXY=true` behind a load balancer, use managed MongoDB/Redis, HTTPS only, and switch rate limiting to a Redis store when running >1 instance.

## Known limitations
- Rate limiter uses in-memory store (per instance).
- Model quality depends entirely on the dataset; bundled data is synthetic.
- No DNS-rebinding protection in `safeFetch` (documented in code).
- URL-only features: cannot catch phishing hosted on a trusted domain.
=======
# url-shortener
AI-powered URL Shortener with malicious link detection, analytics, and secure URL management.
# AI-Powered URL Shortener

An AI-powered URL shortener built with React, Node.js, Express, MongoDB, and Redis. It generates short URLs, detects potentially malicious links using an ML service, and provides URL analytics.

## Features

* **URL Shortening:** Convert long URLs into short, shareable links.
* **AI-Based URL Classification:** Integrate an ML service to assess potentially malicious URLs.
* **User Authentication:** Secure registration and login using JWT.
* **URL Management:** Create, view, and delete your shortened URLs.
* **Analytics:** Track clicks and view URL statistics.
* **Caching:** Use Redis to improve performance, with MongoDB fallback for redirects.

## Tech Stack

**Frontend**

* React
* Vite

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis
* JWT Authentication

**Machine Learning**

* ML service integration for URL classification

## Project Structure

```text
ai-url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── tests/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

* Node.js 18 or later
* MongoDB
* Redis (optional, for caching)
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ai-url-shortener.git
cd ai-url-shortener
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

Start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:4000` by default.

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Environment Variables

Configure the backend variables in `backend/.env`. Refer to `backend/.env.example` for the required names and defaults.

Never commit real credentials, API keys, or secrets.

## Testing

Run the backend unit tests:

```bash
cd backend
npm test
```

Run integration tests:

```bash
npm run test:integration
```

## Team Project

Developed collaboratively as a group project. Contributions, bug reports, and feature suggestions are welcome.

## License

To be decided.
>>>>>>> 1fdc0765fd49a3b407557966a6f7c7cd0934a649
