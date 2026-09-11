import type { ReactElement } from 'react';
import EmbedMap from '@/components/embed/EmbedMap';
import React from 'react';

export default function EmbedPage(): ReactElement {
  return (
    <main className="overflow-hidden fixed inset-0 m-0 p-0">
      <EmbedMap />
    </main>
  );
}
