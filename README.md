# Kanban Task Management API

This is a RESTful API for managing a Kanban-style task management system. It allows users to create, read, update, and delete boards, columns, tasks, and subtasks.

## Features

- **User Authentication**: Secure authentication using JWT.
- **Boards**: Create, read, update, and delete boards.
- **Columns**: Manage columns within boards.
- **Tasks**: Add, update, move, and delete tasks.
- **Subtasks**: Manage subtasks within tasks.
- **Demo Mode**: Allows only read requests for demo purposes.
- **Rate Limiting**: Limits to 50 requests per 15 minutes per IP address.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## API Endpoints

### Authentication

- **POST /api/v1/auth/register**: Register a new user.
- **POST /api/v1/auth/login**: Login a user.

### Boards

- **GET /api/v1/boards**: Get all boards.
- **POST /api/v1/boards**: Create a new board.
- **PATCH /api/v1/boards/:id**: Update a board by ID.
- **DELETE /api/v1/boards/:id**: Delete a board by ID.

### Tasks

- **POST /api/v1/tasks**: Create a new task in a column.
- **PATCH /api/v1/tasks/:id**: Update a task by ID.
- **PATCH /api/v1/tasks/:id/status**: Update a task's column by id
- **DELETE /api/v1/tasks/:id**: Delete a task by ID.

## Documentation

For detailed API documentation, please visit [[postman-documentation](https://documenter.getpostman.com/view/22112903/2sA3s7iU76)].

## Live Demo

Check out the live frontend of the Kanban Task Management system here [[live-frontend-link](https://kanban-task-management-frontend-phi.vercel.app/)].

