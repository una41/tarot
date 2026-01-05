import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./components/**/*.{vue,ts,js}',
		'./pages/**/*.{vue,ts,js}',
		'./app.vue'
	],
		theme: {
		extend: {},
	},
	plugins: [],
}

export default config