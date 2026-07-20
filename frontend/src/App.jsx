import { useMemo } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { generatePlan } from './lib/generatePlan'
import { ProfileForm } from './components/ProfileForm'
import { WorkoutPlan } from './components/WorkoutPlan'
import { WorkoutForm } from './components/WorkoutForm'
import { WorkoutList } from './components/WorkoutList'
import { StatsBar } from './components/StatsBar'
import './App.css'

function App() {
  const [profile, setProfile] = useLocalStorage('fitness-tracker.profile', null)
  const [workouts, setWorkouts] = useLocalStorage('fitness-tracker.workouts', [])

  const plan = useMemo(() => (profile ? generatePlan(profile.weight) : null), [profile])

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

      <ProfileForm profile={profile} onSave={setProfile} />
      {profile && plan && <WorkoutPlan profile={profile} plan={plan} />}

      <StatsBar workouts={workouts} />
      <WorkoutForm onAdd={addWorkout} />
      <WorkoutList workouts={workouts} onDelete={deleteWorkout} />
    </div>
  )
}

export default App
