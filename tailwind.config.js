/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 'class' strategy: toggled by adding/removing 'dark' class on <html>
  darkMode: 'class',
  theme: {
    // Responsive breakpoints (mobile-first)
    screens: {
      xs: '390px',   // iPhone SE / small phones
      sm: '640px',   // larger phones / small tablets
      md: '768px',   // tablets
      lg: '1024px',  // small laptops
      xl: '1280px',  // desktops
      '2xl': '1536px', // large desktops / 4K
    },
    extend: {
      colors: {
        night: {
          950: '#0b0814',
          900: '#140f24',
          800: '#1c1530',
          ink: '#211936',
          700: '#2d2249',
          600: '#3c2f61',
        },
        magic: {
          light: '#bda6f7',
          DEFAULT: '#9274D8',
          dark: '#6e4ec0',
          glow: '#caa6ff',
        },
        spellPink: {
          light: '#fcd3ea',
          DEFAULT: '#F3A9D4',
          glow: '#ff8fd0',
          dark: '#cf6fa6',
        },
        manaMint: {
          light: '#dbf6ef',
          DEFAULT: '#B8E8DC',
          glow: '#68edd1',
          dark: '#58bfa9',
        },
        moonCream: {
          light: '#fffbf3',
          DEFAULT: '#FFF2D8',
          gold: '#fed894',
          dark: '#d6b876',
        },
        runeAmber: '#FFB347',
        cursedRed: '#FF5964',
        astralCyan: '#56E2D8',
      },
      fontFamily: {
        fantasy: ['Outfit', 'system-ui', 'sans-serif'],
        pixel: ['Outfit', 'system-ui', 'sans-serif'],
        pixelify: ['Nunito Sans', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        body: ['Nunito Sans', 'system-ui', 'sans-serif'],
      },
      // Fluid font sizes using clamp for perfect scaling at every breakpoint
      fontSize: {
        'fluid-xs':   'clamp(0.65rem,  1.5vw, 0.75rem)',
        'fluid-sm':   'clamp(0.75rem,  2vw,   0.875rem)',
        'fluid-base': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-lg':   'clamp(1rem,     3vw,   1.125rem)',
        'fluid-xl':   'clamp(1.1rem,   3.5vw, 1.25rem)',
        'fluid-2xl':  'clamp(1.25rem,  4vw,   1.5rem)',
        'fluid-3xl':  'clamp(1.5rem,   5vw,   1.875rem)',
        'fluid-4xl':  'clamp(1.875rem, 6vw,   2.25rem)',
        'fluid-5xl':  'clamp(2rem,     7vw,   3rem)',
        'fluid-6xl':  'clamp(2.5rem,   8vw,   3.75rem)',
        'fluid-hero': 'clamp(2.25rem,  9vw,   5rem)',
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      animation: {
        // Keep these as fallbacks; prefer Framer Motion for interactive animations
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float':      'float 3s infinite ease-in-out',
        'sparkle':    'sparkle 1.8s infinite ease-in-out',
        'shimmer':    'shimmer 2s infinite linear',
        'spin-slow':  'spin 12s linear infinite',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(146, 116, 216, 0.6))' },
          '50%':      { filter: 'drop-shadow(0 0 20px rgba(243, 169, 212, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.95)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'magic':    '0 0 25px rgba(146, 116, 216, 0.35)',
        'magic-lg': '0 0 40px rgba(146, 116, 216, 0.55), 0 0 80px rgba(243, 169, 212, 0.25)',
        'mana':     '0 0 20px rgba(184, 232, 220, 0.4)',
        'gold':     '0 0 25px rgba(255, 242, 216, 0.45)',
        'cursed':   '0 0 30px rgba(255, 89, 100, 0.6)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'magic':  'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-magic':      'linear-gradient(90deg, transparent 0%, rgba(202,166,255,0.15) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
