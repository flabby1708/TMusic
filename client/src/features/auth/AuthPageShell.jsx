import { useEffect, useState } from 'react'
import { SpotifyIcon } from '../../shared/icons.jsx'
import {
  beginSocialAuth,
  loginWithEmail,
  registerWithEmail,
  requestPhoneVerificationCode,
  storeAuthSession,
  verifyPhoneVerificationCode,
} from './authClient.js'
import { useAuthSession } from './useAuthSession.js'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M8.75 2A2.75 2.75 0 0 0 6 4.75v14.5A2.75 2.75 0 0 0 8.75 22h6.5A2.75 2.75 0 0 0 18 19.25V4.75A2.75 2.75 0 0 0 15.25 2h-6.5ZM8 5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5Zm4 11.75a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.52a4.72 4.72 0 0 1-2.04 3.1l3.3 2.56c1.92-1.77 3.02-4.38 3.02-7.48 0-.7-.06-1.37-.18-2.02H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.3-2.56c-.91.61-2.08.97-3.32.97-2.55 0-4.7-1.72-5.47-4.02l-3.4 2.62A9.99 9.99 0 0 0 12 22Z"
      />
      <path
        fill="#4A90E2"
        d="M6.53 13.95A5.98 5.98 0 0 1 6.22 12c0-.68.12-1.33.31-1.95L3.13 7.43A10 10 0 0 0 2 12c0 1.62.39 3.15 1.13 4.57l3.4-2.62Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.47 0 2.78.5 3.82 1.47l2.86-2.86C16.96 2.98 14.7 2 12 2a9.99 9.99 0 0 0-8.87 5.43l3.4 2.62C7.3 7.7 9.45 5.98 12 5.98Z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.88 11.85v-8.39H7.08V12h3.04V9.36c0-3 1.8-4.66 4.54-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.5c-1.48 0-1.94.92-1.94 1.86V12h3.3l-.53 3.46h-2.77v8.39A12 12 0 0 0 24 12Z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M16.37 12.18c.02 2.27 1.99 3.03 2.01 3.04-.02.05-.31 1.07-1.03 2.12-.62.91-1.26 1.82-2.28 1.84-1 .02-1.33-.6-2.48-.6-1.15 0-1.52.58-2.46.62-1 .04-1.76-.99-2.39-1.9-1.28-1.84-2.26-5.2-.95-7.48.65-1.13 1.8-1.84 3.05-1.86.95-.02 1.85.64 2.48.64.63 0 1.8-.79 3.03-.67.52.02 1.98.21 2.92 1.59-.08.05-1.74 1.01-1.72 3.02ZM14.68 5.63c.52-.62.88-1.49.79-2.35-.75.03-1.67.5-2.2 1.11-.49.56-.92 1.45-.8 2.3.84.06 1.69-.42 2.21-1.06Z" />
    </svg>
  )
}

const socialProviders = [
  { id: 'phone', label: 'Tiếp tục bằng số điện thoại', Icon: PhoneIcon },
  { id: 'google', label: 'Tiếp tục bằng Google', Icon: GoogleIcon },
  { id: 'facebook', label: 'Tiếp tục bằng Facebook', Icon: FacebookIcon },
  { id: 'apple', label: 'Tiếp tục bằng Apple', Icon: AppleIcon },
]

const submitters = {
  login: loginWithEmail,
  register: registerWithEmail,
}

function buildInitialState(fields) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = ''
    return accumulator
  }, {})
}

