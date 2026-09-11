import {
  faInfoCircle,
  faBicycle,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export interface LocalResource {
  name: string;
  description: string;
  url: string;
  icon: IconDefinition;
  colorTheme: 'blue' | 'green' | 'purple' | 'gray';
  secondaryDescription?: string;
  secondaryUrl?: string;
  secondaryLinkText?: string;
}

export const localResources: LocalResource[] = [
  {
    name: 'About This Map',
    description:
      'About This Map: Explore cycling routes and trails, record rides, and export GPX files.',
    url: '/about',
    icon: faInfoCircle,
    colorTheme: 'gray',
  },
  {
    name: 'Chattanooga City Bike Rentals',
    description:
      'Chattanooga City Bike Rentals: Find 24-7 bike rentals throughout the city.',
    url: 'https://bikechattanooga.com/',
    icon: faBicycle,
    colorTheme: 'gray',
  },
];
