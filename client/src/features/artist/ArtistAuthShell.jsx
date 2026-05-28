import { useEffect, useState } from 'react'
import { SpotifyIcon } from '../../shared/icons.jsx'
import {
  loginArtistWithEmail,
  registerArtistWithEmail,
  storeArtistSession,
} from './artistAuthClient.js'
import { useArtistSession } from './useArtistSession.js'

const submitters = {
  login: loginArtistWithEmail,
  register: registerArtistWithEmail,
}

const insightCards = [
  'Phiên nghệ sĩ được tách riêng, không ghi đè lên phiên người nghe.',
  'Tài khoản mới vào hệ thống với trạng thái chờ duyệt.',
  'Quyền tải nhạc lên sẽ mở khi hồ sơ được duyệt.',
]

const buildInitialState = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = ''
    return accumulator
  }, {})

function ArtistAuthShell({
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
  const { isAuthenticated, loading: artistLoading } = useArtistSession()
  const [formValues, setFormValues] = useState(() => buildInitialState(fields))
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('info')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!artistLoading && isAuthenticated) {
      window.location.replace('/artist/dashboard')
    }
  }, [artistLoading, isAuthenticated])

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
      const submitArtistForm = submitters[mode]
      const payload = await submitArtistForm(formValues)

      storeArtistSession(payload)
      setFeedbackTone('success')
      setFeedback(successMessage || payload.message)

      window.setTimeout(() => {
        window.location.assign('/artist/dashboard')
      }, 700)
    } catch (error) {
      setFeedbackTone('error')
      setFeedback(error.message || 'Không thể xử lý yêu cầu nghệ sĩ lúc này.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
        <section className="max-w-xl">
          <a
            href="/artist"
            className="inline-flex items-center gap-3 rounded-[6px] border border-[color:var(--border-soft)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
          >
            <span className="brand-badge h-11 w-11 rounded-[8px]">
              <SpotifyIcon />
            </span>
            Trở lại cổng nghệ sĩ
          </a>

          <div className="mt-8 inline-flex rounded-full border border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] px-4 py-2 text-xs font-bold uppercase tracking-normal text-[color:var(--primary)]">
            Truy cập nghệ sĩ
          </div>

          <h1 className="mt-6 font-display text-[32px] font-bold leading-[40px] tracking-normal text-[color:var(--text-primary)]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 grid gap-3">
            {insightCards.map((item) => (
              <article
                key={item}
                className="rounded-[6px] border border-[color:var(--border-soft)] bg-white/[0.04] px-5 py-4 text-sm leading-7 text-[color:var(--text-secondary)]"
              >
                {item}
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-[color:var(--text-secondary)]">
            <a href="/" className="secondary-button">
              Cổng người nghe
            </a>
            <a href="/admin/login" className="secondary-button">
              Cổng quản trị
            </a>
          </div>
        </section>

        <section className="w-full">
          <div className="rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_8px_16px_rgba(0,0,0,0.4)] sm:p-7">
            <div className="rounded-[6px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-[color:var(--text-dim)]">
                    Không gian nghệ sĩ TMusic
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-normal text-[color:var(--text-primary)]">
                    {submitLabel}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] text-[color:var(--primary)]">
                  <SpotifyIcon />
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {fields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="mb-2 block text-sm font-bold text-[color:var(--text-secondary)]">
                      {field.label}
                    </span>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={formValues[field.name]}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        required={field.required !== false}
                        rows={4}
                        className="min-h-28 w-full rounded-[6px] border border-white/14 bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[color:var(--primary)] focus:bg-white/[0.05]"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name]}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        required={field.required !== false}
                        className="w-full rounded-[6px] border border-white/14 bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[color:var(--primary)] focus:bg-white/[0.05]"
                      />
                    )}
                  </label>
                ))}

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-[500px] bg-[color:var(--primary)] px-4 py-3.5 text-sm font-bold text-black transition hover:bg-[color:var(--primary-hover)] disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : submitLabel}
                </button>
              </form>

              {feedback ? (
                <div
                  className={`mt-4 rounded-[6px] border px-4 py-3 text-sm leading-6 ${
                    feedbackTone === 'success'
                      ? 'border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] text-[color:var(--primary)]'
                      : feedbackTone === 'error'
                        ? 'border-[color:var(--danger)] bg-[color:rgba(230,30,50,0.14)] text-white'
                        : 'border-white/10 bg-white/[0.04] text-[color:var(--text-secondary)]'
                  }`}
                >
                  {feedback}
                </div>
              ) : null}

              <div className="mt-6 text-center">
                <p className="text-sm text-[color:var(--text-secondary)]">{alternatePrompt}</p>
                <a
                  href={alternateHref}
                  className="mt-2 inline-flex text-base font-bold text-[color:var(--text-primary)] transition hover:text-[color:var(--primary-hover)]"
                >
                  {alternateAction}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ArtistAuthShell
