# Bike Map

A static React app for exploring bike routes and trails, recording rides, and exporting GPX files. Geographic datasets for Chattanooga and Bend are included; the app uses a neutral identity independent of the dataset.

**Site:** [jrhy.github.io/bikemap](https://jrhy.github.io/bikemap/) (requires the first successful Pages deployment). The GitHub repository URL displays source code, not the running app.

## Run locally

Requires Node.js 22+ and pnpm (the version is pinned in `package.json`).

```sh
pnpm install
cp .env.example .env.local
# Add your public Mapbox token as VITE_MAPBOX_TOKEN in .env.local.
pnpm dev
```

Open http://localhost:3000. The token is public and bundled into the browser app. Use a token authorized for the deployment's URL; never use a secret Mapbox token.

## Build and publish

```sh
pnpm build
pnpm preview
```

`dist/` contains only HTML, JavaScript, CSS, icons, and data. No Node server, server functions, API routes, or database service are required in production.

For a repository path, build with `BASE_PATH=/bikemap/ pnpm build`. The GitHub Pages workflow obtains the correct path automatically. See [deployment instructions](docs/DEPLOYING.md) for Pages setup and Mapbox configuration.

## Features

- Curated cycling routes, mountain bike trails, attractions, shops, and live bike-share availability.
- Optional nationwide OpenStreetMap trails and per-city bike-network overlays.
- GPS recording with pause/resume, crash recovery, and local ride history.
- Metric distance, speed, and elevation, including the live recording HUD.
- Elevation profiles, route sharing, GPX export, and printable SVG maps.
- Installable PWA and configurable map embeds.

The map calls Mapbox, OpenStreetMap tile services, and bike-share providers directly from the browser. Terrain and precomputed elevation files are static assets. An internet connection is needed for external map services; the service worker does not provide offline tile caching.

## Storage and compatibility

Rides are stored in IndexedDB on the device. The recording schema, units, pause segment boundaries, and GPX coordinate/elevation conventions are unchanged. The old database name and preference keys remain internal compatibility details so existing local data is not silently abandoned.

Browser storage belongs to the origin: moving to GitHub Pages does not transfer rides from another hostname. Export rides as GPX before clearing storage or retiring a previous deployment.

## Architecture

- `index.html` and `src/main.tsx`: static entry point and lazy page selection.
- `src/app/`: map, About, Export, and Embed page components and shared styles.
- `src/components/`: Mapbox orchestration, sidebar, recording HUD, and elevation pane.
- `src/hooks/`: GPS recording, wake lock, URL deep links, and UI state.
- `src/config/map.config.ts`: geographic configuration selected with `VITE_CITY_ID` at build time.
- `src/config/site.config.ts`: neutral app identity and deployment-derived links.
- `src/data/cities/`: datasets, with static assets under `public/data/`.
- `src/utils/paths.ts`: deployment-aware page and asset URLs.
- `scripts/build-static.mjs`: HTML entry files for direct page loads on any static host.
- `.github/workflows/pages.yml`: tested production build and Pages deployment.

Pages `/`, `/about/`, `/export/`, `/embed/`, and `/embed/demo/` have actual HTML files, so refreshing a nested page does not depend on an SPA rewrite. `/svg/` redirects in the browser to `/export/`. Query-string route/trail links and embed options remain supported.

Choose a dataset with `VITE_CITY_ID=chattanooga` (default) or `VITE_CITY_ID=bend`. Adding datasets is described in [data documentation](docs/DATA.md). Offline data-generation scripts are tooling, not production backend services.

## Validation

```sh
pnpm test:run
pnpm lint
BASE_PATH=/bikemap/ pnpm build
BASE_PATH=/bikemap/ node scripts/verify-static.mjs
```

Tests cover recording, storage, GPX, elevation, city configuration, components, and static URL behavior. The artifact check verifies nested HTML files and asset paths without relying on a dev-server fallback.

## Attribution

This fork retains the upstream project's geographic data and source attribution. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) and [Mapbox](https://www.mapbox.com/about/maps/). The Bend bike network was inspired by [Bend Bikes](https://bendbikes.org/map/). The app icon uses Font Awesome's bicycle glyph. See [LICENSE](LICENSE) for the repository's license.
