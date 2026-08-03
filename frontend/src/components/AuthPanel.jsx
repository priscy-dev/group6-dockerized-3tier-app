import { useState } from 'react'

const EMPTY = { name: '', username: '', password: '', age: '', sex: 'Female', weight: '' }

export function AuthPanel({ onLogin, onRegister, error }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') await onLogin({ username: form.username.trim(), password: form.password })
      else await onRegister({ ...form, name: form.name.trim(), username: form.username.trim() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <a className="brand light" href="/">FORGE<span>.</span></a>
        <div><span className="eyebrow">Train with intention</span><h1>Progress that follows you.</h1><p>Your profile, training plan, and workout history are securely saved to your account.</p></div>
        <div className="proof-list"><span>✓ Persistent workout history</span><span>✓ Personalized five-day plan</span><span>✓ Private account access</span></div>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs" role="tablist"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Start your journey'}</h2>
        <p className="muted">{mode === 'login' ? 'Sign in to continue your training.' : 'Create your profile and first training plan.'}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        {mode === 'register' && <><label>Full name<input name="name" value={form.name} onChange={change} required /></label><div className="field-row"><label>Age<input name="age" type="number" min="1" value={form.age} onChange={change} required /></label><label>Weight (kg)<input name="weight" type="number" min="1" step="0.5" value={form.weight} onChange={change} required /></label></div><label>Sex<select name="sex" value={form.sex} onChange={change}><option>Female</option><option>Male</option><option value="Others">Other</option></select></label></>}
        <label>Username<input name="username" autoComplete="username" value={form.username} onChange={change} required /></label>
        <label>Password<input name="password" type="password" minLength="8" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={change} required /></label>
        <button className="primary-btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </main>
  )
}
