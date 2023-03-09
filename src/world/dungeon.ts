import * as ROT from 'rot-js';
import { Item } from '.';
import { Choice } from '../choices';
import { FormCharacter } from './characters';

interface DungeonLevel {
  name: string;
  characters?: FormCharacter[];
}

//nethackwiki.com/wiki/Mazes_of_Menace
export const MazesOfMenace: DungeonLevel[] = [
  { name: 'Surface Entrance' },
  {
    name: 'Gnomish Mines',
    characters: [
      {
        species: 'dwarf',
        level: ROT.RNG.getUniformInt(1, 3),
        relationship: 'Resident'
      }
    ]
  },
  {
    name: 'Gnomish Mines',
    characters: [
      {
        species: 'dwarf',
        level: ROT.RNG.getUniformInt(1, 3),
        relationship: 'Resident'
      },
      {
        // https://nethackwiki.com/wiki/Shopkeeper
        species: 'human',
        relationship: 'Shopkeeper',
        level: 12
      },
      {
        species: 'owlbear',
        relationship: 'Enemy',
        level: 5
      }
    ]
  },
  { name: 'Mine Town' },
  { name: 'Gnomish Mines' },
  { name: 'Oracle' }, // https://nethackwiki.com/wiki/The_Oracle#Level
  { name: "Mine's End" }, // https://nethackwiki.com/wiki/Mines%27_End
  { name: 'Fort Ludios' }
];

const AmuletOfYendor: Item = {
  name: 'Amulet of Yendor',
  itemType: 'quest'
};
const GivingAmuletOfYendor: Choice = {
  buttonText: 'I give you the Amulet of Yendor ',
  relevant: (char, game) => {
    const alreadyHaveAmulet =
      game.inventory.filter((item) => item.name === AmuletOfYendor.name)
        .length > 0;
    return !alreadyHaveAmulet;
  },
  made: (game) => {
    return {
      gameState: {
        ...game,
        inventory: [...game.inventory, AmuletOfYendor]
      },
      bluntConsumed: 0.1,
      choiceResultMessage:
        'Congratulations, you feel you should get out of here...'
    };
  }
};
MazesOfMenace.push({
  name: 'Sanctum',
  characters: [
    {
      name: 'High Cleric of Moloch',
      species: 'human',
      level: 25,
      relationship: 'Local Guide',
      extraChoices: [GivingAmuletOfYendor]
    }
  ]
});
