# Fitness Tracker

A simple workout tracker built with React and Vite. Log exercises with sets, reps, and weight, view your history grouped by day, and track weekly stats. Data is saved locally in the browser via `localStorage`.

## Features

- Log workouts (exercise, sets, reps, weight)
- History grouped by day, most recent first
- Delete individual entries
- Stats bar: total workouts logged, workouts this week, total volume
- Persists between sessions using `localStorage`

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