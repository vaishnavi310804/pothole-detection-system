# Backend

Express and MongoDB backend for the OK Driver assignment.

## Requirements

- Node.js 18 or later
- MongoDB connection string

## Setup

From the `backend` directory:

```bash
npm install
```

Create a `.env` file with the MongoDB connection string and, optionally, a port:

```env
DATABASE_URL=mongodb://localhost:27017/okdriver
PORT=5000
```

## Run the server

Start the server normally:

```bash
npm start
```

Start the server in development mode with automatic restarts:

```bash
npm run dev
```

The server listens on `http://localhost:5000` by default. Set `PORT` in `.env` to use another port.

## API

### Health check

`GET /`

Returns:

```text
API running
```

## Project structure

```text
backend/
├── index.js              # Express app and server configuration
├── server.js             # Loads environment variables and starts the app
├── package.json          # Scripts and dependencies
└── src/
    ├── config/
    │   └── db.js         # MongoDB connection
    ├── controllers/      # Request handlers
    ├── middleware/       # Express middleware
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    └── services/         # Business logic and integrations
```

## Notes

- CORS is enabled for the API.
- JSON request bodies are supported through Express middleware.
- The application exits if the MongoDB connection cannot be established.
