# Backend API Documentation

## Overview
This is the backend part of the Fullstack MVC Application built with Node.js, Express.js, and MySQL. The application follows the MVC architecture, separating concerns into models, views, and controllers.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory:
   ```
   cd fullstack-mvc-app/backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Configuration
1. Create a `.env` file in the backend directory and add your database configuration:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application
To start the backend server, run:
```
npm start
```
The server will be running on `http://localhost:3000`.

## Folder Structure
- **src/**: Contains the source code for the backend application.
  - **app.js**: Entry point of the application.
  - **config/**: Configuration files, including database connection.
  - **controllers/**: Request handlers for various routes.
  - **middlewares/**: Middleware functions for authentication and other purposes.
  - **models/**: Database models for interacting with MySQL.
  - **routes/**: Route definitions linking to controllers.
  - **services/**: Business logic separated from controllers.
  - **utils/**: Utility functions for common tasks.

## API Endpoints
- **GET /api/resource**: Description of the endpoint.
- **POST /api/resource**: Description of the endpoint.

## License
This project is licensed under the MIT License. See the LICENSE file for details.