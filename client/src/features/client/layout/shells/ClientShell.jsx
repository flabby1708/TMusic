function joinClassNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function ClientShell({
  header,
  children,
  fullHeight = false,
  className = '',
  contentClassName = '',
}) {
  return (
    <div
      className={joinClassNames(
        'client-cute-theme min-h-screen bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)]',
        fullHeight && 'xl:h-screen xl:overflow-hidden',
        className,
      )}
    >
      <div
        className={joinClassNames(
          'mx-auto flex min-h-[calc(100vh-1.25rem)] w-full max-w-[1920px] flex-col gap-2.5',
          fullHeight && 'xl:h-[calc(100vh-1.25rem)] xl:min-h-0',
          contentClassName,
        )}
      >
        {header}
        {children}
      </div>
    </div>
  )
}

export default ClientShell
