# FUMIQ Backend

FUMIQ is a backend system designed to manage quizzes and sessions for educational purposes. It provides RESTful APIs for creating, managing, and participating in quizzes, as well as retrieving session results.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Optional routes](#optional-routes)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- **Quiz Management**: Create, update, delete, and retrieve quizzes.
- **Session Management**: Start, end, and retrieve quiz sessions.
- **User Authentication**: Secure endpoints with JWT-based authentication.
- **Validation**: Input validation using middleware.
- **Swagger Documentation**: Auto-generated API documentation.
- **Real-time Features**: Support for real-time quiz sessions (if applicable).

---

## Technologies Used

- **Node.js**: Backend runtime.
- **Express**: Web framework for building RESTful APIs.
- **TypeScript**: Strongly typed language for better code quality.
- **Swagger**: API documentation.
- **Joi**: Input validation.
- **MongoDB**: Database for storing quizzes and sessions.
- **Redis**: Caching layer for performance optimization.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/fumiq-backend.git
   cd fumiq-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file by copying .env.example:
   ```bash
   cp .env.example .env
   ```
4. Update the .env file with your environment-specific variables.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Build the project for production:
   ```bash
   npm run build
   ```
7. Start the production server:
   ```bash
   npm run start
   ```

## Docker

1.  Build docker image

```bash
docker build -t fumiq-backend .
```

2. Run docker container

```bash
docker run -p 3000:3000 --env-file .env fumiq-backend
```

## Environment Variables

- `DB_LINK` MongoDB connection string.
- `CACHE_LINK` Redis connection string.
- `EMAIL_SERVICE`: Email service
- `EMAIL_USER` Email user
- `EMAIL_PASS` Special password to email user
- `EMAIL_FROM` From who email will be sent
- `JWT_SECRET` JWT secret code
- `ORIGIN_LINK` Link for frontend
- `SERVER_IP` Adress ip of the backend server

## Optional routes

1. Documentation:
   ```bash
   http://localhost:3000/docs
   ```
2. Health Check
   ```bash
   http://localhost:3000/health
   ```
3. Service Check
   ```bash
   http://localhost:3000/health/service
   ```

## Pro structure

```bash
fumiq-backend/
├── src/
|   ├── api/
|   |    └──v1/      # routes and controllers for version 1
|   |        ├── controllers/ # Request handlers
│   |        └── routes/           # API routes
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── schemas/         # Schemas for validation
│   ├── types/         # Special types for ts
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── swagger.ts            # Documentation setup for swagger
│   ├── app.ts            # Express application
│   └── server.ts            # Server to run application
└── Dockerfile # Dockerfile with config
```

## License

https://github.com/slodkiadrianek/FUMIQ-API-NODEJS/tree/develop?tab=License-1-ov-file
