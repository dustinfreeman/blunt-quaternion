import * as ROT from 'rot-js';
import * as Choices from '../choices';
import * as Characters from './characters';

// https://nethackwiki.com/wiki/Item
type ItemType = 'comestible' | 'potion' | 'ring' | 'quest';

export interface Item {
  name: string;
  itemType: ItemType;
  onConsume?: (c: Characters.Character) => string | void;
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
      return Characters.consumeForNutrition(c, 8);
    }
  },
  {
    name: 'tin of spinach',
    itemType: 'comestible',
    onConsume: (c) => {
      return Characters.consumeForNutrition(c, 4);
    }
  },
  {
    name: 'egg',
    itemType: 'comestible',
    onConsume: (c) => {
      return Characters.consumeForNutrition(c, 1);
    }
  },
  // https://nethackwiki.com/wiki/Potion#Table_of_potions
  {
    name: 'potion of polymorph',
    itemType: 'potion',
    onConsume: (c) => {
      const newSpecies = ROT.RNG.getItem(
        Characters.PlayerSpeciesList
      ) as string;
      c.species = newSpecies;
      return 'I polymorphed myself into a ' + newSpecies;
    }
  },
  {
    name: 'potion of booze',
    itemType: 'potion',
    onConsume: (c) => {
      const msg = Characters.consumeForNutrition(c, 2);
      c.attributes.WIS.exercise(-0.2);
      return msg + ' I feel satiated, yet dumber';
    }
  },
  {
    name: 'potion of gain level',
    itemType: 'potion',
    onConsume: (c) => {
      const lvl = ROT.Util.clamp(
        Math.floor(c.level),
        1,
        Characters.xpPerLevel.length
      );
      const xpToAdd = Characters.xpPerLevel[lvl] + 1;
      Characters.addXP(c, xpToAdd);
      return 'I feel more experienced';
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

export function ConsumeChoice(
  char: Characters.Character,
  item: Item
): Choices.Choice {
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

export function PutOnChoice(
  char: Characters.Character,
  item: Item
): Choices.Choice {
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
