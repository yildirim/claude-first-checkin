# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — production build into `dist/`
- `npm test` — run all tests once (Vitest, jsdom environment)
- `npx vitest run tests/feedback.test.js -t "submits trimmed"` — run a single file / test by name

## Architecture

A static page built with Vite and vanilla JavaScript (ES modules, no framework).

- `index.html` loads `src/main.js`, which mounts widgets into `#app`.
- `src/feedback.js` exports `createFeedbackWidget(container, { onSubmit })`. It builds its own DOM and takes the submit handler as a parameter, so tests can pass a mock and check the DOM without a backend. `onSubmit` may return a promise; a rejection keeps the form open and shows an error.
- There is no backend yet: `src/main.js` only logs submitted feedback to the console.
