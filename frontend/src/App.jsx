import { useLocalStorage } from './hooks/useLocalStorage'
import { WorkoutForm } from './components/WorkoutForm'
import { WorkoutList } from './components/WorkoutList'
import { StatsBar } from './components/StatsBar'
import './App.css'

function App() {
  const [workouts, setWorkouts] = useLocalStorage('fitness-tracker.workouts', [])

  function addWorkout(workout) {
    setWorkouts((prev) => [...prev, workout])
  }

  function deleteWorkout(id) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💪 Fitness Tracker</h1>
        <p>Log your workouts and keep an eye on your progress.</p>
      </header>

      <StatsBar workouts={workouts} />
      <WorkoutForm onAdd={addWorkout} />
      <WorkoutList workouts={workouts} onDelete={deleteWorkout} />
    </div>
  )
}

export default App
