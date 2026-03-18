import axios from 'axios'

const API = 'http://localhost:3000/api'

export const login = (email, password) => {
  return axios.post(`${API}/login`, { email, password })
}

// Google Login (Redirect ไป backend)
export const googleLogin = () => {
  window.location.href = `${API}/auth/google`
}