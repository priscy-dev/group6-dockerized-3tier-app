import { useState } from 'react'

const EMPTY_FORM = { exercise: '', sets: '', reps: '', weight: '' }

export function WorkoutForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.exercise.trim()) return

    onAdd({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      exercise: form.exercise.trim(),
      sets: Number(form.sets) || 0,
      reps: Number(form.reps) || 0,
      weight: Number(form.weight) || 0,
    })
    setForm(EMPTY_FORM)
  }

  return (
    <form className="workout-form" onSubmit={handleSubmit}>
      <input
        name="exercise"
        placeholder="Exercise (e.g. Bench Press)"
        value={form.exercise}
        onChange={handleChange}
        required
      />
      <div className="workout-form-row">
        <input
          name="sets"
          type="number"
          min="0"
          placeholder="Sets"
          value={form.sets}
          onChange={handleChange}
        />
        <input
          name="reps"
          type="number"
          min="0"
          placeholder="Reps"
          value={form.reps}
          onChange={handleChange}
        />
        <input
          name="weight"
          type="number"
          min="0"
          step="0.5"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Log workout</button>
    </form>
  )
}
