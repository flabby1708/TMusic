import { resourceDefinitions, resourceKeys } from '../features/admin/adminConfig.js'
import { useAdminDashboard } from '../features/admin/useAdminDashboard.js'

function AdminDashboardPage() {
  const {
    activeResource,
    currentResource,
    editingId,
    error,
    formValues,
    handleChange,
    handleDelete,
    handleEdit,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    setActiveResource,
  } = useAdminDashboard()

  return (
    <div className="min-h-screen bg-[color:var(--bg-app)] px-3 py-3 text-[color:var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1800px] flex-col gap-3">
        <header className="top-shell flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="section-kicker">TMusic Control Room</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[color:var(--text-primary)]">
              Trang quản trị
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">
              Quản lý nội dung thực tế trên MongoDB cho bài hát, nghệ sĩ, album, radio và bảng xếp hạng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href="/" className="secondary-button">
              Về trang chủ
            </a>
          </div>
        </header>

        <div className="grid flex-1 gap-3 xl:grid-cols-[260px_minmax(0,1fr)_420px]">
          <aside className="panel-surface p-3">
            <p className="px-2 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
              Nhóm dữ liệu
            </p>
            <div className="space-y-2">
              {resourceKeys.map((resourceKey) => {
                const isActive = resourceKey === activeResource
                const config = resourceDefinitions[resourceKey]

                return (
                  <button
                    key={resourceKey}
                    type="button"
                    onClick={() => setActiveResource(resourceKey)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-[color:rgba(255,107,87,0.34)] bg-[color:rgba(255,107,87,0.12)]'
                        : 'border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.02)] hover:border-[color:rgba(83,101,126,0.34)] hover:bg-[color:rgba(255,255,255,0.04)]'
                    }`}
                  >
                    <span>
                      <span className="block font-display text-base font-bold text-[color:var(--text-primary)]">
                        {config.label}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                        {resourceKey}
                      </span>
                    </span>
                    <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-bold text-[color:var(--text-secondary)]">
                      {resourceKey === activeResource ? items.length : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="panel-surface flex min-h-[480px] flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-4 py-4 sm:px-5">
              <div>
                <p className="section-kicker">Danh sách hiện tại</p>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  {currentResource.label}
                </h2>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => void reloadActiveResource()}
              >
                Tải lại
              </button>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto p-4 sm:p-5">
              {loading ? (
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.03)] px-4 py-8 text-center text-sm text-[color:var(--text-secondary)]">
                  Đang tải dữ liệu...
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-[color:rgba(255,93,122,0.32)] bg-[color:rgba(255,93,122,0.1)] px-4 py-4 text-sm text-[color:#ffd8e1]">
                  {error}
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.03)] px-4 py-8 text-center text-sm text-[color:var(--text-secondary)]">
                  Chưa có dữ liệu trong nhóm này.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {items.map((item) => {
                    const previewImage = item[currentResource.imageField]
                    const title = item[currentResource.titleField]
                    const subtitle = item[currentResource.subtitleField]
                    const isEditing = item._id === editingId

                    return (
                      <article
                        key={item._id}
                        className={`overflow-hidden rounded-3xl border transition ${
                          isEditing
                            ? 'border-[color:rgba(41,212,255,0.34)] bg-[color:rgba(41,212,255,0.08)]'
                            : 'border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.03)]'
                        }`}
                      >
                        {previewImage ? (
                          <img src={previewImage} alt={title} className="h-40 w-full object-cover" />
                        ) : (
                          <div className="flex h-40 items-end bg-[color:rgba(83,101,126,0.26)] p-4">
                            <span className="track-pill">Không có ảnh</span>
                          </div>
                        )}

                        <div className="space-y-3 p-4">
                          <div>
                            <h3 className="font-display text-lg font-bold text-[color:var(--text-primary)]">
                              {title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                              {subtitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                            <span>ID: {item._id.slice(-6)}</span>
                            <span>Thứ tự {item.sortOrder ?? 0}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="secondary-button flex-1"
                              onClick={() => handleEdit(item)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="primary-button flex-1"
                              onClick={() => void handleDelete(item)}
                              disabled={saving}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="panel-surface p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Chỉnh sửa</p>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  {editingId ? 'Cập nhật mục đã chọn' : 'Thêm mới'}
                </h2>
              </div>
              <button type="button" className="secondary-button" onClick={handleReset}>
                Mới
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {currentResource.fields.map((field) => (
                <label key={field.name} className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-secondary)]">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>

                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.name]}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      rows={4}
                      className="min-h-28 w-full rounded-2xl border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:rgba(41,212,255,0.42)] focus:bg-[color:rgba(255,255,255,0.05)]"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.name]}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      className="w-full rounded-2xl border border-[color:var(--border-soft)] bg-[color:rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:rgba(41,212,255,0.42)] focus:bg-[color:rgba(255,255,255,0.05)]"
                    />
                  )}

                  {field.helper ? (
                    <span className="mt-2 block text-xs text-[color:var(--text-dim)]">
                      {field.helper}
                    </span>
                  ) : null}
                </label>
              ))}

              {notice ? (
                <div className="rounded-2xl border border-[color:rgba(41,212,255,0.32)] bg-[color:rgba(41,212,255,0.1)] px-4 py-3 text-sm text-[color:#dff8ff]">
                  {notice}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-[color:rgba(255,93,122,0.32)] bg-[color:rgba(255,93,122,0.1)] px-4 py-3 text-sm text-[color:#ffd8e1]">
                  {error}
                </div>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="primary-button flex-1" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" className="secondary-button flex-1" onClick={handleReset}>
                  Đặt lại
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
