import { EmbedSnippetBuilder } from '@/components/embed/EmbedSnippetBuilder';
import { embedBuilderConfig } from '@/utils/embed-options';
import { siteConfig } from '@/config/site.config';
import { pagePath } from '@/utils/paths';

export default function EmbedDemoPage() {
  return (
    <main className="fixed inset-0 overflow-y-auto bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <a className="text-blue-600 underline" href={pagePath('/about')}>
          Back to About
        </a>
        <h1 className="text-2xl font-bold">Embed preview</h1>
        <p>
          See the map as it will appear inside another website, then copy the
          snippet.
        </p>
        <EmbedSnippetBuilder
          baseUrl={siteConfig.url}
          config={embedBuilderConfig()}
        />
      </div>
    </main>
  );
}
