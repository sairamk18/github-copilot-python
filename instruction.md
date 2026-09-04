# GitHub Copilot Instructions

## Project context

This repository contains a Flask-based Sudoku game. The application code lives in
`starter/`, with Flask routes in `starter/app.py`, Sudoku generation and validation
logic in `starter/sudoku_logic.py`, templates in `starter/templates/`, and browser
assets in `starter/static/`.

## General development principles

- Use modern, readable, maintainable Python that follows established project
  conventions.
- Prefer small, focused functions with clear names and single responsibilities.
- Use type hints where they improve clarity, especially at module and function
  boundaries.
- Add useful comments only where they explain non-obvious reasoning or constraints;
  do not narrate straightforward code.
- Build code that is straightforward to unit test. Keep side effects at clear
  boundaries and avoid unnecessary global state.
- Follow the existing project structure unless there is a good, documented reason
  to improve it. Keep structural changes focused and avoid unrelated rewrites.
- Preserve existing functionality while implementing or extending the required
  Sudoku features.

## Flask architecture

- Keep the Flask application modular. Routes should coordinate requests and
  responses, not contain the Sudoku domain rules.
- Keep Sudoku generation, solving, validation, difficulty behavior, and related
  data transformations in `starter/sudoku_logic.py` or in focused modules within
  `starter/` when the logic grows.
- Validate request data at the application boundary and return consistent,
  meaningful HTTP status codes and JSON or user-facing error messages.
- Handle expected errors gracefully and consistently; never silently swallow
  failures or expose internal implementation details to users.
- Avoid introducing new global mutable state. If state management must change,
  explain the trade-offs and preserve behavior for existing users.

## Sudoku features

- Generated puzzles must be valid and have a unique solution.
- Keep difficulty selection, timers, hints, solution checking, immediate input
  feedback, completion messages, and score persistence consistent with the rules
  described in `README.md`.
- Keep server-side validation authoritative even when client-side checks provide
  immediate feedback.
- Ensure new endpoints and payloads are documented by clear names and predictable
  shapes.

## Frontend and accessibility

- Build responsive UI features that work well on desktop and mobile screens.
- Use semantic HTML, labels, keyboard-accessible controls, visible focus states,
  sufficient color contrast, and status feedback that is available to assistive
  technologies.
- Do not rely on color alone to communicate hints, invalid entries, or game state.
- Keep browser behavior organized in reusable functions and components, and avoid
  duplicating event-handling logic.

## Testing and change planning

- Add or update focused tests for Sudoku logic, route validation, and important UI
  behavior whenever functionality changes.
- Test valid inputs, malformed inputs, missing game state, boundary cases, and
  expected error responses.
- Before making a large architectural or structural change, explain the intended
  design, affected modules, migration considerations, and compatibility impact.
- For smaller changes, make the narrowest coherent edit, then verify that existing
  behavior and the relevant Sudoku workflows still work.
