import * as ROT from 'rot-js';

import { Choice } from '../choices/ui';
import { Meter } from '../utils';
import { Item, AttrBlock, AttrsDefault } from '.';

// https://nethackwiki.com/wiki/Role
// https://nethackwiki.com/wiki/Role_difficulty#Role_difficulty_statistics
export const Roles = ['Ranger', 'Rogue', 'Valkyrie', 'Archeologist', 'Wizard'];
const RolesList = [...Roles, undefined];
export type Role = (typeof RolesList)[number];

// https://nethackwiki.com/wiki/Race
export const PlayerSpeciesList = ['human', 'dwarf', 'elf', 'gnome', 'orc'];
// https://nethackwiki.com/wiki/Pet
export const Pets = ['dog', 'cat', 'pony'];
export const Monsters = [
  'owlbear',
  'mastodon',
  'newt',
  'kobold',
  'minotaur',
  'snake',
  'centaur'
];
export const UniqueSpecies = ['God'];
const SpeciesList = [
  // undefined,
  ...PlayerSpeciesList,
  ...Pets,
  ...Monsters,
  ...UniqueSpecies
];
export type Species = (typeof SpeciesList)[number];

type Relationship =
  | 'Party Member'
  | 'Guide'
  | 'Enemy'
  | 'Resident'
  | 'Shopkeeper';

export interface Character {
  name?: string;
  species: Species;
  role: Role;
  level: number; //fractional.
  hp: Meter;
  attributes: AttrBlock;
  relationship: Relationship;
  ringFinger: Item | undefined;
  tactics: {
    aggression: number;
    // looting: number;
  };
  extraChoices: Choice[];
}

//minimal character info required
export interface FormCharacter extends Partial<Character> {
  species: Species;
  level: number;
}

export function Display(c: Character): { char: string } {
  if (c.name === 'You') {
    return { char: '@' };
  }
  if (c.name?.includes('Vampire')) {
    return { char: 'V' };
  }

  const SpeciesCharMap = new Map<Species, string>([
    ['dog', 'd'],
    ['cat', 'f'],
    ['pony', 'u'],

    ['dwarf', 'h'],
    ['human', '@'],
    ['elf', '@'],
    ['gnome', 'G'],
    ['orc', 'o'],

    ['owlbear', 'Y'],
    ['mastodon', 'q'],
    ['newt', ':'],
    ['kobold', 'k'],
    ['minotaur', 'H'],
    ['snake', 'S'],
    ['centaur', 'C'],
    ['demon', '&']
  ]);
  const char = SpeciesCharMap.get(c.species);
  if (char) {
    return { char: char };
  }

  return { char: '?' };
}
// SpeciesList.forEach((species) => {
//   if (Display(FleshOut([{ species: species, level: 1 }])[0]).char === '?') {
//     console.warn('Missing display character for species ', species);
//   }
// });

export function FleshOut(chars: FormCharacter[]): Character[] {
  return chars.map((c) => {
    const charChoices: Choice[] = [];
    return {
      //defaults first...
      role: undefined,
      relationship: 'Party Member',
      attributes: AttrsDefault(),
      //HACK:  https://nethackwiki.com/wiki/Hit_points#Hit_points_gained_on_level_gain_and_starting_hitpoints
      hp: new Meter(c.level * 4),
      ringFinger: undefined,
      tactics: { aggression: 0.2, looting: 0.2 },
      extraChoices: charChoices,
      //then the form object...
      ...c
    };
  });
}

export const xpPerLevel = [
  0, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10000, 20000, 40000, 80000,
  160000, 320000, 640000, 1280000, 2560000, 5120000, 10000000, 20000000,
  30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000,
  100000000
];

export function consumeForNutrition(char: Character, hpGain: number) {
  let msg = '';
  if (char.hp.isFull()) {
    msg += 'I was already full.';
  }
  char.hp.update(hpGain);
  return msg;
}

export function getXP(char: Character) {
  const lvl = Math.floor(char.level);
  let xp = xpPerLevel[lvl];
  if (lvl < xpPerLevel.length - 1) {
    xp += (char.level - lvl) * (xpPerLevel[lvl + 1] - xpPerLevel[lvl]);
  }
  return xp;
}

export function addXP(char: Character, xp: number) {
  //https://nethackwiki.com/wiki/Experience_level#Experience_points_required_per_level
  const lvl = Math.floor(char.level);
  if (lvl === xpPerLevel.length - 1) {
    //already max level
    return;
  }

  const nextLevel = char.level + xp / (xpPerLevel[lvl + 1] - xpPerLevel[lvl]);
  if (Math.floor(nextLevel) !== lvl) {
    //level up!

    // https://nethackwiki.com/wiki/Hit_points#Hit_points_gained_on_level_gain_and_starting_hitpoints
    let hpMaxGain = 0;
    if (char.role) {
      if (char.role === 'Ranger') {
        hpMaxGain += ROT.RNG.getUniformInt(1, 6);
      } else {
        hpMaxGain += ROT.RNG.getUniformInt(1, 8);
      }
    }
    if (['elf', 'gnome', 'orc'].includes(char.species)) {
      hpMaxGain += 1;
    } else if (char.species === 'human') {
      hpMaxGain += ROT.RNG.getUniformInt(1, 2);
    } else if (char.species === 'dwarf') {
      hpMaxGain += ROT.RNG.getUniformInt(1, 3);
    } else {
      // https://nethackwiki.com/wiki/Hit_points#Normal_case
      hpMaxGain += ROT.RNG.getUniformInt(1, 8);
    }

    char.hp = new Meter(char.hp.max + hpMaxGain, char.hp.current + hpMaxGain);
  }

  char.level = nextLevel;
}
