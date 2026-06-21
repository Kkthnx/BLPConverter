/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: "#0a0b0d",
          surface: "#12141a",
          panel: "#181b22",
          elevated: "#1e222b",
          border: "#2a2f3a",
          silver: "#9ca3af",
          "silver-muted": "#6b7280",
          cyan: "#00e5ff",
          "cyan-dim": "#00b8d4",
          "cyan-glow": "rgba(0, 229, 255, 0.15)",
        },
      },
      boxShadow: {
        cyan: "0 0 20px rgba(0, 229, 255, 0.25)",
        panel: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "pulse-cyan": "pulse-cyan 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-cyan": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
