# Active Context

Current focus
- All core features implemented and working
- Refining UI/UX based on user feedback (Dark Mode, Visuals)
- Verifying recent design changes and feature additions
- Ensuring smooth import/export flow for schedules

Recent changes
- Added dark theme support with system preference detection and toggle button
- Replaced html2canvas with html-to-image to support Tailwind v4's oklch colors
- Added instructor and description fields to course display
- Implemented profile renaming with inline editing
- Added classroom legend feature in sidebar and footer
- Changed lunch break color from orange to indigo for better distinction from retake courses
- Updated footer branding to "Made with ❤️ by Nafair"
- **2026-02-13**: Implemented comprehensive Dark Mode (Tailwind v4 selector strategy, custom UI components).
- **2026-02-13**: Added "Program Başlığı" (Schedule Title) feature with toggle for square aspect ratio.
- **2026-02-13**: Enhanced visual hierarchy (font sizes, weights) and refined Lunch/Legend colors for dark mode.
- **2026-02-13**: Disabled Lunch Break selection to prevent user error.
- **2026-02-15**: Updated page title to "Square Schedule - A Dynamic Schedule Maker", and updated the vite.config.ts for subdomain, now its working in the home directory.
- **2026-02-15**: Implemented "Export JSON" and "Import JSON" features for sharing schedules.
- **2026-02-15**: Added Toast Notification system for better user feedback on actions.
- **2026-02-15**: Added SEO meta tags, Open Graph tags, and updated README with screenshot/favicon.
- **2026-02-15**: Localized README to support both Turkish and English.
- **2026-02-15**: Localized README to support both Turkish and English.
- **2026-02-15**: Implemented dynamic page title and meta description based on user language (Client-side).
- **2026-02-15**: Updated branding with new 3D banner in README and social preview tags.

Next steps
- [x] Potential JSON import/export for sharing schedules
- Additional export formats if requested
- Additional export formats if requested
- Further accessibility improvements

Active decisions
- Use html-to-image instead of html2canvas for modern CSS color support
- Theme preference stored in localStorage with system default fallback
- Profile-specific classroom legends for flexibility
- Indigo color scheme for lunch breaks to avoid confusion with amber retake courses
- **Dark Mode Strategy**: Use CSS variable `@variant dark` + `data-theme` attribute to reliably control Tailwind v4 dark mode.
- **Aspect Ratio Control**: Allow users to toggle between a perfect square (forcing title inside) or a natural height (title on top) for exports.
- **Import Strategy**: Add imported schedule as a new profile (with suffix if needed) to avoid overwriting existing data.

Important patterns
- State management kept local to SquareScheduleMaker component
- LocalStorage used for persistence of profiles, courses, theme, and classroom legends
- Union-merge algorithm for handling overlapping course time blocks

Learnings
- Tailwind v4 uses oklch colors which html2canvas can't parse
- html-to-image library handles modern CSS color functions properly
- Inline editing UX requires careful event handling (stopPropagation, blur, keydown)
