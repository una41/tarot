# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 application that calculates tarot card readings based on birth dates and yearly fortunes. The app uses numerology to reduce dates to tarot card numbers (0-21) and displays corresponding card interpretations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Architecture

### State Management
- Uses Pinia store ([stores/tarot.js](stores/tarot.js)) for centralized state
- Store handles two calculation modes:
  - **Birth Card (생일카드)**: Takes 8-digit birth date (YYYYMMDD), sums digits and reduces to 0-21
  - **Year Card (해운카드)**: Takes 4-digit year + 4-digit birth date (MMDD), sums and reduces to 0-21
- Calculation logic: Sum all digits → if > 21, sum digits again → repeat until ≤ 21

### Data Structure
- Tarot card data stored in JSON files at [assets/data/](assets/data/):
  - `birth.json`: Birth card interpretations
  - `year.json`: Year card interpretations
- Data served via API endpoint [server/api/data.ts](server/api/data.ts) that reads JSON files based on `?type=` query parameter

### Component Architecture
- [pages/index.vue](pages/index.vue): Main page that fetches both datasets and conditionally renders result
- [components/TarotTabs.vue](components/TarotTabs.vue): Radio button tabs to switch between birth/year modes
- [components/TarotInput.vue](components/TarotInput.vue): Input forms for both modes (conditional rendering based on store.picked)
- [components/TarotResult.vue](components/TarotResult.vue): Displays tarot card result and calculation steps

### Styling
- Uses SCSS with global imports configured in [nuxt.config.ts](nuxt.config.ts)
- SCSS files in [assets/scss/](assets/scss/):
  - `style.scss`: Main stylesheet (imported globally in nuxt.config)
  - `_reset.scss`: Reset styles (auto-imported via `additionalData`)
  - `_variable.scss`, `_mixin.scss`, `_svg.scss`: Utilities and design tokens
- Tailwind CSS is installed but not actively used (no @tailwind directives found)

## Key Implementation Details

### Numerology Calculation
The calculation reduces any date to a number 0-21:
1. Sum all individual digits
2. If sum > 21, convert to string, sum digits again
3. Repeat until ≤ 21
4. Special case: For year cards, if final result is 22, convert to 0

### Data Flow
1. User selects mode (birth/year) via tabs → updates `store.picked`
2. User enters date(s) → stored in `store.ipt_birth8` or `store.ipt_year`/`store.ipt_birth4`
3. Form submission triggers `store.fnBirthCalc()` or `store.fnYearCalc()`
4. Result stored in `store.result`, calculation steps in `store.calc` or `store.y_calc`
5. [pages/index.vue](pages/index.vue) conditionally renders TarotResult with appropriate dataset

### API Endpoint
[server/api/data.ts](server/api/data.ts) uses Node.js `fs` module to read JSON files synchronously:
- Query param `?type=birth` → returns `birth.json`
- Query param `?type=year` → returns `year.json`
- Default is `birth` if no type specified

## Configuration Notes

- Korean language app (`lang: 'ko'` in nuxt.config)
- SSR enabled
- Devtools enabled
- Uses Nuxt 4.x with Pinia for state management
