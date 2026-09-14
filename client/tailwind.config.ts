import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F3EBDD",
        walnut: "#4A3526",
        lavender: "#9B87A8",
        "lavender-pale": "#E4DCE8",
        sage: "#8B9574",
        wheat: "#C7A567",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Karla", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;