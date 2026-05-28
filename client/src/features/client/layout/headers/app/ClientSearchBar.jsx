import { useEffect, useMemo, useState } from 'react'
import { SearchIcon, SearchTrailingIcon } from '../../../../../shared/icons.jsx'

const normalizeSearchToken = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function ClientSearchBar({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  onSuggestionSelect,
  placeholder = 'Bạn muốn phát nội dung gì?',
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState(value)
  const normalizedValue = normalizeSearchToken(debouncedValue)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [value])

  const visibleSuggestions = useMemo(() => {
    if (!suggestions.length) {
      return []
    }

    if (!normalizedValue) {
      return suggestions.slice(0, 5)
    }

    return suggestions
      .filter((item) => {
        const haystack = normalizeSearchToken([item.title, item.subtitle, item.type].filter(Boolean).join(' '))
        return haystack.includes(normalizedValue)
      })
      .slice(0, 6)
  }, [normalizedValue, suggestions])
  const showDropdown = isFocused && visibleSuggestions.length > 0

  return (
    <form className="search-shell min-w-0 flex-1" onSubmit={onSubmit}>
      <SearchIcon />
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="client-search-suggestions"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="search-divider" />
      <button
        type="submit"
        className="text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
        aria-label="Tìm kiếm"
      >
        <SearchTrailingIcon />
      </button>
      {showDropdown ? (
        <div
          id="client-search-suggestions"
          className="search-suggestions-dropdown"
          role="listbox"
          aria-label="Gợi ý tìm kiếm"
        >
          {visibleSuggestions.map((item, index) => (
            <button
              key={`${item.type}-${item.title}-${index}`}
              type="button"
              className="search-suggestion-item"
              role="option"
              onMouseDown={(event) => {
                event.preventDefault()
                onSuggestionSelect?.(item)
              }}
            >
              <span className="search-suggestion-art" aria-hidden="true">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" draggable="false" />
                ) : (
                  <span>{item.title?.slice(0, 2).toUpperCase()}</span>
                )}
              </span>
              <span className="search-suggestion-copy">
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span className="search-suggestion-type">{item.type}</span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  )
}

export default ClientSearchBar
