export function WorkoutPlan({ profile, plan }) {
  return (
    <section className="workout-plan">
      <h2>
        {profile.name}'s 5-Day Plan <span className="plan-subtitle">based on {profile.weight} kg</span>
      </h2>
      <div className="plan-days">
        {plan.map((day) => (
          <div key={day.day} className="plan-day">
            <h3>
              Day {day.day} &middot; {day.title}
            </h3>
            <ul>
              {day.exercises.map((ex) => (
                <li key={ex.name}>
                  <span className="plan-exercise-name">{ex.name}</span>
                  <span className="plan-exercise-detail">
                    {ex.sets} &times; {ex.reps}
                    {ex.weight ? ` @ ${ex.weight} kg` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
