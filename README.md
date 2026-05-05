# Team Task Manager

A full-stack task management web app built for a Junior Software Developer assignment. Users can sign up, sign in, create projects, manage project members, assign tasks, and track progress with role-based access for `ADMIN` and `MEMBER` users.

## Key Features

- Authentication with signup, login, logout, bcrypt password hashing, JWT, and HTTP-only cookies
- Role-based access control
  - `ADMIN`: create projects, add members, create and assign tasks, update any task status
  - `MEMBER`: view accessible projects and update only assigned task statuses
- Project and team management with MongoDB relationships
- Task creation, assignment, due date tracking, and status updates
- Dashboard metrics for total tasks, status counts, and overdue work
- API-level validation using Express Validator
- Client-side form validation using React Hook Form and Zod
- Redux Toolkit auth state and protected React Router routes
- Optional Redis-backed session checks for JWT revocation support

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Express Validator
- bcryptjs
- JSON Web Token
- cookie-parser
- Redis
- Morgan
- dotenv

### Frontend

- React.js
- React DOM
- React Router DOM
- Redux Toolkit
- React Redux
- React Hook Form
- Zod
- Axios
- Vite
- Tailwind CSS

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── features/auth
│   │   ├── pages
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── validators
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── package.json
└── README.md
```

## Environment Variables

Create `server/.env`:

```env
PORT=8080
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/team_task_manager
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_TTL_SECONDS=604800
REDIS_URL=redis://localhost:6379
REQUIRE_REDIS=false
CLIENT_URL=http://localhost:5173
AUTH_COOKIE_NAME=ttm_token
COOKIE_SAMESITE=lax
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Redis is supported through `REDIS_URL`. If Redis is not running and `REQUIRE_REDIS=false`, the app still runs locally and uses cookie JWT auth without Redis session checks.

## Railway Single URL Deployment

This project is configured for one Railway service and one Railway URL.

- Railway build command: `npm run build`
- Railway start command: `NODE_ENV=production npm run start`
- The Express server serves `client/dist`
- The React app calls the backend with same-origin `/api`

Set these Railway environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_TTL_SECONDS=604800
AUTH_COOKIE_NAME=ttm_token
COOKIE_SAMESITE=lax

REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_TLS=false
REQUIRE_REDIS=false
```

Do not set `VITE_API_URL` on Railway for this single URL setup. Railway provides `PORT` automatically, so you do not need to set `PORT`.

## Run Locally

```bash
npm install
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:8080`
- Health check: `http://localhost:8080/api/health`

Build the React client:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Projects

- `GET /api/projects`
- `POST /api/projects` (`ADMIN`)
- `POST /api/projects/:projectId/members` (`ADMIN`)

### Tasks

- `GET /api/tasks/project/:projectId`
- `POST /api/tasks/project/:projectId` (`ADMIN`)
- `PATCH /api/tasks/project/:projectId/:taskId`

### Dashboard

- `GET /api/dashboard`

## Data Models

### User

- `name`
- `email`
- `passwordHash`
- `role`: `ADMIN` or `MEMBER`

### Project

- `name`
- `description`
- `owner`: User reference
- `members`: User references

### Task

- `title`
- `description`
- `project`: Project reference
- `createdBy`: User reference
- `assignee`: User reference
- `dueDate`
- `status`: `TODO`, `IN_PROGRESS`, `DONE`

## Validation And Security

- API validation is handled in route validators with Express Validator.
- Client form validation is handled by React Hook Form and Zod.
- Passwords are hashed with bcryptjs.
- JWTs are stored in HTTP-only cookies, not localStorage.
- Protected routes use cookie auth and `/api/auth/me`.
- Redis can validate active JWT sessions and supports logout revocation.
- CORS is configured with credentials for the React client origin.

## Role-Based Access

- Admin users can create projects and tasks, add members by email, and update task status.
- Member users can view projects they belong to and update status only for tasks assigned to them.
- Project access is checked before task and member operations.

## Submission Checklist

- Signup/Login works
- Admin can create a project
- Admin can add a member by email
- Admin can create and assign tasks
- Member can view assigned project work
- Member can update assigned task status
- Dashboard shows task status and overdue counts
- README is included at the root
