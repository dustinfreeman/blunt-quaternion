import { RNG } from 'rot-js';
import {
  Character,
  FleshOut,
  FormCharacter,
  Pets,
  PlayerSpeciesList,
  Role,
  Roles,
  Species,
  Item
} from './world';
import * as Choices from './choices';

export interface GameState {
  party: Character[];
  graveyard: Character[];
  inventory: Item[];
  currentDungeonLevel: number;
  delveDirection: number;
  elberethed: boolean;
  //current quaternion:
  quaternionIndex: number;
  bluntFraction: number;
  lastChoiceResult: string;
  followUpChoices: Choices.Choice[];
}

export const Empty = (): GameState => {
  return {
    party: [],
    graveyard: [],
    inventory: [],
    currentDungeonLevel: -1,
    delveDirection: 1,
    elberethed: false,
    quaternionIndex: 0,
    bluntFraction: 0,
    lastChoiceResult: '',
    followUpChoices: []
  };
};

const SurfaceTutorialGuide: FormCharacter = {
  name: 'Scholar of the M.o.M.',
  role: 'Archeologist',
  level: 10,
  species: 'gnome',
  relationship: 'Local Guide',
  extraChoices: [
    {
      buttonText: 'Let me tell you about your quest.',
      made: () => {
        return {
          bluntConsumed: 0.03,
          choiceResultMessage:
            'Your Quest: Delve to the bottom of the Mazes of Menace, retrieve the Amulet of Yendor, and then ascend.'
        };
      }
    }
  ]
};

export const Begin = (): GameState => {
  const party: FormCharacter[] = [
    SurfaceTutorialGuide,
    {
      // https://nethackwiki.com/wiki/Player
      name: 'You',
      role: RNG.getItem(Roles) as Role,
      level: 2,
      species: RNG.getItem(PlayerSpeciesList) as Species
    },
    {
      level: 1,
      species: RNG.getItem(Pets) as Species
    }
  ];

  return {
    party: FleshOut(party),
    graveyard: [],
    inventory: [],
    currentDungeonLevel: 0,
    delveDirection: 1,
    elberethed: false,
    quaternionIndex: 0,
    bluntFraction: 1,
    lastChoiceResult: '',
    followUpChoices: []
  };
};
