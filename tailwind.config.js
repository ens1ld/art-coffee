/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C5A2C", // Warm brown for primary elements
          light: "#A67C52",   // Lighter brown
          dark: "#5A4020",    // Darker brown
        },
        accent: {
          DEFAULT: "#E3A95C", // Golden accent
          light: "#F5D6A8",   // Light gold
        },
        background: {
          DEFAULT: "#FFFFFF",  // White background
          alt: "#F9F5F0",      // Cream background alternative
          card: "#FFF9F0",     // Soft cream for cards
        },
        text: {
          DEFAULT: "#333333",  // Dark gray for main text
          secondary: "#6B6B6B", // Medium gray for secondary text
          light: "#9C9C9C",     // Light gray for tertiary text
        },
        border: "#E8E0D8",     // Soft beige border
        success: "#4CAF50",    // Green for success messages
        error: "#E53935",      // Red for error messages
        warning: "#FFA726",    // Orange for warnings
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.5rem',
      },
    },
  },
  plugins: [],
} 