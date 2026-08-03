async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.msg || payload.message || 'Request failed. Please try again.')
    error.status = response.status
    throw error
  }
  return payload
}

export const api = {
  register: (profile) => request('/user/register', { method: 'POST', body: JSON.stringify({ fullname: profile.name, username: profile.username, password: profile.password, age: Number(profile.age), sex: profile.sex, weight: Number(profile.weight) }) }),
  login: (credentials) => request('/user/login', { method: 'POST', body: JSON.stringify(credentials) }),
  profile: () => request('/user/profile'),
  updateProfile: (profile) => request('/user/profile', { method: 'PUT', body: JSON.stringify({ fullname: profile.name, age: Number(profile.age), sex: profile.sex, weight: Number(profile.weight) }) }),
  logout: () => request('/user/logout', { method: 'POST' }),
  workouts: () => request('/api/v1/workouts'),
  addWorkout: (form) => request('/api/v1/workouts', { method: 'POST', body: JSON.stringify({ form }) }),
  deleteWorkout: (id) => request(`/api/v1/workouts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export function mapProfile(user) {
  return { name: user.fullname, username: user.username, age: user.age, sex: user.sex, weight: user.weight }
}
