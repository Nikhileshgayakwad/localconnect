# LocalConnect

LocalConnect is a foundation for a full-stack social e-commerce application. It includes a complete authentication system with JWT, and connects a React frontend with an Express backend using MongoDB.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
* **Backend:** Node.js, Express
* **Database:** MongoDB, Mongoose
* **Auth:** JSON Web Tokens (JWT), bcryptjs

## Prerequisites
* Node.js (v18+)
* MongoDB Atlas cluster or local MongoDB instance

## Local Development in AI Studio
1. The dependencies are automatically managed via `package.json`.
2. Ensure you have added your environment variables in AI Studio settings:
   * `MONGO_URI`: Your MongoDB connection string.
   * `JWT_SECRET`: A secure random string for JWT.
3. The development server (`tsx server.ts`) will automatically run and serve both the Express API and the Vite frontend on port 3000.

## Project Structure
- `src/`: React frontend source code
  - `components/`: Reusable UI elements (`Navbar`, `ProtectedRoute`, etc.)
  - `pages/`: Route components (`Home`, `Login`, `Register`, `Dashboard`)
  - `context/`: React context (e.g., `AuthContext`)
- `server/`: Node.js backend source code
  - `models/`: Mongoose schemas (e.g., `User`)
  - `controllers/`: API route handlers
  - `routes/`: Express routers
  - `middleware/`: Express middleware (`authMiddleware`)
  - `config/`: Database connection logic
- `server.ts`: The unified entry point for both API and frontend.

## Deployment
Running `npm run build` will build the Vite frontend and bundle the backend `server.ts` via esbuild, preparing the `dist` folder for Node.js production start `npm start`.
