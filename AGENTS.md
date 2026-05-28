# TMusic Agent Rules

## Design System

- For new UI work, use the Spotify Retoned Accent design system in `DESIGN.md`.
- Reuse tokens from `client/src/themeConfig.js` instead of reintroducing the old coral/cyan theme colors.

## Validation

- Do not run `npm run build`, `npm run build -w client`, or other full production build commands by default.
- Run a full build only when the user explicitly asks for it, when preparing a release, or when changes directly affect build configuration or are likely to break the production bundle.
- For routine prompts, prefer targeted verification such as reading code, running focused checks, or explaining what was not verified.
- If a build was skipped, state that clearly in the final response instead of running it automatically.
