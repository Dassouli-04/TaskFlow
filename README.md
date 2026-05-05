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


## Git Workflow

- `main`: stable branch
- `develop`: integration branch
- `feature/authentification`: authentication feature branch

