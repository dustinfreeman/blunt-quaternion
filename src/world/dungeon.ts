import * as ROT from 'rot-js';
import { Item, LootList } from '.';
import { Choice } from '../choices/ui';
import { ThreeDLevelProps } from '../thirdDimension';
import { FormCharacter } from './characters';

interface DungeonLevel {
  name: string;
  threeD?: Partial<ThreeDLevelProps>;
  characters?: FormCharacter[];
}

const gnomeMineStandard: FormCharacter[] = [
  {
    species: 'dwarf',
    level: ROT.RNG.getUniformInt(1, 3),
    relationship: 'Resident'
  },
  {
    species: 'newt',
    level: 1,
    relationship: 'Resident'
  },
  {
    // https://nethackwiki.com/wiki/Kobold#Kobold
    species: 'kobold',
    level: 1,
    relationship: 'Enemy'
  }
];

//nethackwiki.com/wiki/Mazes_of_Menace
export const MazesOfMenace: DungeonLevel[] = [
  {
    name: 'Surface Entrance',
    threeD: { ceiling: false, innerRoom: 5, outerWall: 8, probBlock: 0.1 }
  },
  {
    name: 'Gnomish Mines',
    characters: [...gnomeMineStandard]
  },
  {
    name: 'Gnomish Mines',
    characters: [
      ...gnomeMineStandard,
      // {
      //   // https://nethackwiki.com/wiki/Shopkeeper
      //   species: 'human',
      //   relationship: 'Shopkeeper',
      //   level: 12
      // },
      {
        species: 'owlbear',
        relationship: 'Enemy',
        level: 5
      }
    ]
  },
  {
    name: 'Mine Town',
    threeD: { innerRoom: 1, outerWall: 6, probBlock: 0.6 },
    characters: [
      ...gnomeMineStandard,
      {
        species: 'gnome',
        level: ROT.RNG.getUniformInt(2, 5),
        relationship: 'Resident'
      },
      {
        // https://nethackwiki.com/wiki/Gnome_(monster_class)#Gnome_lord
        name: 'Gnome Lord',
        species: 'gnome',
        level: ROT.RNG.getUniformInt(2, 4),
        relationship: 'Resident'
      },
      {
        // https://nethackwiki.com/wiki/Gnome_(monster_class)#Gnome_king
        name: 'Gnome King',
        species: 'gnome',
        level: 5,
        relationship: 'Resident',
        extraChoices: [
          {
            buttonText: 'Please, take a bottle for the road',
            made: (game) => {
              game.inventory.push(
                LootList.filter((item) => item.name === 'potion of booze')[0]
              );
              return {
                bluntConsumed: 0.15,
                //https://nethackwiki.com/wiki/Mines%27_End#The_Gnome_King.27s_Wine_Cellar
                choiceResultMessage: 'Enjoy the best from my wine cellar!'
              };
            }
          }
        ]
      }
    ]
  },
  {
    name: 'Gnomish Mines',
    characters: [
      ...gnomeMineStandard,
      {
        // https://nethackwiki.com/wiki/Minotaur
        species: 'minotaur',
        level: 15,
        relationship: 'Enemy'
      }
    ]
  },
  {
    // https://nethackwiki.com/wiki/The_Oracle#Level
    name: 'Oracle',
    threeD: { innerRoom: 2, outerWall: 3, probBlock: 0.6 },
    characters: [
      //https://nethackwiki.com/wiki/The_Oracle#Monster
      {
        name: 'The Oracle',
        species: 'human',
        relationship: 'Guide',
        level: 12,
        extraChoices: [
          {
            buttonText: 'Allow me to provide you a consultation',
            made: () => {
              return {
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
      },
      ...gnomeMineStandard
    ]
  },
  {
    // https://nethackwiki.com/wiki/Mines%27_End
    name: "Mine's End",
    threeD: { innerRoom: 3, outerWall: 8, probBlock: 0.05 },
    characters: [
      {
        // https://nethackwiki.com/wiki/Snake
        species: 'snake',
        level: ROT.RNG.getUniformInt(4, 7),
        relationship: 'Enemy'
      },
      {
        species: 'centaur',
        level: ROT.RNG.getUniformInt(6, 10),
        relationship: 'Enemy'
      },
      ...gnomeMineStandard
    ]
  },
  {
    // https://nethackwiki.com/wiki/Fort_Ludios
    name: 'Fort Ludios',
    threeD: { innerRoom: 4, outerWall: 6, probBlock: 0.5 },
    characters: [
      {
        // https://nethackwiki.com/wiki/Mastodon
        species: 'mastodon',
        relationship: 'Resident',
        level: 20
      },
      {
        // https://nethackwiki.com/wiki/Croesus
        name: 'Croesus',
        species: 'human',
        level: 20,
        relationship: 'Enemy',
        extraChoices: [
          {
            buttonText: 'This is my place, my treasure!',
            made: () => {
              return { bluntConsumed: 0.6 };
            }
          }
        ]
      },
      {
        // https://nethackwiki.com/wiki/Vampire_lord
        name: 'Vampire Lord',
        species: 'human',
        level: 12,
        relationship: 'Enemy'
      }
    ]
  }
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
    game.inventory.push(AmuletOfYendor);
    return {
      bluntConsumed: 0.1,
      choiceResultMessage:
        'Congratulations, you feel you should get out of here...'
    };
  }
};
MazesOfMenace.push({
  name: 'Sanctum',
  threeD: { innerRoom: 3, outerWall: 5, probBlock: 0.8 },
  characters: [
    {
      name: 'High Cleric of Moloch',
      species: 'human',
      level: 25,
      relationship: 'Guide',
      extraChoices: [GivingAmuletOfYendor]
    },
    {
      // https://nethackwiki.com/wiki/Vampire_lord
      name: 'Vampire',
      species: 'human',
      level: 10,
      relationship: 'Enemy'
    },
    {
      // https://nethackwiki.com/wiki/Marilith
      name: 'Marilith',
      species: 'demon',
      level: 7,
      relationship: 'Enemy'
    }
  ]
});

//Tests
MazesOfMenace.forEach((dLevel, index) => {
  if (dLevel.characters && dLevel.characters?.length < 3) {
    console.warn(
      'Dungeon Level does not have enough seeded characters: @',
      index,
      dLevel.name
    );
  }
});
