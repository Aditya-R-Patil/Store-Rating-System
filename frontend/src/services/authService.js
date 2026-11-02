import api from './api.js'

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  if (!data?.token || !data?.user) {
    throw new Error('Unexpected response from the server.')
  }
  return data
}

export function saveSession({ token, user }) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
