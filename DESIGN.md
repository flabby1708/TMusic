# Design System: Spotify Retoned Accent

Use this design system for new TMusic UI work. The source of truth for reusable tokens is `client/src/themeConfig.js`.

## Theme

- Base UI is dark: `#121212` for app background, `#1f1f1f` for elevated surfaces, and `#282828` for hover or secondary elevation.
- Primary accent is soft blue-violet: `oklch(78.5% 0.115 274.713)` with hover `oklch(72% 0.115 274.713)` and active `oklch(66% 0.115 274.713)`.
- Use the accent sparingly for active indicators, primary play/submit actions, success states, and premium highlights.
- Text colors stay in the neutral set: `#ffffff`, `#b3b3b3`, `#7c7c7c`, and `#000000` for text on accent buttons.
- Avoid decorative gradients and multi-accent palettes in UI chrome. Album art and uploaded imagery can remain visually rich.

## Typography

- Primary font: `SpotifyMixUI, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`.
- Display font: `SpotifyMixUITitle` with the same fallback stack.
- Use only regular `400` and bold `700` weights for new UI.
- Keep letter spacing normal.
- Standard roles:
  - Display: `32px / 40px / 700`
  - Heading 1: `24px / 32px / 700`
  - Heading 2: `16px / 24px / 700`
  - Body: `16px / 24px / 400`
  - Body small: `14px / 21px / 400`
  - Caption: `12px / 18px / 400`

## Components

- Primary buttons: `background: oklch(78.5% 0.115 274.713)`, black text, `48px` height, `12px 32px` padding, `border-radius: 500px`, no border.
- Secondary buttons: `rgba(255, 255, 255, 0.1)` background, white text, subtle white border, `48px` height, pill radius.
- Icon buttons: circular, `48px` by `48px`, `#1f1f1f` default background, `#282828` hover.
- Search inputs: `#1f1f1f` background, `#ffffff` text, `#b3b3b3` placeholder, `48px` height, `500px` radius, primary accent focus ring.
- Content cards: transparent by default, `12px` padding, `6px` radius, hover with `rgba(255, 255, 255, 0.1)`, no decorative shadow.
- Badges: `12px` radius, `4px 12px` padding, `12px` bold text.

## Layout

- Follow a 4px spacing grid.
- Common spacing: `8px` tight gaps, `12px` component padding, `16px` section gaps, `24px` container padding, `32px` major gaps, `48px` large desktop padding.
- Desktop sidebar width is `331px`; mobile collapses to one-column layout.
- Maintain touch targets of at least `44px`, preferably `48px`.

## Depth

- Prefer background shifts and spacing over shadows.
- Use black shadows only when needed:
  - Subtle: `0 2px 4px rgba(0, 0, 0, 0.2)`
  - Raised: `0 4px 8px rgba(0, 0, 0, 0.3)`
  - Floating: `0 8px 16px rgba(0, 0, 0, 0.4)`
  - High: `0 12px 24px rgba(0, 0, 0, 0.5)`

## Do Not

- Do not reintroduce the old coral/cyan theme for UI chrome.
- Do not use decorative gradients or grid/orb backgrounds for surfaces.
- Do not add arbitrary font weights, negative tracking, or viewport-scaled font sizes.
- Do not reduce interactive controls below `44px`.
- Do not use low-contrast text outside the established neutral palette.
