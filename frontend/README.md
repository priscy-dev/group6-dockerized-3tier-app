# Juwon Fitness Tracker

A React and Vite workout tracker backed by the Express API and MongoDB. Users can create an account, sign in from another browser, and retrieve their profile and workout history.

## Features

- Log workouts (exercise, sets, reps, weight)
- History grouped by day, most recent first
- Delete individual entries
- Stats bar: total workouts logged, workouts this week, total volume
- Persists profiles and workouts in MongoDB through authenticated API requests

## Getting Started

### Using Docker (Recommended)
Run the frontend container:
```
docker compose up --build frontend
```
Then open http://localhost in your browser.

### Local Development (Without Docker)
Install dependencies and start the Vite dev server:
```bash
npm install
npm run dev
```
Then open the local URL printed in your terminal (typically http://localhost:5173).

To test the production build bundle locally
```bash
npm run build
npx vite preview
```
