import { useMemo, useState } from 'react'
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
  const [registrationError, setRegistrationError] = useState('')

  const plan = useMemo(() => (profile ? generatePlan(profile.weight) : null), [profile])

  function addWorkout(workout) {
    setWorkouts((prev) => [...prev, workout])
  }

  function deleteWorkout(id) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  async function registerProfile(form) {
    setRegistrationError('')

    const response = await fetch('/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullname: form.name,
        username: form.username,
        password: form.password,
        age: Number(form.age),
        sex: form.sex,
        weight: Number(form.weight),
      }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.msg || 'Registration failed. Please try again.')
    }

    setProfile({
      name: result.user.fullname,
      username: result.user.username,
      age: result.user.age,
      sex: result.user.sex,
      weight: result.user.weight,
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💪 Fitness Tracker</h1>
        <p>Log your workouts and keep an eye on your progress.</p>
      </header>

      <ProfileForm
        profile={profile}
        onSave={profile ? setProfile : registerProfile}
        onError={setRegistrationError}
      />
      {registrationError && <p className="form-error" role="alert">{registrationError}</p>}
      {profile && plan && <WorkoutPlan profile={profile} plan={plan} />}

      <StatsBar workouts={workouts} />
      <WorkoutForm onAdd={addWorkout} />
      <WorkoutList workouts={workouts} onDelete={deleteWorkout} />
    </div>
  )
}

export default App
