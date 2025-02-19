import tailwindcss_animate from "tailwindcss-animate";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Switzer", "sans-serif"],
        mono: ["NB Akademie Mono", "monospace"],
        dot: ["LED Dot-Matrix", "monospace"],
      },
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

        // Tokens.
        icon: {
          DEFAULT: "hsl(var(--color-icon-default))",
          light: "hsl(var(--color-icon-light))",
          subdued: "hsl(var(--color-icon-subdued))",
        },
        stroke: {
          DEFAULT: "hsl(var(--color-stroke-default))",
          active: "hsl(var(--color-stroke-active))",
        },
        text: {
          DEFAULT: "hsl(var(--color-text-default))",
          secondary: "hsl(var(--color-text-secondary))",
          inverted: "hsl(var(--color-text-inverted))",
          light: "hsl(var(--color-text-light))",
          subdued: "hsl(var(--color-text-subdued))",
          black: "hsl(var(--color-text-black))",
        },
        background: {
          DEFAULT: "hsl(var(--color-background-default))",
        },
        surface: {
          1: "hsl(var(--color-surface-1))",
          2: "hsl(var(--color-surface-2))",
          3: "hsl(var(--color-surface-3))",
        },
        orange: "hsl(var(--color-orange))",
      },
      transitionDuration: {
        DEFAULT: "300ms", // Sets the default duration to 300ms
      },
      transitionTimingFunction: {
        DEFAULT: "ease", // Optional: Sets the default easing
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        lightUpOrange: {
          "0%, 100%": {
            opacity: "0.2",
            boxShadow: "none",
            borderColor: "hsl(0, 0%, 96%)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 10px hsl(17, 73%, 50%), 0 0 20px hsl(35, 87%, 54%)",
            borderColor: "hsl(35, 87%, 54%)",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "success-tick": {
          "0%": { "stroke-dashoffset": "16px", opacity: "1" },
          "100%": { "stroke-dashoffset": "31px", opacity: "1" },
        },
        "success-circle-outline": {
          "0%": { "stroke-dashoffset": "72px", opacity: "1" },
          "100%": { "stroke-dashoffset": "0px", opacity: "1" },
        },
        "success-circle-fill": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-out": "fade-out 0.3s ease-in-out",
        "light-up-orange": "lightUpOrange 1s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "success-tick": "success-tick 450ms ease 500ms forwards",
        "success-circle-outline":
          "success-circle-outline 300ms ease-in-out 300ms forwards",
        "success-circle-fill":
          "success-circle-fill 300ms ease-out 500ms forwards",
      },
      backgroundImage: {
        "astria-gradient":
          "linear-gradient(to right, hsl(35, 87%, 54%), hsl(17, 73%, 50%))",
        "radial-dark":
          "radial-gradient(144.23% 141.13% at 50.15% 0%, hsl(0, 7%, 13%) 0%, hsl(203, 45%, 4%) 100%)",
        "button-gradient":
          "linear-gradient(to right, hsl(35, 87%, 54%), hsl(17, 73%, 50%))",
        "gradient-radial":
          "radial-gradient(144.23% 141.13% at 50.15% 0%, var(--tw-gradient-stops))",
      },
      backgroundColor: {
        body: "hsl(203deg 45% 4%)",
      },
      borderImage: {
        "astria-gradient":
          "linear-gradient(to right, hsl(35, 87%, 54%), hsl(17, 73%, 50%)) 1",
      },
      borderColor: {
        dark: "hsl(var(--border))",
      },
      lineHeight: {
        12: "3rem",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [tailwindcss_animate],
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
    },
  },
};
