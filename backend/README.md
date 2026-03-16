# House of bore Backend

Node.js + Express + MongoDB backend for the ecommerce project.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI`
3. Install dependencies:
   `npm install`
4. Seed sample products:
   `npm run seed`
5. Start the API:
   `npm run dev`

## API

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
