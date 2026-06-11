/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// New modern palette
				primary: {
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
				},
				accent: {
					50: '#fdf2f8',
					100: '#fce7f3',
					200: '#fbcfe8',
					300: '#f9a8d4',
					400: '#f472b6',
					500: '#ec4899',
					600: '#db2777',
					700: '#be185d',
					800: '#9d174d',
					900: '#831843',
				},
				glow: {
					cyan: '#22d3ee',
					pink: '#f472b6',
					emerald: '#34d399',
				}
			},
			backgroundImage: {
				'gradient-conic': 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
				'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
			},
			animation: {
				aurora: "aurora 60s linear infinite",
				spotlight: "spotlight 2s ease .75s 1 forwards",
				'float': 'float 6s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
			},
			keyframes: {
				aurora: {
					from: {
						backgroundPosition: "50% 50%, 50% 50%",
					},
					to: {
						backgroundPosition: "350% 50%, 350% 50%",
					},
				},
				spotlight: {
					"0%": {
						opacity: 0,
						transform: "translate(-72%, -62%) scale(0.5)",
					},
					"100%": {
						opacity: 1,
						transform: "translate(-50%,-40%) scale(1)",
					},
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'glow-pulse': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: 0 },
					'100%': { transform: 'translateY(0)', opacity: 1 },
				},
				'fade-in': {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
				'text-shimmer': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' },
				},
			},
			boxShadow: {
				'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
				'glow-pink': '0 0 20px rgba(244, 114, 182, 0.3)',
				'glow-lg': '0 0 40px rgba(34, 211, 238, 0.2)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
			},
			backdropBlur: {
				'xs': '2px',
			},
		},
	},
	darkMode: "class",
	plugins: [
		require('@tailwindcss/aspect-ratio'),
		addVariablesForColors,
	],
}
