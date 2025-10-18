# credit-sea

This repository contains a small Express backend and a React + Vite frontend for parsing and viewing credit reports (XML). This README explains how to set up, run, and test the project locally on Windows (PowerShell examples).

## Prerequisites

- Node.js (18+ recommended)
- npm (bundled with Node)
- MongoDB running locally or accessible via a connection string

## Repo layout

- backend/ - Express API that receives XML uploads, parses them, and stores parsed documents in MongoDB
- frontend/ - React + Vite UI that uploads XML files and shows parsed reports

## Setup

1. Clone the repo (already done) and install dependencies for both backend and frontend.

PowerShell:

```powershell
# from repo root
cd backend
npm install
cd ../frontend
npm install
```

2. Configure environment (optional)

Create a `.env` file in `backend/` if you want to override defaults (optional):

```
PORT=4000
MONGO_URL=mongodb://localhost:27017/experian
```

## Run locally

Open two terminals (or tabs):

Terminal 1 - Backend:

```powershell
cd backend
npm run dev
```

Terminal 2 - Frontend:

```powershell
cd frontend
npm run dev
```

- Frontend will be served by Vite (e.g. http://localhost:5173 or 5174)
- Backend listens on port 4000 by default

## Tests

### Backend

The backend contains a small integration test suite using Mocha, Chai, and Supertest.

Install dev dependencies (already done with `npm install`):

```powershell
cd backend
npm test
```

The tests will import the `app` without starting a network listener when `NODE_ENV=test` is set; the test runner uses the exported app object.

### Frontend

No frontend unit tests are included in this branch. You can run linting in the frontend:

```powershell
cd frontend
npm run lint
```

## Uploading a sample XML (manual)

- Use the frontend UI to upload an XML file via the "Upload XML Report" form.
- Or use curl (PowerShell):

```powershell
curl.exe -i -X POST -F "file=@C:\path\to\report.xml" http://localhost:4000/api/upload
```

The upload endpoint returns a JSON object with `{ "id": "<reportId>" }` when successful.

## Notes

- If you accidentally committed secrets or sensitive files, rotate them and consider removing them from Git history.
- If you need help adding unit tests for the frontend, I can add a basic Jest + React Testing Library setup.

If anything is unclear or you want automated CI config (GitHub Actions) to run tests and linting on push, tell me and I can add it.
