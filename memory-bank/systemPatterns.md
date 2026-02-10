# System Patterns

Architecture overview
- Frontend-only SPA using React + TypeScript, built with Vite.

Key components
- `SquareScheduleMaker`: main editing surface.
- `App`: application root and routing (if added later).

Design patterns
- Component-first design: small pure components, lift state when needed.
- Simple persistence: serialize editor state to JSON for localStorage and export.
- Export pipeline: render schedule to SVG/canvas then export as PNG/PDF.

Critical implementation paths
- State serialization/deserialization for reliable export/import.
- Export fidelity: ensure layout scales correctly when printing.
