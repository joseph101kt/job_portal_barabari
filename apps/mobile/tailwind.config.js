// apps/mobile/tailwind.config.js
const baseConfig = require('../../packages/ui/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  // Ensure we include all paths from both the base and mobile app
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
    '../../packages/features/src/**/*.{js,jsx,ts,tsx}',
  ],
  // NativeWind specific setup
  presets: [require('nativewind/preset')],
  darkMode: 'class', 
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      // Add mobile-specific theme overrides here
    },
  },
  plugins: [
    ...(baseConfig.plugins || []),
    // Add mobile-specific plugins here
  ],
};