# Active Context

Current focus
- Stabilize `SquareScheduleMaker` UI and wire export functionality.

Recent changes
- Project scaffolded with Vite + React + TypeScript.
- `SquareScheduleMaker.tsx` present in `src/`.

Next steps
- Implement save/load (localStorage) and JSON export/import.
- Add PDF/print export via simple canvas or HTML-to-PDF flow.

Active decisions
- Keep state local within component tree; avoid heavy state libraries.
- Use simple CSS and inline SVG for high-fidelity exports.

Considerations
- Accessibility for color choices and keyboard navigation.
