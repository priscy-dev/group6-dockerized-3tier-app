import { useEffect, useState } from 'react'

export function ProfileForm({ profile, onSave, onError }) {
  const [form, setForm] = useState(profile)
  const [busy, setBusy] = useState(false)
  useEffect(() => setForm(profile), [profile])
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    try {
      setBusy(true)
      onError?.('')
      await onSave({ ...form, name: form.name.trim(), age: Number(form.age), weight: Number(form.weight) })
    } catch (error) {
      onError?.(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <span className="eyebrow">Settings</span><h2>Your profile</h2>
      <label>Name<input name="name" value={form.name} onChange={change} required /></label>
      <div className="profile-form-row"><label>Age<input name="age" type="number" min="1" value={form.age} onChange={change} required /></label><label>Weight (kg)<input name="weight" type="number" min="1" step="0.5" value={form.weight} onChange={change} required /></label></div>
      <label>Sex<select name="sex" value={form.sex} onChange={change}><option>Female</option><option>Male</option><option value="Others">Other</option></select></label>
      <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  )
}
