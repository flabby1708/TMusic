function ClientAlbumHeader({ title, subtitle, actions = null }) {
  return (
    <header className="top-shell flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
          Album
        </p>
        <h1 className="truncate font-display text-[1.25rem] font-extrabold text-[color:var(--text-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-sm font-semibold text-[color:var(--text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions}
    </header>
  )
}

export default ClientAlbumHeader
