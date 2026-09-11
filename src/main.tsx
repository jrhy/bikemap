import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './app/globals.css';
import './app/map.css';
import { appPath, pagePath, routeForPath } from './utils/paths';

const Home = lazy(() => import('./app/page'));
const About = lazy(() => import('./app/about/page'));
const Export = lazy(() => import('./app/export/page'));
const Embed = lazy(() => import('./app/embed/page'));
const EmbedDemo = lazy(() => import('./app/embed/demo/page'));
const route = routeForPath(window.location.pathname);
const pages = {
  '/': Home,
  '/about': About,
  '/export': Export,
  '/embed': Embed,
  '/embed/demo': EmbedDemo,
};
const Page = pages[route as keyof typeof pages];
const titles: Record<string, string> = {
  '/about': 'About',
  '/export': 'Export',
  '/embed/demo': 'Embed preview',
};
document.title = titles[route] ? `${titles[route]} — Bike Map` : 'Bike Map';

if (route === '/svg') {
  window.location.replace(`${pagePath('/export')}${window.location.search}`);
} else {
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing application root');
  createRoot(root).render(
    <StrictMode>
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
            Loading…
          </div>
        }
      >
        {Page ? (
          <Page />
        ) : (
          <main className="p-8">
            <h1 className="text-xl font-bold">Page not found</h1>
            <a className="text-blue-600 underline" href={pagePath('/')}>
              Back to map
            </a>
          </main>
        )}
      </Suspense>
    </StrictMode>,
  );
}

if (
  import.meta.env.PROD &&
  'serviceWorker' in navigator &&
  window.self === window.top
) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(appPath('sw.js'), { scope: import.meta.env.BASE_URL })
      .catch((error) => {
        console.warn('Service worker registration failed', error);
      });
  });
}
