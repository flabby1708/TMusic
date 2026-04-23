import { useEffect } from 'react'
import { DownloadIcon, PlayIcon } from '../../../shared/icons.jsx'
import { appPaths } from '../../../app/routes/paths.js'

function GuestPlaybackGateModal({
  track,
  coverSrc,
  fallbackArtwork,
  canInstallApp,
  onClose,
  onInstallApp,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!track) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,12,0.8)] px-4 py-6 backdrop-blur-[12px]"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-playback-gate-title"
        className="relative w-full max-w-[1024px] overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,24,38,0.98),rgba(34,38,39,0.98))] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Dong cua so yeu cau dang nhap"
          className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xl font-semibold text-white/72 transition hover:bg-white/[0.08] hover:text-white"
          onClick={onClose}
        >
          x
        </button>

        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] md:p-8">
          <div className="relative min-h-[280px] overflow-hidden rounded-[30px] border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={track.title}
                className="h-full min-h-[280px] w-full object-cover md:min-h-[420px]"
              />
            ) : (
              <div
                className="flex h-full min-h-[280px] w-full items-end bg-[linear-gradient(135deg,#17383b_0%,#14332c_40%,#2b2d2b_100%)] p-7 md:min-h-[420px]"
                style={{ backgroundImage: fallbackArtwork || undefined }}
              >
                <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#b2c7be]">
                    Track duoc chon
                  </p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-white">
                    {track.title}
                  </p>
                  <p className="mt-2 text-sm text-white/70">{track.artist}</p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,18,0.08),rgba(5,9,18,0.42))]" />

            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/82 backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1ed760] text-[#06120a]">
                <PlayIcon />
              </span>
              Can dang nhap de phat
            </div>
          </div>

          <div className="flex flex-col justify-center px-1 py-3 md:px-3">
            <p className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#94b0a4]">
              TMusic Free
            </p>

            <h2
              id="guest-playback-gate-title"
              className="mt-4 font-display text-[2.2rem] font-extrabold leading-[1.04] tracking-[-0.05em] text-white sm:text-[3rem]"
            >
              Bat dau nghe bang tai khoan TMusic
            </h2>

            <p className="mt-5 max-w-[28rem] text-[1rem] leading-7 text-white/72">
              Dang nhap hoac tao tai khoan de phat <span className="font-semibold text-white">{track.title}</span>{' '}
              cua <span className="font-semibold text-white">{track.artist}</span>, luu playlist va tiep tuc nghe
              tren moi thiet bi.
            </p>

            <div className="mt-7 flex max-w-[320px] flex-col gap-3">
              <a
                href={appPaths.auth.register}
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#1ed760] px-6 text-base font-extrabold text-[#04110a] transition hover:bg-[#3be477]"
              >
                Dang ky mien phi
              </a>

              {canInstallApp ? (
                <button
                  type="button"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-6 text-base font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                  onClick={onInstallApp}
                >
                  <DownloadIcon />
                  Tai ung dung xuong
                </button>
              ) : (
                <a
                  href={appPaths.auth.login}
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-6 text-base font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                >
                  Dang nhap
                </a>
              )}
            </div>

            {canInstallApp ? (
              <p className="mt-6 text-sm leading-6 text-white/58">
                Ban da co tai khoan?{' '}
                <a href={appPaths.auth.login} className="font-bold text-white underline underline-offset-4">
                  Dang nhap
                </a>
              </p>
            ) : (
              <p className="mt-6 text-sm leading-6 text-white/58">
                Tinh nang cai dat ung dung se duoc kich hoat khi ban bo sung PWA cho client.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center border-t border-white/8 bg-black/10 px-6 py-4">
          <button
            type="button"
            className="text-sm font-bold text-white/62 transition hover:text-white"
            onClick={onClose}
          >
            Dong
          </button>
        </div>
      </section>
    </div>
  )
}

export default GuestPlaybackGateModal
