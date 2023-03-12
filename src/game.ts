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
import { Meter } from './utils';

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
  relationship: 'Guide',
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
  const You: FormCharacter = {
    // https://nethackwiki.com/wiki/Player
    name: 'You',
    role: RNG.getItem(Roles) as Role,
    level: 1,
    species: RNG.getItem(PlayerSpeciesList) as Species
  };
  // https://nethackwiki.com/wiki/Hit_points#Hit_points_gained_on_level_gain_and_starting_hitpoints
  You.hp = new Meter(
    new Map<Role, number>([
      ['Archeologist', 11],
      ['Ranger', 13],
      ['Rogue', 10],
      ['Wizard', 10],
      ['Valkyrie', 14]
    ]).get(You.role)!
  );

  const Pet: FormCharacter = {
    level: 1,
    species: RNG.getItem(Pets) as Species
  };
  const YourGod: FormCharacter = {
    // https://nethackwiki.com/wiki/God
    name: new Map<Role, string>([
      ['Archeologist', 'Camaxtli'],
      ['Ranger', 'Venus'],
      ['Valkyrie', 'Odin'],
      ['Wizard', 'Thoth'],
      ['Rogue', 'Mog']
    ]).get(You.role),
    species: 'God',
    level: 1000000,
    relationship: 'Guide',
    extraChoices: [
      {
        buttonText: 'Go my child',
        made: () => {
          return {
            choiceResultMessage: 'You must retrieve the Amulet',
            bluntConsumed: 0.01
          };
        }
      }
    ]
  };

  const party: FormCharacter[] = [SurfaceTutorialGuide, You, Pet, YourGod];

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
