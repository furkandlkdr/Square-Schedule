import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Force RGB color format instead of oklch to fix html2canvas compatibility
  corePlugins: {
    preflight: true,
  },
} satisfies Config
