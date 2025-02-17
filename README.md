# Blog Project

This repository contains a full-stack blogging platform built with Cloudflare Workers for the backend and Vite + React for the frontend. The project enables users to create, manage, and read blog posts efficiently.

## Tech Stack

### Backend
- Cloudflare Workers
- Hono (Web Framework)
- Prisma (Database ORM)
- Zod (Data Validation)
- bcryptjs (Password Hashing)

### Frontend
- React
- Vite
- Tailwind CSS

### Common
- TypeScript

## Installation & Setup

### Clone the Repository
```sh
git clone https://github.com/your-username/blog-project.git
cd blog-project
```

### Install Dependencies

#### Backend
```sh
cd backend
npm install
```

#### Frontend
```sh
cd frontend
npm install
```

#### Common
```sh
cd common
npm install
```

### Configure Environment Variables
Create a `.env` file in `backend/` and add the required environment variables.

### Run the Project

#### Start Backend
```sh
cd backend
npm run dev
```

#### Start Frontend
```sh
cd frontend
npm run dev
```

## Deployment

### Backend (Cloudflare Workers)
```sh
cd backend
npm run deploy
```

### Frontend
Deploy the frontend using Vercel, Netlify, or any static hosting provider.

