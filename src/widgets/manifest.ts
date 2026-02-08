import { FC } from 'react';
import PoemOfTheDay from './PoemOfTheDay/PoemOfTheDay';

export interface Widget {
  id: string;
  name: string;
  component: FC;
}

export const widgetManifest: Widget[] = [
  {
    id: 'poem-of-the-day',
    name: 'Poem of the Day',
    component: PoemOfTheDay,
  },
];
