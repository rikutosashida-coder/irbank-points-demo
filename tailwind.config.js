/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // タグカテゴリ別の色
        tag: {
          meta: '#94a3b8',      // グレー (メタタグ)
          anchor: '#3b82f6',    // ブルー (アンカータグ)
          analysis: '#10b981',  // グリーン (分析タグ)
          free: '#8b5cf6',      // パープル (自由タグ)
        },
      },
    },
  },
  plugins: [],
}