function AuthPageShell({
  mode,
  title,
  subtitle,
  submitLabel,
  successMessage,
  fields,
  alternatePrompt,
  alternateAction,
  alternateHref,
}) {
  const { isAuthenticated, loading: authLoading } = useAuthSession()
  const [formValues, setFormValues] = useState(() => buildInitialState(fields))
  const [phoneValues, setPhoneValues] = useState({
    displayName: '',
    phoneNumber: '',
    code: '',
  })
  const [phoneStep, setPhoneStep] = useState('request')
  const [phonePanelOpen, setPhonePanelOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('info')
  const [submitting, setSubmitting] = useState(false)
  const [activeProvider, setActiveProvider] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.replace('/')
    }
  }, [authLoading, isAuthenticated])

  const handleChange = (fieldName, value) => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  const handlePhoneChange = (fieldName, value) => {
    setPhoneValues((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback('')

    try {
      const submitAuthForm = submitters[mode]
      const payload = await submitAuthForm(formValues)

      storeAuthSession(payload)
      setFeedbackTone('success')
      setFeedback(successMessage || payload.message)

      window.setTimeout(() => {
        window.location.assign('/')
      }, 700)
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể xử lý yêu cầu lúc này.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProviderClick = async (providerId) => {
    if (providerId === 'phone') {
      setPhonePanelOpen((current) => !current || phoneStep === 'verify')
      return
    }

    setActiveProvider(providerId)
    setFeedback('')

    try {
      await beginSocialAuth(providerId)
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể khởi động đăng nhập mạng xã hội.')
      setActiveProvider('')
    }
  }

  const handleRequestPhoneCode = async () => {
    setSubmitting(true)
    setFeedback('')
    setPhonePanelOpen(true)

    try {
      const payload = await requestPhoneVerificationCode({
        phoneNumber: phoneValues.phoneNumber,
      })

      setPhoneStep('verify')
      setPhoneValues((current) => ({
        ...current,
        phoneNumber: payload.phoneNumber || current.phoneNumber,
      }))
      setFeedbackTone(payload.devCode ? 'info' : 'success')
      setFeedback(
        payload.devCode
          ? `${payload.message} Mã dev của bạn là: ${payload.devCode}`
          : payload.message,
      )
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể gửi mã xác thực.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyPhoneCode = async () => {
    setSubmitting(true)
    setFeedback('')

    try {
      const payload = await verifyPhoneVerificationCode({
        displayName: phoneValues.displayName,
        phoneNumber: phoneValues.phoneNumber,
        code: phoneValues.code,
      })

      storeAuthSession(payload)
      setFeedbackTone('success')
      setFeedback(payload.message)

      window.setTimeout(() => {
        window.location.assign('/')
      }, 700)
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể xác minh số điện thoại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <a href="/" className="auth-mark" aria-label="TMusic home">
          <SpotifyIcon />
        </a>

        <div className="auth-copy">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name} className="auth-field-group">
              <span className="auth-label">{field.label}</span>
              <input
                type={field.type}
                value={formValues[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className="auth-input"
                required
              />
            </label>
          ))}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : submitLabel}
          </button>
        </form>

        {feedback ? <p className={`auth-note auth-note-${feedbackTone}`}>{feedback}</p> : null}

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <div className="auth-provider-list">
          {socialProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className="auth-social-button"
              onClick={() => void handleProviderClick(provider.id)}
              disabled={submitting || activeProvider === provider.id}
            >
              <provider.Icon />
              <span>
                {activeProvider === provider.id ? 'Đang chuyển hướng...' : provider.label}
              </span>
            </button>
          ))}
        </div>

        {phonePanelOpen ? (
          <div className="mt-4 w-full rounded-[1.2rem] border border-white/12 bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-[color:var(--text-primary)]">
              Xác thực bằng số điện thoại
            </p>
            <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">
              {phoneStep === 'request'
                ? 'Nhập số điện thoại để nhận mã OTP.'
                : 'Nhập mã OTP vừa nhận được để hoàn tất đăng nhập.'}
            </p>

            {mode === 'register' ? (
              <label className="auth-field-group mt-4 block">
                <span className="auth-label">Tên hiển thị</span>
                <input
                  type="text"
                  value={phoneValues.displayName}
                  onChange={(event) => handlePhoneChange('displayName', event.target.value)}
                  placeholder="Tên của bạn"
                  className="auth-input"
                />
              </label>
            ) : null}

            <label className="auth-field-group mt-4 block">
              <span className="auth-label">Số điện thoại</span>
              <input
                type="tel"
                value={phoneValues.phoneNumber}
                onChange={(event) => handlePhoneChange('phoneNumber', event.target.value)}
                placeholder="+84901234567"
                className="auth-input"
              />
            </label>

            {phoneStep === 'verify' ? (
              <label className="auth-field-group mt-4 block">
                <span className="auth-label">Mã OTP</span>
                <input
                  type="text"
                  value={phoneValues.code}
                  onChange={(event) => handlePhoneChange('code', event.target.value)}
                  placeholder="Nhập mã 6 chữ số"
                  className="auth-input"
                />
              </label>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {phoneStep === 'verify' ? (
                <>
                  <button
                    type="button"
                    className="auth-submit mt-0 sm:flex-1"
                    onClick={() => void handleVerifyPhoneCode()}
                    disabled={submitting}
                  >
                    {submitting ? 'Đang xác minh...' : 'Xác nhận mã'}
                  </button>
                  <button
                    type="button"
                    className="auth-social-button sm:flex-1"
                    onClick={() => void handleRequestPhoneCode()}
                    disabled={submitting}
                  >
                    Gửi lại mã
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="auth-submit mt-0"
                  onClick={() => void handleRequestPhoneCode()}
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi mã...' : 'Gửi mã OTP'}
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="auth-alternate">
          <p>{alternatePrompt}</p>
          <a href={alternateHref}>{alternateAction}</a>
        </div>

        <p className="auth-legal">
          Trang web này được bảo vệ bằng reCAPTCHA và tuân theo{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            Chính sách quyền riêng tư
          </a>{' '}
          cũng như{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
            Điều khoản dịch vụ
          </a>{' '}
          của Google.
        </p>
      </div>
    </div>
  )
}

export default AuthPageShell
