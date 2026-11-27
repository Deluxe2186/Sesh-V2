## Summary

This PR resolves lint warnings and runtime issues while improving map interactions across the explore and heatmap pages.

## Changes

### New Component
- **`MapLocationControl.tsx`** — Extracted the 'My location' button with geolocation caching, error handling, and a user marker into a reusable component used by both `HeatmapMap` and `SpotMap`.

### Map Focus Coordination
- Added `focusRequest` pattern to `HeatmapPage`, `ExploreClient`, `HeatmapMap`, `SpotMap`, and `SpotDetail` to synchronize map focus between ranked spot lists and map markers. Uses an incrementing request counter to trigger fly-to animations reliably.

### Heatmap Improvements
- Replaced circle-only rendering with **marker-based rendering** in `HeatmapMap` — markers now show live skater counts with distinct selected/hover/live states
- Added hover highlighting on both circles and markers
- Fly-to zoom increased to 16 with shorter duration (0.8s) for snappier feel

### Explore Page Mobile Layout
- **Removed the map/list tab switch** on mobile — now always shows map + list stacked, matching desktop behavior
- 'Start a session' button moved to a fixed position above the list
- List items now use `<button>` with `aria-pressed` for proper selection semantics

### Accessibility
- Spot cards use `<button>` with `aria-pressed` and `focus-visible:ring-2`
- Map markers have `keyboard: true` and descriptive `title` attributes
- Legend z-index adjusted to stay above recenter control

### Lint Fixes
- Fixed exhaustive-deps warnings in `HeatmapMap` and `SpotMap` by stabilizing callbacks with refs
- All ESLint and TypeScript checks pass

## Testing
- `npm run lint` — ✅ No warnings/errors
- `npm run typecheck` — ✅ No errors
- `npm run build` — ✅ Compiles successfully
- Dev server loads without runtime errors

🤖 Generated with [Claude Code](https://claude.com/claude-code)