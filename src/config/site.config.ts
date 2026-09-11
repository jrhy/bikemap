import { activeCityId } from './map.config';
import { pagePath } from '@/utils/paths';

export const siteConfig = {
  name: 'Bike Map',
  shortName: 'Bike Map',
  description:
    'Explore cycling routes and trails, record rides, and export GPX files.',
  tagline: 'Routes, trails, and ride recording',
  url: new URL(pagePath('/'), window.location.origin).href,
  themeColor: '#2563eb',
  backgroundColor: '#ffffff',
  // Preserve existing device preferences; these keys are not visible branding.
  storageKeyPrefix: activeCityId === 'bend' ? 'ridebend' : 'bikechatt',
};
