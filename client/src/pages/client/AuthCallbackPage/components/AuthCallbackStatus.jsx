function AuthCallbackStatus({ error, message }) {
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

export default AuthCallbackStatus
