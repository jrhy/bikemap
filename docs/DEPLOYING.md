# Static deployment

The production build is a directory of static files. A web host serves those files; all application logic runs in the browser. Node.js and pnpm are needed only to build and test the app.

## GitHub Pages

For this repository the project URL is **https://jrhy.github.io/bikemap/**. The source-code URL, https://github.com/jrhy/bikemap, cannot execute the app.

1. In **Settings → Secrets and variables → Actions → Variables**, add `VITE_MAPBOX_TOKEN` with your public `pk.*` token. A repository secret with the same name also works, but this is still a browser-visible token after building.
2. Allow the site's URL in the token's Mapbox URL restrictions. The token needs public style and tile read access. See [Mapbox token documentation](https://docs.mapbox.com/accounts/guides/tokens/).
3. Optionally set repository variable `VITE_CITY_ID` to `bend`; the default is `chattanooga`. Dataset selection does not change the app's name or identity.
4. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
5. Push to `main`, or run **Deploy GitHub Pages** manually in Actions. The workflow tests, lints, builds, checks the static files, and deploys `dist/`.

The workflow stops with a clear error if the Mapbox token is missing. Changing a variable requires a new build; trigger the workflow again after setting it.

Pages configuration supplies `BASE_PATH` automatically, including `/bikemap/` for a project site or `/` for a custom domain. This follows the [Vite deployment guide](https://vite.dev/guide/static-deploy#github-pages) and [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Another static host

```sh
pnpm install --frozen-lockfile
# Set VITE_MAPBOX_TOKEN in .env.local or the build environment.
# Optional: VITE_CITY_ID=bend
pnpm build
```

Upload `dist/` to your host. If hosting under a subdirectory, set the environment variable `BASE_PATH=/your-directory/` when building. Use a leading and trailing slash. Serve over HTTPS for GPS and PWA support (localhost also works during development).

There are HTML entry files for every page. No server-side rendering, redirect service, or fallback rewrite is needed. Use directory indexes (`about/index.html` at `/about/`). The service worker, manifest, icons, local terrain, and GeoJSON URLs all stay inside the deployment base path.

`pnpm preview` is for checking a production build locally, not for production hosting. To test a subpath build locally, retain the same `BASE_PATH` when starting the preview.

## Embedding

The About page generates a snippet using the current deployment URL, including its base path. `/embed/` supports the existing query parameters and omits ride recording, onboarding, and trail layers.

The former Next.js `frame-ancestors` headers and `EMBED_ALLOWED_ORIGINS` environment variable are removed. GitHub Pages does not expose custom response-header configuration; this deployment does not enforce an app-controlled framing allowlist. A CSP meta tag cannot replace `frame-ancestors`.

If framing restrictions are required, use a static host or CDN that supports response headers. Set `Content-Security-Policy: frame-ancestors 'self'` on ordinary pages and allow the intended partner origins on the exact `/embed/` page. Keep `/embed/demo/` in the ordinary-page policy. Account for your deployment's base path.

## What remains external

- Mapbox styles, tiles, geocoding, and live terrain requests.
- OpenStreetMap trail tiles.
- Public bike-share provider feeds.

Rides never go to an application backend. They live in browser IndexedDB, with GPX export performed on-device. A new origin has separate storage, so export rides before retiring an old site.

## Data and app identity

`VITE_CITY_ID` selects a dataset at build time. To support another geography, extend `src/data/cities/`, `src/config/map.config.ts`, and `public/data/`; see [DATA.md](DATA.md). Hostname routing has been removed.

The app uses the neutral Bike Map name. To regenerate the bicycle icons, run `node scripts/generate-icons.mjs`. Geographic datasets, provider names, and required data/license attribution are retained.

Chattanooga's curated route and trail geometry is served from the repository. Regenerate it from the coordinate-bearing elevation profiles with `pnpm data:chattanooga`.

`NEXT_PUBLIC_*` variables from older deployments are no longer read. Rename `NEXT_PUBLIC_MAPBOX_TOKEN` to `VITE_MAPBOX_TOKEN` and `NEXT_PUBLIC_CITY_ID` to `VITE_CITY_ID`; `NEXT_PUBLIC_CITY_HOST_MAP` is no longer needed.
