// https://nethackwiki.com/wiki/Item

import { Character } from './characters';

type ItemType = 'comestible' | 'ring' | 'potion' | 'quest';

export interface Item {
  name: string;
  itemType: ItemType;
  onEat?: (c: Character) => void;
}

export const LootList: Item[] = [
  // https://nethackwiki.com/wiki/Comestible
  {
    name: 'food ration',
    itemType: 'comestible',
    onEat: (c) => {
      c.hp.update(8);
    }
  },
  {
    name: 'tin on spinach',
    itemType: 'comestible',
    onEat: (c) => {
      c.hp.update(4);
    }
  },
  {
    name: 'egg',
    itemType: 'comestible',
    onEat: (c) => {
      c.hp.update(1);
    }
  }
];
