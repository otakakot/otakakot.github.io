import { API_BASE_URL } from './api'

const togglePassword = document.getElementById('togglePassword')
const passwordInput = document.getElementById(
  'password',
) as HTMLInputElement | null
const loginForm = document.getElementById('loginForm') as HTMLFormElement | null
const submitButton = document.getElementById(
  'submitButton',
) as HTMLButtonElement | null
const formError = document.getElementById('formError')
const emailInput = document.getElementById('email') as HTMLInputElement | null

togglePassword?.addEventListener('click', () => {
  if (!passwordInput) return
  const isHidden = passwordInput.type === 'password'
  passwordInput.type = isHidden ? 'text' : 'password'
  togglePassword.setAttribute(
    'aria-label',
    isHidden ? 'パスワードを非表示' : 'パスワードを表示',
  )
})

function showError(message: string) {
  if (!formError) return
  formError.textContent = message
  formError.classList.add('visible')
}

function clearError() {
  if (!formError) return
  formError.textContent = ''
  formError.classList.remove('visible')
}

function setLoading(loading: boolean) {
  if (!submitButton) return
  submitButton.disabled = loading
  submitButton.textContent = loading ? 'ログイン中...' : 'ログイン'
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearError()

  if (!emailInput || !passwordInput) return

  const email = emailInput.value.trim()
  const password = passwordInput.value

  if (!email || !password) {
    showError('メールアドレスとパスワードを入力してください。')
    return
  }

  if (password.length < 8) {
    showError('パスワードは8文字以上で入力してください。')
    return
  }

  setLoading(true)

  try {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = (await response.json()) as { user_id?: string }
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id)
      }
      window.location.href = '/home'
      return
    }

    let message = 'ログインに失敗しました。'
    try {
      const errorData = (await response.json()) as {
        message?: string
        error?: string
      }
      message = errorData.message || errorData.error || message
    } catch {
      // JSONパース失敗時は既定メッセージを使用
    }

    if (response.status === 400) {
      showError(
        `入力内容を確認してください。${message ? `（${message}）` : ''}`,
      )
    } else if (response.status === 401) {
      showError('メールアドレスまたはパスワードが正しくありません。')
    } else {
      showError(message)
    }
  } catch (error) {
    console.error('signin error:', error)
    showError(
      'サーバーに接続できませんでした。APIが起動しているか確認してください。',
    )
  } finally {
    setLoading(false)
  }
})
