# Tech Context

Stack
- Vite 7.2.4 + React 19.2.0 + TypeScript 5.9.3
- Tailwind CSS 4.1.18 (with @tailwindcss/vite plugin)
- Browser runtime (client-side only)

Dev tools
- Node.js with npm/pnpm/yarn
- Vite dev server with HMR
- ESLint for code quality

Key dependencies
- `react` 19.2.0, `react-dom` 19.2.0
- `lucide-react` 0.563.0 (icons)
- `html-to-image` 1.11.11 (PNG export - supports oklch colors)
- `tailwindcss` 4.1.18, `@tailwindcss/vite` 4.1.18
- `typescript` 5.9.3, `@vitejs/plugin-react` 5.1.1

Important notes
- Tailwind v4 uses oklch colors by default
- html-to-image chosen over html2canvas for modern CSS color support
- tailwind.config.ts created for custom configuration
- `index.css` contains `@import "tailwindcss";` and custom `@variant dark` for theme support

Constraints
- Client-side only (no backend)
- LocalStorage for all persistence
- Support modern evergreen browsers (Chrome, Firefox, Safari, Edge)

Local dev commands
```bash
npm install
npm run dev
npm run build
npm run preview
```
