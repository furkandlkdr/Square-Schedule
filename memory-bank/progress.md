# Progress

What works
- ✅ Core schedule grid with 9 time slots × 5 days
- ✅ Multi-profile support with add/delete/rename
- ✅ Course form with name, instructor, classroom, description, retake flag
- ✅ Union-merge algorithm for handling overlapping courses
- ✅ Visual distinction for regular courses, retake courses, conflicts, and lunch breaks
- ✅ LocalStorage persistence for all data
- ✅ PNG export with html-to-image (supports oklch colors)
- ✅ Dark/light theme toggle with system preference detection
- ✅ Classroom legend feature (per-profile)
- ✅ Instructor and description display in schedule grid
- ✅ Inline profile name editing
- ✅ Responsive sidebar and main canvas layout

What's left
- JSON import/export for schedule sharing (optional)
- PDF export (optional)
- Drag-and-drop course reordering (optional)
- Keyboard shortcuts (optional)

Current status
- Fully functional v1.0 - all core features implemented
- Users can create, edit, manage multiple schedules and export as PNG
- Theme support with proper color schemes

Known issues
- None blocking

Evolution notes
- **2026-02-10**: Initial html2canvas failed with oklch colors → switched to html-to-image
- **2026-02-10**: Orange lunch color too similar to amber retake → changed to indigo
- **2026-02-10**: Added classroom legend after user request for better context in exports
- **2026-02-10**: Inline editing for profile names improves UX over modal dialogs
