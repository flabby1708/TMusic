# TMusic Agent Rules

## Validation

- Do not run `npm run build`, `npm run build -w client`, or other full production build commands by default.
- Run a full build only when the user explicitly asks for it, when preparing a release, or when changes directly affect build configuration or are likely to break the production bundle.
- For routine prompts, prefer targeted verification such as reading code, running focused checks, or explaining what was not verified.
- If a build was skipped, state that clearly in the final response instead of running it automatically.
