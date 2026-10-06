# Folio Notes

A full-stack notes app with a React/Vite interface, an Express API, and MongoDB storage. Write a note, choose its paper color, search the collection, edit it, or remove it.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Configure MongoDB

1. In `backend`, create a `.env` file (or copy `.env.example`).
2. Set `MONGO_URI` to your MongoDB connection string. For a local MongoDB server, use `mongodb://127.0.0.1:27017/folio_notes`.
3. Keep `backend/.env` private. It is excluded from Git.

## Run the app

Open two terminals in the `06` folder.

**Terminal 1 — API and database connection**

```powershell
cd backend
npm install
npm start
```

Wait until the terminal confirms MongoDB is connected and the API is listening on port 5000.

**Terminal 2 — React interface**

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the second terminal (usually http://localhost:5173).

The frontend proxies `/api` requests to the Express server. The API is available at `http://localhost:5000/api/notes`.

## Notes API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API and MongoDB connection |
| GET | `/api/notes` | List notes (newest updated first) |
| GET | `/api/notes/:id` | Fetch one note |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Remove a note |

Notes are shared by anyone using this demo because it does not include user accounts or access controls. Do not store sensitive information.
