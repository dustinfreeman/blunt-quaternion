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

export interface GameState {
  party: Character[];
  graveyard: Character[];
  inventory: Item[];
  currentDungeonLevel: number;
  delveDirection: number;
  //current quaternion:
  quaternionIndex: number;
  bluntFraction: number;
  lastChoiceResult: string;
}

export const Empty = (): GameState => {
  return {
    party: [],
    graveyard: [],
    inventory: [],
    currentDungeonLevel: -1,
    delveDirection: 1,
    quaternionIndex: 0,
    bluntFraction: 0,
    lastChoiceResult: ''
  };
};

export const Begin = (): GameState => {
  const party: FormCharacter[] = [
    {
      name: 'Guide',
      role: 'Archeologist',
      level: 10,
      species: 'gnome',
      relationship: 'Guide'
    },
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
    quaternionIndex: 0,
    bluntFraction: 1,
    lastChoiceResult: ''
  };
};
