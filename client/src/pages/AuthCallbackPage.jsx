import { useEffect } from 'react'
import {
  decodeSocialCallbackUser,
  storeAuthSession,
} from '../features/auth/authClient.js'

function AuthCallbackPage() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''
  const provider = params.get('provider') || ''
  const encodedUser = params.get('user') || ''
  const authError = params.get('error') || ''
  const user = decodeSocialCallbackUser(encodedUser)
  const error =
    authError || (!token || !user ? 'Không nhận được phiên đăng nhập hợp lệ từ nhà cung cấp.' : '')
  const message = error
    ? ''
    : provider
      ? `Đăng nhập bằng ${provider} thành công. Đang chuyển về trang chủ...`
      : 'Đăng nhập thành công. Đang chuyển về trang chủ...'

  useEffect(() => {
    if (error) {
      return
    }

    storeAuthSession({
      token,
      user,
    })

    const timeoutId = window.setTimeout(() => {
      window.location.replace('/')
    }, 700)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [error, token, user])

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-copy">
          <h1 className="auth-title">{error ? 'Có lỗi xảy ra' : 'Đang xử lý'}</h1>
          <p className="auth-subtitle">{error || message}</p>
        </div>

        <div className="mt-8 w-full">
          <a href="/login" className="auth-submit flex items-center justify-center">
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage
