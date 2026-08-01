# EduConnect — Online Learning Platform

Full-stack MERN application: instructors create and manage courses, students
search the catalog, enroll, and leave reviews.

**Stack:** React (Vite) · Node.js/Express · MongoDB (Mongoose) · JWT auth

## Project layout

```
backend/    Express API (routes -> controllers -> services -> models)
frontend/   React SPA (Vite, React Router, plain CSS)
```

### Backend architecture

```
src/
  routes/       API endpoints, delegate to controllers
  controllers/  Request/response handling + input validation
  services/     Business logic (enrollment rules, rating calculation, ownership checks)
  models/       Mongoose schemas (Data Access Layer)
  middleware/   JWT auth guard, centralized error handler
  utils/        ApiError, asyncHandler, validators
```

## Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or update `MONGO_URI`)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then set JWT_SECRET to a random string
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api
npm run dev             # http://localhost:5173
```

Open http://localhost:5173, register an account, and start creating courses.

## Data model

- **User** — username, email, password hash, name, bio, profile picture URL
- **Course** — title, description, price, category, modules[], `instructor` ref → User, averageRating, reviewCount
- **Enrollment** — `student` ref → User, `course` ref → Course (unique compound index prevents double-enrollment)
- **Review** — `course` ref, `student` ref, rating (1–5), comment (unique per student/course; upserts on resubmission)

## API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns user + JWT |
| POST | `/api/auth/login` | — | Returns user + JWT |
| POST | `/api/auth/change-password` | ✅ | Verifies current password before updating |
| GET/PUT | `/api/users/me` | ✅ | Read/update profile |
| GET | `/api/courses` | — | Public catalog: `?search=&category=&minPrice=&maxPrice=&page=&limit=` |
| GET | `/api/courses/categories` | — | List valid categories |
| GET | `/api/courses/mine` | ✅ | Instructor's own courses |
| POST | `/api/courses` | ✅ | Create course |
| GET | `/api/courses/:id` | — | Course detail |
| PUT/DELETE | `/api/courses/:id` | ✅ (owner only) | Update/delete — 403 if not the instructor |
| POST | `/api/courses/:id/enroll` | ✅ | Enroll (409 if already enrolled) |
| GET | `/api/courses/:id/reviews` | — | List reviews |
| POST | `/api/courses/:id/reviews` | ✅ (enrolled only) | Add/update your review, recalculates course rating |
| DELETE | `/api/reviews/:reviewId` | ✅ (author only) | Delete your review |
| GET | `/api/enrollments/mine` | ✅ | Student's enrolled courses |

Standard status codes throughout: `200/201` success, `400` validation, `401`
missing/invalid token, `403` authenticated but not permitted (ownership),
`404` missing resource, `409` conflict (duplicate email/username/enrollment/review).

## Frontend notes

- `src/api/client.js` — Axios instance with a request interceptor that attaches the JWT and a response interceptor that clears the session on `401`.
- `src/context/AuthContext.jsx` — global auth state (login/register/logout, persisted to `localStorage`).
- `src/components/ProtectedRoute.jsx` — route guard; redirects unauthenticated users to `/login` and returns them afterward.
- Every data-fetching page renders explicit **loading / error / empty** states (see `src/components/StatusStates.jsx`).
- Course and profile forms validate client-side before submitting (title length, price ≥ 0, category enum, password length, etc.).
