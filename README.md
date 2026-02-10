# 📅 Course Program Maker

A simple, elegant web app for creating and managing weekly course schedules. Built with React + TypeScript + Vite.

![Made with ❤️ by Nafair](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20by-Nafair-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📊 **Visual Schedule Grid** - 9 time slots × 5 weekdays
- 🎨 **Multi-Profile Support** - Create and manage multiple schedules
- 🌓 **Dark/Light Theme** - Auto-detects system preference
- 📥 **PNG Export** - High-quality image export for sharing
- 💾 **Auto-Save** - All changes saved to browser localStorage
- 🏫 **Classroom Legends** - Add custom location descriptions
- ⚠️ **Conflict Detection** - Automatic overlap warnings
- 📚 **Retake Course Marking** - Visual distinction for retake courses

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

1. **Add a Course**: Fill in the form in the sidebar
   - Course name (required)
   - Instructor (optional)
   - Classroom (optional)
   - Description (optional)
   - Mark as retake course if needed

2. **Manage Profiles**: Click the profile dropdown to:
   - Switch between schedules
   - Create new schedules
   - Rename existing schedules (click the edit icon)
   - Delete schedules

3. **Add Classroom Legends**: Use the "Derslik Açıklamaları" section to define classroom codes
   - Format: `Code: Description` (one per line)
   - Example: `A101: Main Building 1st Floor`

4. **Export**: Click "PNG İndir" to download your schedule as a high-quality image

## 🔧 Customizing Time Slots

The schedule uses a predefined time slot configuration. To customize:

1. Open `src/SquareScheduleMaker.tsx`
2. Find the `TIME_SLOTS` constant (around line 18):

```typescript
const TIME_SLOTS = [
    "08:30-09:15", // Slot 0
    "09:30-10:15", // Slot 1
    "10:30-11:15", // Slot 2
    "11:30-12:15", // Slot 3
    "ÖĞLE ARASI",  // Slot 4 - Lunch break (special styling)
    "13:30-14:15", // Slot 5
    "14:30-15:15", // Slot 6
    "15:30-16:15", // Slot 7
    "16:30-17:15"  // Slot 8
];
```

3. Modify the times as needed
4. **Important**: Keep the lunch break at index 4 for proper styling, or update the lunch detection logic:

```typescript
// In the time column rendering (around line 572):
const isLunch = i === 4; // Change index if lunch position changes

// In the lunch strip overlay (around line 591):
style={{ top: `${(4 / 9) * 100}%`, ... }} // Update numerator to new lunch index
```

## 📝 Customizing Days

To change the weekdays (e.g., add Saturday):

1. Find the `DAYS` constant in `src/SquareScheduleMaker.tsx` (around line 28):

```typescript
const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
```

2. Modify as needed:

```typescript
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
```

3. Update the grid layout in the rendering section (around line 555):

```typescript
// Update grid column definition to match number of days
// Current: grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] (5 days)
// For 6 days: grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr]
```

## 🎨 Color Scheme

The app uses distinct colors for different course types:

- **Regular Courses**: Sky blue (`bg-sky-50`)
- **Retake Courses**: Amber/yellow (`bg-amber-50`)
- **Conflicts**: Red (`bg-red-50`)
- **Lunch Break**: Indigo (`bg-indigo-50`)

To customize colors, search for these class names in `src/SquareScheduleMaker.tsx`.

## 🏗️ Architecture

- **Single Component Design**: All logic in `SquareScheduleMaker.tsx`
- **LocalStorage Persistence**: Automatic saving of all data
- **Union-Merge Algorithm**: Handles overlapping course blocks intelligently
- **Modern Export**: Uses `html-to-image` library (supports Tailwind v4 oklch colors)

## 📦 Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool & dev server
- **Tailwind CSS 4.1.18** - Styling
- **Lucide React** - Icons
- **html-to-image** - PNG export

## 🐛 Known Limitations

- Client-side only (no backend)
- No drag-and-drop reordering
- No JSON import/export (yet)
- Maximum 9 time slots per day

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Tips

- Use the description field for additional course info (e.g., "Online", "Lab Session")
- Classroom legends appear in PNG exports - perfect for sharing schedules
- Dark mode respects your system preference but can be manually toggled
- Each profile saves its own classroom legend

---

**Made with ❤️ by Nafair**

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
