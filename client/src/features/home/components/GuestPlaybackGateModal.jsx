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
      className="guest-gate-backdrop"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-playback-gate-title"
        className="guest-gate-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Đóng cửa sổ yêu cầu đăng nhập"
          className="guest-gate-close"
          onClick={onClose}
        >
          x
        </button>

        <div className="guest-gate-grid">
          <div className="guest-gate-art">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={track.title}
                className="guest-gate-cover"
              />
            ) : (
              <div
                className="guest-gate-fallback"
                style={{ backgroundImage: fallbackArtwork || undefined }}
              >
                <div className="guest-gate-track-card">
                  <p>
                    Track được chọn
                  </p>
                  <strong>
                    {track.title}
                  </strong>
                  <span>{track.artist}</span>
                </div>
              </div>
            )}

            <div className="guest-gate-art-overlay" />

            <div className="guest-gate-play-badge">
              <span>
                <PlayIcon />
              </span>
              Cần đăng nhập để phát
            </div>
          </div>

          <div className="guest-gate-copy">
            <p className="guest-gate-kicker">
              TMusic Free
            </p>

            <h2
              id="guest-playback-gate-title"
              className="guest-gate-title"
            >
              Bắt đầu nghe bằng tài khoản TMusic
            </h2>

            <p className="guest-gate-description">
              Đăng nhập hoặc tạo tài khoản để phát <strong>{track.title}</strong>{' '}
              của <strong>{track.artist}</strong>, lưu playlist và tiếp tục nghe
              trên mọi thiết bị.
            </p>

            <div className="guest-gate-actions">
              <a
                href={appPaths.auth.register}
                className="guest-gate-primary"
              >
                Đăng ký miễn phí
              </a>

              {canInstallApp ? (
                <button
                  type="button"
                  className="guest-gate-secondary"
                  onClick={onInstallApp}
                >
                  <DownloadIcon />
                  Tải ứng dụng xuống
                </button>
              ) : (
                <a
                  href={appPaths.auth.login}
                  className="guest-gate-secondary"
                >
                  Đăng nhập
                </a>
              )}
            </div>

            {canInstallApp ? (
              <p className="guest-gate-note">
                Bạn đã có tài khoản?{' '}
                <a href={appPaths.auth.login}>
                  Đăng nhập
                </a>
              </p>
            ) : (
              <p className="guest-gate-note">
                Tính năng cài đặt ứng dụng sẽ được kích hoạt khi bạn bổ sung PWA cho client.
              </p>
            )}
          </div>
        </div>

        <div className="guest-gate-footer">
          <button
            type="button"
            className="guest-gate-footer-button"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </section>
    </div>
  )
}

export default GuestPlaybackGateModal
