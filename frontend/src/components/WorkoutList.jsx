function groupByDay(workouts) {
  const groups = new Map()
  for (const workout of workouts) {
    const day = new Date(workout.date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day).push(workout)
  }
  return groups
}

export function WorkoutList({ workouts, onDelete }) {
  if (workouts.length === 0) {
    return <p className="empty-state">No workouts logged yet. Add your first one above.</p>
  }

  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
  const groups = groupByDay(sorted)

  return (
    <div className="workout-list">
      {[...groups.entries()].map(([day, entries]) => (
        <div key={day} className="workout-day">
          <h3>{day}</h3>
          <ul>
            {entries.map((w) => (
              <li key={w.id} className="workout-item">
                <div className="workout-item-info">
                  <span className="exercise-name">{w.exercise}</span>
                  <span className="exercise-detail">
                    {w.sets} sets &times; {w.reps} reps
                    {w.weight > 0 ? ` @ ${w.weight} kg` : ''}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(w.id)}
                  aria-label={`Delete ${w.exercise}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
