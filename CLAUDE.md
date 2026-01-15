# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3-based Tarot card reading application that calculates birth cards and yearly fortune cards based on numerology. The app features admin authentication, multiple reading modes, and is configured for static deployment to GitHub Pages.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production (outputs to /docs folder for GitHub Pages)
npm run build

# Preview production build
npm run preview

# Nuxt prepare (run after dependency changes)
npm run postinstall
```

## Architecture & Key Concepts

### State Management (Pinia Store)

The application uses a single Pinia store ([stores/tarot.js](stores/tarot.js)) that manages:

- **Input states**: `ipt_birth8` (8-digit birthdate), `ipt_birth4` (4-digit month/day), `ipt_year` (4-digit year)
- **Calculation states**: `calc` and `y_calc` arrays store step-by-step calculation strings for display
- **Result state**: `result` holds the final tarot card number (0-21)
- **Reading mode**: `isReading` toggles between basic and professional reading modes
- **Tab state**: `picked` switches between birth card ('r1') and yearly fortune card ('r2')
- **Authentication**: Admin login with Base64-encoded credentials stored in cookies using js-cookie

### Calculation Logic

**Birth Card** ([stores/tarot.js:42-63](stores/tarot.js#L42-L63)):
1. Takes 8-digit birthdate (e.g., 19990101)
2. Sums all digits
3. If sum > 21, reduces by summing digits again
4. Final number maps to tarot card

**Yearly Fortune Card** ([stores/tarot.js:67-106](stores/tarot.js#L67-L106)):
1. Takes 4-digit year + 4-digit birth month/day
2. Adds year + month + day as numbers
3. Sums digits of result
4. If sum > 21, reduces further
5. Special case: sum of 22 becomes 0 (The Fool)

### Component Structure

- **[app.vue](app.vue)**: Root component with loading animation and authentication guard
- **[pages/index.vue](pages/index.vue)**: Main page that fetches tarot data and conditionally renders result components
- **[components/Tabs.vue](components/Tabs.vue)**: Radio buttons for birth/yearly card selection
- **[components/Input.vue](components/Input.vue)**: Input forms with reading mode checkbox
- **[components/ReadingBirthResult.vue](components/ReadingBirthResult.vue)**: Basic birth card reading display
- **[components/TarotProResult.vue](components/TarotProResult.vue)**: Professional birth card reading (shown when `isReading: true`)
- **[components/ReadingBirthResultYear.vue](components/ReadingBirthResultYear.vue)**: Yearly fortune card reading display
- **[components/Login.vue](components/Login.vue)**: Admin login component (blocks app when not authenticated)

### Data Structure

Tarot card data is stored in JSON files in [public/data/](public/data/):
- `birth.json`: Basic birth card readings
- `pro_birth.json`: Professional birth card readings
- `year.json`: Yearly fortune card readings
- `premium_year.json`: Premium yearly readings (not currently used)

Each card object contains:
```json
{
  "id": 0-21,
  "name": "Card name",
  "keyword": ["array", "of", "keywords"],
  "theme": ["array of themes with <strong> tags"],
  "point": ["personality points"],
  "summary": ["summary points"],
  "leading": ["guidance points"],
  "lucky_group": { "color", "number", "day" },
  "soul": { "card", "cont" }
}
```

### Styling

- **SCSS**: Global styles in [assets/scss/style.scss](assets/scss/style.scss)
- **Reset**: Auto-injected via [assets/scss/_reset.scss](assets/scss/_reset.scss) (configured in [nuxt.config.ts:41](nuxt.config.ts#L41))
- **SVG icons**: [assets/scss/_svg.scss](assets/scss/_svg.scss)
- **Tailwind CSS**: Configured but primarily uses custom SCSS

### GitHub Pages Deployment

The project is configured for GitHub Pages deployment ([nuxt.config.ts:48-54](nuxt.config.ts#L48-L54)):
- SSR disabled (`ssr: false`)
- Nitro preset: `github-pages`
- Build output: `/docs` folder
- Base URL: `/tarot/`
- Build assets dir: `assets`

After running `npm run build`, commit the `/docs` folder and configure GitHub Pages to serve from `/docs` on the main branch.

### Authentication System

Simple admin authentication using:
- Hardcoded Base64 credentials in store (admin / tarot123!)
- Cookie-based session (expires on browser close: `expires: 0`)
- Authentication check on app mount and page navigation
- Login component blocks entire app until authenticated

## Important Notes

- The app shows a 1.2s intro loader on initial mount with fade-out animation
- All user inputs are validated for numeric-only input
- Data fetching uses Nuxt's `useFetch` composable with static JSON files
- The calculation process is stored step-by-step in `calc`/`y_calc` arrays for educational display
- Component transitions use Vue's `<Transition>` with custom fade animations
