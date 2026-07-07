/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EAE6DA",
        "paper-raised": "#F6F3EA",
        ink: "#1C1F1B",
        "ink-soft": "#5B5D53",
        green: "#173A2B",
        "green-deep": "#0E271C",
        "green-soft": "#2A5240",
        gold: "#D3A02C",
        "gold-bright": "#E6BC4F",
        line: "#CBC4AF",
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        body: ["'Fraunces'", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
