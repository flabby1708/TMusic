import { useEffect, useState } from 'react'
import { loginAdminWithEmail, storeAdminSession } from '../features/admin/adminAuthClient.js'
import { useAdminSession } from '../features/admin/useAdminSession.js'
import { SpotifyIcon } from '../shared/icons.jsx'

function ShieldLockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 2.25 4.5 5.2v5.73c0 4.56 2.82 8.73 7.12 10.55l.38.16.38-.16c4.3-1.82 7.12-5.99 7.12-10.55V5.2L12 2.25Zm0 2.16 5.25 2.06v4.46c0 3.57-2.12 6.84-5.25 8.35-3.13-1.51-5.25-4.78-5.25-8.35V6.47L12 4.41Zm0 2.84a3 3 0 0 0-3 3v1.12A1.88 1.88 0 0 0 7.5 13.25v3A1.75 1.75 0 0 0 9.25 18h5.5a1.75 1.75 0 0 0 1.75-1.75v-3A1.88 1.88 0 0 0 15 11.37v-1.12a3 3 0 0 0-3-3Zm-1.5 3a1.5 1.5 0 1 1 3 0v1h-3v-1Z" />
    </svg>
  )
}

const noteToneClasses = {
  info: 'border-[color:rgba(41,212,255,0.26)] bg-[color:rgba(41,212,255,0.12)] text-[color:#dff8ff]',
  success:
    'border-[color:rgba(41,212,255,0.26)] bg-[color:rgba(41,212,255,0.12)] text-[color:#dff8ff]',
  error:
    'border-[color:rgba(255,93,122,0.28)] bg-[color:rgba(255,93,122,0.1)] text-[color:#ffd8e1]',
}

function AdminLoginPage() {
  const { isAuthenticated, loading: sessionLoading } = useAdminSession()
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('info')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      window.location.replace('/admin')
    }
  }, [isAuthenticated, sessionLoading])

  const handleChange = (fieldName, value) => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback('')

    try {
      const payload = await loginAdminWithEmail(formValues)

      storeAdminSession(payload)
      setFeedbackTone('success')
      setFeedback(payload.message || 'Đăng nhập quản trị thành công.')

      window.setTimeout(() => {
        window.location.assign('/admin')
      }, 500)
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể đăng nhập quản trị lúc này.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,212,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,107,87,0.18),transparent_36%),linear-gradient(180deg,#08111d_0%,#050912_100%)]" />
      <div className="absolute inset-y-0 right-[-16%] hidden w-[44%] rounded-full bg-[radial-gradient(circle,rgba(255,107,87,0.18),transparent_62%)] blur-3xl lg:block" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-10">
        <section className="max-w-xl">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-3 text-sm font-semibold text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
          >
            <span className="brand-badge h-11 w-11 rounded-2xl">
              <SpotifyIcon />
            </span>
            Quay lại TMusic
          </a>

          <div className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(41,212,255,0.26)] bg-[color:rgba(41,212,255,0.08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[color:#dff8ff]">
            <ShieldLockIcon />
            Cổng quản trị
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
            Khu vực quản trị riêng cho đội vận hành.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
            Trang này chỉ chấp nhận tài khoản có quyền <span className="font-bold text-white">admin</span>.
            Phiên quản trị được tách riêng khỏi đăng nhập người dùng thường và toàn bộ API quản trị
            đều yêu cầu JWT có đúng vai trò.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.04)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Phạm vi
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                Quản lý bài hát, nghệ sĩ, album, radio và bảng xếp hạng.
              </p>
            </article>
            <article className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.04)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Phân quyền
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                Backend chặn toàn bộ <code>/api/admin/*</code> bằng middleware role admin.
              </p>
            </article>
            <article className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.04)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Phiên đăng nhập
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                Local storage của admin tách riêng để không ghi đè phiên người dùng thường.
              </p>
            </article>
          </div>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[linear-gradient(180deg,rgba(16,25,40,0.95),rgba(10,16,27,0.98))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-7">
            <div className="rounded-[26px] border border-[color:rgba(255,255,255,0.06)] bg-[color:rgba(255,255,255,0.03)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                    Trung tâm điều hành TMusic
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
                    Đăng nhập quản trị
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:rgba(41,212,255,0.24)] bg-[color:rgba(41,212,255,0.08)] text-[color:#dff8ff]">
                  <ShieldLockIcon />
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-secondary)]">
                    Email quản trị
                  </span>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="admin@tmusic.local"
                    autoComplete="email"
                    required
                    className="w-full rounded-2xl border border-[color:rgba(255,255,255,0.16)] bg-[color:rgba(255,255,255,0.03)] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[color:rgba(41,212,255,0.4)] focus:bg-[color:rgba(255,255,255,0.05)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-secondary)]">
                    Mật khẩu
                  </span>
                  <input
                    type="password"
                    value={formValues.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    placeholder="Nhập mật khẩu quản trị"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-2xl border border-[color:rgba(255,255,255,0.16)] bg-[color:rgba(255,255,255,0.03)] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[color:rgba(41,212,255,0.4)] focus:bg-[color:rgba(255,255,255,0.05)]"
                  />
                </label>

                <button
                  type="submit"
                  className="primary-button mt-2 w-full justify-center py-3.5 text-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xác thực...' : 'Vào trang quản trị'}
                </button>
              </form>

              {feedback ? (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${noteToneClasses[feedbackTone]}`}
                >
                  {feedback}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/" className="secondary-button flex-1 justify-center">
                  Về trang chủ
                </a>
                <a href="/login" className="secondary-button flex-1 justify-center">
                  Cổng người dùng
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminLoginPage
