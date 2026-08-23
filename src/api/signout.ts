import { API_BASE_URL } from './api'

const userIdElement = document.getElementById('userId')
const logoutButton = document.getElementById(
  'logoutButton',
) as HTMLButtonElement | null

const userId = localStorage.getItem('user_id')

if (!userId) {
  window.location.replace('/')
} else if (userIdElement) {
  userIdElement.textContent = userId
}

logoutButton?.addEventListener('click', async () => {
  logoutButton.disabled = true
  logoutButton.textContent = 'ログアウト中...'

  try {
    await fetch(`${API_BASE_URL}/signout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('signout error:', error)
  }

  localStorage.removeItem('user_id')
  window.location.replace('/')
})
