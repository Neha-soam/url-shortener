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
