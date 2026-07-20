import { useState } from 'react'

const EMPTY_FORM = { name: '', age: '', sex: 'female', weight: '' }

export function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState(profile ?? EMPTY_FORM)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.age || !form.weight) return

    onSave({
      name: form.name.trim(),
      age: Number(form.age),
      sex: form.sex,
      weight: Number(form.weight),
    })
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
      <div className="profile-form-row">
        <select name="sex" value={form.sex} onChange={handleChange}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
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
      <button type="submit">
        {profile ? 'Update plan' : 'Generate my 5-day plan'}
      </button>
    </form>
  )
}
