# React Hook Form with Next.js and Strapi

This is the frontend part of the My-App project. The backend (Strapi) is in a separate repository: [my-backend](https://github.com/nhathuy1210/my-backend)

## Project Structure

- `my-frontend/` - Next.js frontend application
- Backend is maintained separately (see link above)

## Installation & Setup

```bash
cd my-frontend
npm install
npm run dev
```

## Environment Variables

Create `.env.local` for development:

```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Build & Deploy

```bash
npm run build
npm run start
```
