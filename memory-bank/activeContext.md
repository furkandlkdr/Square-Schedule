# Active Context

Current focus
- All core features implemented and working
- Fine-tuning UI/UX based on user feedback

Recent changes
- Added dark theme support with system preference detection and toggle button
- Replaced html2canvas with html-to-image to support Tailwind v4's oklch colors
- Added instructor and description fields to course display
- Implemented profile renaming with inline editing
- Added classroom legend feature in sidebar and footer
- Changed lunch break color from orange to indigo for better distinction from retake courses
- Updated footer branding to "Made with ❤️ by Nafair"

Next steps
- Potential JSON import/export for sharing schedules
- Additional export formats if requested
- Further accessibility improvements

Active decisions
- Use html-to-image instead of html2canvas for modern CSS color support
- Theme preference stored in localStorage with system default fallback
- Profile-specific classroom legends for flexibility
- Indigo color scheme for lunch breaks to avoid confusion with amber retake courses

Important patterns
- State management kept local to SquareScheduleMaker component
- LocalStorage used for persistence of profiles, courses, theme, and classroom legends
- Union-merge algorithm for handling overlapping course time blocks

Learnings
- Tailwind v4 uses oklch colors which html2canvas can't parse
- html-to-image library handles modern CSS color functions properly
- Inline editing UX requires careful event handling (stopPropagation, blur, keydown)
