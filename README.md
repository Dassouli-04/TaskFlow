# TaskFlow

TaskFlow is a collaborative project management web application built with JavaScript, Express, MongoDB, Docker, and GitHub.

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Axios
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs
- Environment: Docker and Docker Compose

## Project Setup

The application runs with Docker.

From the project root folder, run:

```bash
docker compose up --build
```

If your machine uses the older Docker command, run:

```bash
docker-compose up --build
```

Backend API:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Environment Variables

Create a real `.env` file inside the `backend/` folder based on `.env.example`.

Required variables:

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/taskflow
JWT_SECRET=your_jwt_secret_here
```

Sensitive files such as `.env` must not be committed to GitHub.

## Project Structure

```text
TaskFlow/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      server.js
    Dockerfile
    package.json

  frontend/
    css/
    js/
    register.html
    login.html
    dashboard.html
    projects.html

  docker-compose.yml
  .env.example
  .gitignore
  README.md
```

## Feature Distribution

| Student | Feature |
|---|---|
| Mohammad Dassouli | Authentification des utilisateurs & Création et gestion des projets  |
| Mouhssine Daghmoumy |  Gestion des tâches & Assignation des tâches aux membres  |
| Amr Rahali | Tableau de bord personnel & Filtrage, recherche et pagination  |
| Issam Choulli | Sauvegarde automatique des brouillons  & Gestion des membres d'un projet  |
| Mohammed Tahiri |  Historique des activités &  Notifications et gestion des événements côté client  |

## Feature 1 — Authentication

Implemented by Mohammad Dassouli.

### Completed

- User registration
- User login
- Password hashing with bcryptjs using 10 rounds
- JWT token generation
- JWT secret stored in `.env`
- Authentication middleware for protected routes
- Protected route: `GET /api/auth/me`
- Frontend register page
- Frontend login page
- Frontend dashboard page
- Token storage in LocalStorage
- Axios automatically sends the token in the `Authorization: Bearer <token>` header
- Logout removes the token and redirects to the login page
- Session restoration after page reload

## Auth API Routes

| Method | Route                | Description                        |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/api/auth/register` | Register a new user                |
| POST   | `/api/auth/login`    | Login user and return JWT token    |
| GET    | `/api/auth/me`       | Get authenticated user information |



## Feature 2 — Project Management

Implemented by Mohammad Dassouli.

### Completed

- Project model with owner reference
- Project CRUD API routes
- Protected project routes using authentication middleware
- Project listing with pagination
- Owner-only update and delete permissions
- Cascade delete for related tasks on project removal
- Frontend projects page with create, edit, delete, and pagination


## Project API routes

| Method | Route | Description |
|---|---|---|
| GET | /api/projects | Get authenticated user's projects with pagination |
| POST | /api/projects | Create a new project |
| GET | /api/projects/:id | Get one project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project and related tasks |

## Project pagination

```http
GET /api/projects?page=1&limit=10 
```


## Git Workflow

- `main`: stable branch
- `develop`: integration branch
- `feature/authentification`: authentication feature branch



