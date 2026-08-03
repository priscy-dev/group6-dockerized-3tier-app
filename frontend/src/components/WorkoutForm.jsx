import { useState } from 'react'

const EMPTY_FORM = { exercise: '', sets: '', reps: '', weight: '' }

export function WorkoutForm({ onAdd, onError }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (!form.exercise.trim()) return
    try {
      setBusy(true)
      onError?.('')
      await onAdd({ exercise: form.exercise.trim(), sets: Number(form.sets) || 0, reps: Number(form.reps) || 0, weight: Number(form.weight) || 0 })
      setForm(EMPTY_FORM)
    } catch (error) {
      onError?.(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="workout-form" onSubmit={submit}>
      <input name="exercise" placeholder="Exercise (e.g. Bench Press)" value={form.exercise} onChange={change} required />
      <div className="workout-form-row">
        <input name="sets" type="number" min="0" placeholder="Sets" value={form.sets} onChange={change} />
        <input name="reps" type="number" min="0" placeholder="Reps" value={form.reps} onChange={change} />
        <input name="weight" type="number" min="0" step="0.5" placeholder="Weight (kg)" value={form.weight} onChange={change} />
      </div>
      <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Log workout'}</button>
    </form>
  )
}
