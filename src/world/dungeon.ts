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

  {
    // https://nethackwiki.com/wiki/The_Oracle#Level
    name: 'Oracle',
    characters: [
      //https://nethackwiki.com/wiki/The_Oracle#Monster
      {
        name: 'The Oracle',
        species: 'human',
        relationship: 'Local Guide',
        level: 12,
        extraChoices: [
          {
            buttonText: 'Allow me to provide you a consultation',
            made: (game) => {
              return {
                gameState: game,
                bluntConsumed: 0.2,
                // https://nethackwiki.com/wiki/Source:NetHack_3.6.1/dat/oracles.txt
                choiceResultMessage:
                  ROT.RNG.getItem([
                    'Behold the cockatrice...',
                    'Though the shopkeepers be wary, thieves...'
                  ]) ?? ''
              };
            }
          }
        ]
      }
    ]
  },
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
