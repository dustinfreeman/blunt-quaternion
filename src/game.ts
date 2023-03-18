import { RNG } from 'rot-js';
import * as World from './world';
import * as Choices from './choices';
import { Meter } from './utils';

interface DelveSimulation {
  lootMultiplier: number;
  combatMultiplier: number;
  elberethed: boolean;
}
export const DelveSimulationDefaults = (): DelveSimulation => {
  return { lootMultiplier: 1, combatMultiplier: 1, elberethed: false };
};

export interface GameState {
  party: World.Character[];
  graveyard: World.Character[];
  inventory: World.Item[];
  currentDungeonLevel: number;
  delveDirection: number;
  delveSimulation: DelveSimulation;
  //current quaternion:
  quaternionIndex: number;
  bluntFraction: number;
  choiceMade: boolean;
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
    delveSimulation: DelveSimulationDefaults(),
    quaternionIndex: 0,
    bluntFraction: 0,
    choiceMade: false,
    lastChoiceResult: '',
    followUpChoices: []
  };
};

const SurfaceTutorialGuide: World.FormCharacter = {
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
  const You: World.FormCharacter = {
    // https://nethackwiki.com/wiki/Player
    name: 'You',
    role: RNG.getItem(World.Roles) as World.Role,
    level: 1,
    species: RNG.getItem(World.PlayerSpeciesList) as World.Species
  };
  // https://nethackwiki.com/wiki/Hit_points#Hit_points_gained_on_level_gain_and_starting_hitpoints
  You.hp = new Meter(
    new Map<World.Role, number>([
      ['Archeologist', 11],
      ['Ranger', 13],
      ['Rogue', 10],
      ['Wizard', 10],
      ['Valkyrie', 14]
    ]).get(You.role)!
  );

  const Pet: World.FormCharacter = {
    level: 1,
    species: RNG.getItem(World.Pets) as World.Species
  };
  const YourGod: World.FormCharacter = {
    // https://nethackwiki.com/wiki/God
    name: new Map<World.Role, string>([
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

  const party: World.FormCharacter[] = [
    SurfaceTutorialGuide,
    You,
    Pet,
    YourGod
  ];

  return {
    party: World.FleshOut(party),
    graveyard: [],
    inventory: [],
    currentDungeonLevel: 0,
    delveDirection: 1,
    delveSimulation: DelveSimulationDefaults(),
    quaternionIndex: 0,
    bluntFraction: 1,
    choiceMade: false,
    lastChoiceResult: '',
    followUpChoices: []
  };
};
