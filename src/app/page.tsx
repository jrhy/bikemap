import type { ReactElement } from 'react';
import BikeMap from '@/components/Map';
import React from 'react';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { WelcomeModal } from '@/components/WelcomeModal';
import { useUrlDeepLink } from '@/hooks/useUrlDeepLink';

export default function Home(): ReactElement {
  // On mount, check URL for shared trail/route link and auto-select
  useUrlDeepLink();

  return (
    <main className="overflow-hidden fixed inset-0 m-0 p-0">
      <BikeMap />
      <PwaInstallPrompt />
      <WelcomeModal />
    </main>
  );
}
