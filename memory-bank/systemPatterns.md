# System Patterns

Architecture overview
- Frontend-only SPA using React + TypeScript, built with Vite
- Single-component architecture with all state in SquareScheduleMaker

Key components
- `SquareScheduleMaker.tsx`: monolithic component handling all logic
- `App.tsx`: minimal wrapper, just renders SquareScheduleMaker
- `main.tsx`: entry point with CSS imports

State management
- All state kept in SquareScheduleMaker via useState hooks
- No external state libraries (Redux, Zustand, etc.)
- LocalStorage sync via useEffect hooks
- Profile-based organization: each profile contains courses + classroomLegend

Data structures
```typescript
interface Course {
  id, name, instructor, classroom, description,
  dayIndex, startSlotIndex, durationSlots, isRetake
}

interface ScheduleProfile {
  id, profileName, courses[], classroomLegend?
}

// Global UI State
// - scheduleTitle: string
// - includeTitleInSquare: boolean
// - theme: 'light' | 'dark'
```

Union-merge algorithm
- Handles overlapping course time blocks
- Sorts courses by start time, merges overlapping intervals
- Creates VisualBlocks covering entire 9-slot range
- Conflicts (multiple courses in same block) displayed with warning

Export pipeline
- html-to-image library converts DOM to PNG
- canvasRef points to schedule grid container
- 2x scale for high-resolution output
- Theme-aware background color

Theme system
- CSS variables in `index.css` with `[data-theme="dark"]` overrides
- System preference detection via window.matchMedia
- User preference stored in localStorage
- `data-theme` attribute set on document.documentElement
- **Tailwind v4 Implementation**:
  - `@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` used in `index.css`.
  - Determines dark mode based on the attribute rather than system preference alone.

Critical implementation paths
- LocalStorage persistence on every profiles array change
- Theme toggle updates both state and DOM attribute
- Export clones and renders visible schedule grid
- Inline editing uses stopPropagation to prevent menu close
