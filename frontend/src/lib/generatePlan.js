const PLAN_TEMPLATE = [
  {
    title: 'Push (Chest, Shoulders, Triceps)',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, ratio: 0.5 },
      { name: 'Overhead Press', sets: 3, reps: 8, ratio: 0.35 },
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Triceps Dips', sets: 3, reps: 10 },
    ],
  },
  {
    title: 'Pull (Back, Biceps)',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, ratio: 1 },
      { name: 'Bent-over Row', sets: 4, reps: 8, ratio: 0.6 },
      { name: 'Pull-ups (assisted if needed)', sets: 3, reps: 8 },
      { name: 'Bicep Curl', sets: 3, reps: 12, ratio: 0.15 },
    ],
  },
  {
    title: 'Legs',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: 8, ratio: 0.75 },
      { name: 'Walking Lunges', sets: 3, reps: 12 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, ratio: 0.6 },
      { name: 'Calf Raises', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Core & Shoulders',
    exercises: [
      { name: 'Lateral Raises', sets: 3, reps: 12, ratio: 0.08 },
      { name: 'Plank', sets: 3, reps: '45 sec' },
      { name: 'Russian Twists', sets: 3, reps: 20 },
      { name: 'Mountain Climbers', sets: 3, reps: '30 sec' },
    ],
  },
  {
    title: 'Full Body & Conditioning',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: 12, ratio: 0.4 },
      { name: 'Dumbbell Swing', sets: 3, reps: 15, ratio: 0.3 },
      { name: 'Bent-over Row', sets: 3, reps: 10, ratio: 0.5 },
      { name: 'Push-ups', sets: 3, reps: 15 },
    ],
  },
]

function roundToNearest(value, step) {
  return Math.round(value / step) * step
}

export function generatePlan(bodyWeightKg) {
  return PLAN_TEMPLATE.map((day, index) => ({
    day: index + 1,
    title: day.title,
    exercises: day.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.ratio ? roundToNearest(bodyWeightKg * ex.ratio, 2.5) : null,
    })),
  }))
}
