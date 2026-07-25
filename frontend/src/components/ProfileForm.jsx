import { useState } from 'react'

const EMPTY_FORM = { name: '', username: '', password: '', age: '', sex: 'Female', weight: '' }

export function ProfileForm({ profile, onSave, onError }) {
  const [form, setForm] = useState(profile ?? EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.age || !form.weight || (!profile && (!form.username.trim() || form.password.length < 8))) return

    const value = {
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      age: Number(form.age),
      sex: form.sex,
      weight: Number(form.weight),
    }

    try {
      setIsSubmitting(true)
      onError?.('')
      await onSave(value)
    } catch (error) {
      onError?.(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2>Your Profile</h2>
      <div className="profile-form-row">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="age"
          type="number"
          min="0"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />
      </div>
      {!profile && <div className="profile-form-row">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          minLength="8"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>}
      <div className="profile-form-row">
        <select name="sex" value={form.sex} onChange={handleChange}>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Others">Other</option>
        </select>
        <input
          name="weight"
          type="number"
          min="0"
          step="0.5"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : profile ? 'Update plan' : 'Create account and generate plan'}
      </button>
    </form>
  )
}
