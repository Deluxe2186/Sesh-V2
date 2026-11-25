import type { Config } from 'tailwindcss';

// Builds a Tailwind colour from a CSS variable that supports opacity modifiers.
function cssVarColor(name: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue === undefined || opacityValue === '1') {
      return `var(--${name})`;
    }
    return `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;
  };
}

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      // Every colour comes from a CSS variable (so light/dark switching works).
      // The function form is required so opacity modifiers such as bg-accent/20
      // become real transparent tints. A plain 'var(--x)' string makes Tailwind
      // 3 ignore the "/20" and paint the colour fully solid, which hid text and
      // switches.
      colors: Object.fromEntries(
        [
          'background',
          'surface',
          'foreground',
          'muted',
          'muted-foreground',
          'border',
          'input',
          'ring',
          'accent',
          'accent-foreground',
          'primary',
          'primary-foreground',
          'secondary',
          'secondary-foreground',
          'destructive',
          'destructive-foreground',
          'card',
          'card-foreground',
          'popover',
          'popover-foreground',
          'live',
          'warning',
          'danger',
        ].map((name) => [name, cssVarColor(name)])
      ),
      borderRadius: {
        DEFAULT: '12px',
        card: '12px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
