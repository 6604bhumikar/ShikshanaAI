/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 👇 Rounded corners from shadcn/ui
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // 👇 Custom brand theme (clean, LMS-style)
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
		animation: {
        pulse: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#3b82f6", // 🌊 calm blue for buttons, accents
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6366f1", // soft indigo for secondary highlights
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#e0f2fe", // light blue hover background
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e2e8f0",
        input: "#f8fafc",
        ring: "#3b82f6",

        // 🎨 Optional chart colors (for analytics dashboard)
        chart: {
          1: "#2563eb",
          2: "#16a34a",
          3: "#eab308",
          4: "#dc2626",
          5: "#9333ea",
        },

        // 🧊 Custom brand extension
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdcff",
          300: "#8cc1ff",
          400: "#57a3ff",
          500: "#3b82f6", // main brand color
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },

      // ✨ Typography and spacing tweaks
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },

      boxShadow: {
        soft: "0 4px 8px rgba(0, 0, 0, 0.05)",
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
      },
	  
    },
  },
  plugins: [require("tailwindcss-animate")],
};

