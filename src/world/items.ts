import * as ROT from 'rot-js';
import * as Choices from '../choices';
import { Character, PlayerSpeciesList } from './characters';

// https://nethackwiki.com/wiki/Item
type ItemType = 'comestible' | 'potion' | 'ring' | 'quest';

export interface Item {
  name: string;
  itemType: ItemType;
  onConsume?: (c: Character) => string | void;
}

export const ConsumeVerb = (item: Item) => {
  switch (item.itemType) {
    case 'potion':
      return 'quaff';
    default:
      return 'eat';
  }
};

export const LootList: Item[] = [
  // https://nethackwiki.com/wiki/Comestible
  {
    name: 'food ration',
    itemType: 'comestible',
    onConsume: (c) => {
      c.hp.update(8);
    }
  },
  {
    name: 'tin on spinach',
    itemType: 'comestible',
    onConsume: (c) => {
      c.hp.update(4);
    }
  },
  {
    name: 'egg',
    itemType: 'comestible',
    onConsume: (c) => {
      c.hp.update(1);
    }
  },
  {
    name: 'Potion of polymorph',
    itemType: 'potion',
    onConsume: (c) => {
      const newSpecies = ROT.RNG.getItem(PlayerSpeciesList) as string;
      c.species = newSpecies;
      return 'I polymorphed myself into a ' + newSpecies;
    }
  },
  // https://nethackwiki.com/wiki/Ring#Table_of_rings
  {
    name: 'ring of warning',
    itemType: 'ring'
  },
  {
    name: 'ring of conflict',
    itemType: 'ring'
  },
  {
    name: 'ring of searching',
    itemType: 'ring'
  }
];

export function ConsumeChoice(char: Character, item: Item): Choices.Choice {
  return {
    buttonText: "I'm going to " + ConsumeVerb(item) + ' this ' + item.name,
    made: (game) => {
      const onConsumeMessage = item.onConsume?.(char);
      return {
        gameState: {
          inventory: game.inventory.filter((item) => item !== item)
        },
        bluntConsumed: 0.1,
        choiceResultMessage: onConsumeMessage ?? 'yum!'
      };
    }
  };
}

export function PutOnChoice(char: Character, item: Item): Choices.Choice {
  return {
    buttonText: "I'm going to put on this " + item.name,
    made: (game) => {
      char.ringFinger = item;
      return {
        gameState: {
          inventory: game.inventory.filter((_item) => _item !== item)
        },
        bluntConsumed: 0.1,
        choiceResultMessage: 'shiny!'
      };
    }
  };
}
