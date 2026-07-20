function isSameWeek(date, reference) {
  const start = new Date(reference)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return date >= start && date < end
}

export function StatsBar({ workouts }) {
  const now = new Date()
  const thisWeek = workouts.filter((w) => isSameWeek(new Date(w.date), now)).length
  const totalVolume = workouts.reduce((sum, w) => sum + w.sets * w.reps * w.weight, 0)

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{workouts.length}</span>
        <span className="stat-label">Total logged</span>
      </div>
      <div className="stat">
        <span className="stat-value">{thisWeek}</span>
        <span className="stat-label">This week</span>
      </div>
      <div className="stat">
        <span className="stat-value">{totalVolume.toLocaleString()}</span>
        <span className="stat-label">Volume (kg)</span>
      </div>
    </div>
  )
}
