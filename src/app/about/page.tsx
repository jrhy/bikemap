import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { mapConfig } from '@/config/map.config';
import { pagePath } from '@/utils/paths';
import { EmbedSnippetBuilder } from '@/components/embed/EmbedSnippetBuilder';
import { embedBuilderConfig } from '@/utils/embed-options';

export default function AboutPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-50 text-gray-800">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-5 py-4">
          <a
            href={pagePath('/')}
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to map
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-10 px-5 py-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold">About Bike Map</h1>
          <p>
            Explore cycling routes, mountain bike trails, and local resources.
            The current dataset covers {mapConfig.region.displayName},{' '}
            {mapConfig.region.stateName}, with an optional nationwide trails
            layer.
          </p>
          <p>
            Record rides on your device and export them as GPX. Ride history
            stays in this browser; there is no account or cloud sync. Export
            rides before clearing browser data or moving to another site
            address.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Print and export</h2>
          <a
            href={pagePath('/export')}
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Printer className="h-5 w-5" /> Download a map or route files
          </a>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Embed this map</h2>
          <p>
            Choose a route and visible layers, then copy the snippet into your
            website.
          </p>
          <EmbedSnippetBuilder
            baseUrl={siteConfig.url}
            config={embedBuilderConfig()}
          />
        </section>
        <section className="space-y-3 pb-8">
          <h2 className="text-xl font-semibold">Source and data credits</h2>
          <p>
            Map data ©{' '}
            <a
              className="text-blue-600 underline"
              href="https://www.openstreetmap.org/copyright"
            >
              OpenStreetMap contributors
            </a>{' '}
            and{' '}
            <a
              className="text-blue-600 underline"
              href="https://www.mapbox.com/about/maps/"
            >
              Mapbox
            </a>
            . Curated routes and trails retain their original source
            attribution. The Bend bike network was inspired by the{' '}
            <a
              className="text-blue-600 underline"
              href="https://bendbikes.org/map/"
            >
              Bend Bikes map
            </a>
            .
          </p>
          <a
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            href="https://github.com/jrhy/bikemap"
          >
            <ExternalLink className="h-4 w-4" /> Source, feedback, and license
          </a>
        </section>
      </main>
    </div>
  );
}
