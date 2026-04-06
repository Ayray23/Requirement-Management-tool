/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        remt: {
          bg: "#07111f",
          panel: "#0a1220",
          line: "rgba(143, 163, 199, 0.15)",
          muted: "#8fa3c7",
          brand: "#8b5cf6",
          cyan: "#22d3ee",
          orange: "#ff8b36"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        glow: "0 22px 80px rgba(0, 0, 0, 0.28)"
      },
      backgroundImage: {
        "remt-scene":
          "radial-gradient(circle at top, rgba(124, 58, 237, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.18), transparent 28%)",
        "remt-brand": "linear-gradient(135deg, #8b5cf6, #d946ef)",
        "remt-brand-soft": "linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(34, 211, 238, 0.14))",
        "remt-text": "linear-gradient(135deg, #faf5ff, #93c5fd 45%, #22d3ee)"
      }
    }
  },
  plugins: []
};
