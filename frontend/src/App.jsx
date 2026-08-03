import { useEffect, useMemo, useState } from 'react'
import { generatePlan } from './lib/generatePlan'
import { api, mapProfile } from './lib/api'
import { AuthPanel } from './components/AuthPanel'
import { ProfileForm } from './components/ProfileForm'
import { WorkoutPlan } from './components/WorkoutPlan'
import { WorkoutForm } from './components/WorkoutForm'
import { WorkoutList } from './components/WorkoutList'
import { StatsBar } from './components/StatsBar'
import './App.css'

function App() {
  const [profile, setProfile] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const plan = useMemo(() => (profile ? generatePlan(profile.weight) : null), [profile])

  async function loadAccount() {
    const [profileResult, workoutResult] = await Promise.all([api.profile(), api.workouts()])
    setProfile(mapProfile(profileResult.user))
    setWorkouts(workoutResult.data.workouts || [])
  }

  useEffect(() => {
    loadAccount().catch((requestError) => {
      if (requestError.status !== 401) setError(requestError.message)
    }).finally(() => setLoading(false))
  }, [])

  async function authenticate(action, payload) {
    setError('')
    try { await action(payload); await loadAccount() }
    catch (requestError) { setError(requestError.message); throw requestError }
  }

  async function updateProfile(form) {
    const result = await api.updateProfile(form)
    setProfile(mapProfile(result.user))
  }

  async function addWorkout(form) {
    const result = await api.addWorkout(form)
    setWorkouts(result.data.workouts || [])
  }

  async function deleteWorkout(id) {
    const result = await api.deleteWorkout(id)
    setWorkouts(result.data.workouts || [])
  }

  async function logout() {
    await api.logout()
    setProfile(null)
    setWorkouts([])
  }

  if (loading) return <div className="loading-screen"><div className="pulse-logo">F</div><p>Loading your training data…</p></div>
  if (!profile) return <AuthPanel onLogin={(data) => authenticate(api.login, data)} onRegister={(data) => authenticate(api.register, data)} error={error} />

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="/">FORGE<span>.</span></a><div className="user-nav"><span>{profile.name}</span><button onClick={logout}>Sign out</button></div></header>
      <main className="dashboard">
        <section className="hero"><div><span className="eyebrow">Your training dashboard</span><h1>Welcome back, {profile.name.split(' ')[0]}.</h1><p>Every session is saved to your account and available wherever you sign in.</p></div><div className="profile-chip"><strong>{profile.weight} kg</strong><span>Current body weight</span></div></section>
        {error && <p className="form-error" role="alert">{error}</p>}
        <StatsBar workouts={workouts} />
        <div className="dashboard-grid">
          <section className="main-column"><div className="section-heading"><div><span className="eyebrow">Training log</span><h2>Recent workouts</h2></div></div><WorkoutForm onAdd={addWorkout} onError={setError} /><WorkoutList workouts={workouts} onDelete={deleteWorkout} /></section>
          <aside className="side-column"><ProfileForm profile={profile} onSave={updateProfile} onError={setError} />{plan && <WorkoutPlan profile={profile} plan={plan} />}</aside>
        </div>
      </main>
    </div>
  )
}

export default App
