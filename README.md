# Scalable URL Shortener

Node.js + Express + MongoDB + Redis URL shortener.

## Setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`.
3. Add your MongoDB Atlas and Redis/Upstash credentials.
4. Make sure your MongoDB Atlas Network Access allows your current IP.
5. Start:
   `npm run dev`
6. Open `http://localhost:3000`.

Do not commit `.env` or expose database/Redis credentials.
