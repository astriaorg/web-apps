// import tailwindcss_animate from "tailwindcss-animate";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "hsl(var(--color-white))",
        whitest: "hsl(var(--color-whitest))",
        "semi-white": "hsl(var(--color-semi-white))",
        "grey-dark": "hsl(var(--color-grey-dark))",
        "grey-medium": "hsl(var(--color-grey-medium))",
        "grey-light": "hsl(var(--color-grey-light))",
        "grey-lighter": "hsl(var(--color-grey-lighter))",
        black: "hsl(var(--color-black))",
        red: "hsl(var(--color-red))",
        orange: "hsl(var(--color-orange))",
        "orange-soft": "hsl(var(--color-orange-soft))",
        green: "hsl(var(--color-green))",
        "blue-light": "hsl(var(--color-blue-light))",
        yellow: "hsl(var(--color-yellow))",
        status: {
          success: "hsl(var(--color-green))",
          info: "hsl(var(--color-blue-light))",
          warning: "hsl(var(--color-yellow))",
          danger: "hsl(var(--color-red))",
        },
        error: {
          lighter: "hsl(354, 66%, 91%)",
          light: "hsl(354, 70%, 87%)",
          dark: "hsl(354, 61%, 28%)",
        },
        textColor: {
          light: "#f5f5f5",
          "light-gray": "#999",
          dark: "hsl(0, 0%, 20%)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "radial-dark":
          "radial-gradient(144.23% 141.13% at 50.15% 0%, hsl(0, 7%, 13%) 0%, hsl(203, 45%, 4%) 100%)",
        "button-gradient":
          "linear-gradient(to right, hsl(35, 87%, 54%), hsl(17, 73%, 50%))",
      },
    },
  },
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
    },
  },
};
