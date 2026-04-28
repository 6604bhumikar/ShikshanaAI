
# Content Service

## Setup

1. Copy .env.example to .env
2. Run npm install
3. Run npm run dev

## Public Routes

GET /courses
GET /courses/:slug

## Teacher Routes (Require x-user-role: teacher)

POST /courses
POST /courses/:id/submit

MongoDB Database: content-db
Port: 5002
