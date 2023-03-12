import { Choice } from '../choices/ui';
import { Meter } from '../utils';
import { Item, AttrBlock, AttrsDefault } from '.';

// https://nethackwiki.com/wiki/Role
// https://nethackwiki.com/wiki/Role_difficulty#Role_difficulty_statistics
export const Roles = [
  undefined,
  'Ranger',
  'Rogue',
  'Valkyrie',
  'Archeologist',
  'Wizard'
];
export type Role = (typeof Roles)[number];

// https://nethackwiki.com/wiki/Race
export const PlayerSpeciesList = ['human', 'dwarf', 'elf', 'gnome', 'orc'];
// https://nethackwiki.com/wiki/Pet
export const Pets = ['dog', 'cat', 'pony'];
export const Monsters = ['owlbear', 'mastodon'];
const SpeciesList = [undefined, ...PlayerSpeciesList, ...Pets, ...Monsters];
export type Species = (typeof SpeciesList)[number];

type Relationship =
  | 'Party Member'
  | 'Local Guide'
  | 'Enemy'
  | 'Resident'
  | 'Shopkeeper';

export interface Character {
  name?: string;
  species: Species;
  role: Role;
  level: number;
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

  const SpeciesCharMap = new Map<Species, string>([
    ['dog', 'd'],
    ['cat', 'f'],
    ['pony', 'u'],
    ['dwarf', 'h'],
    ['human', '@'],
    ['elf', '@'],
    ['gnome', 'G'],
    ['orc', 'o'],
    ['owlbear', 'Y']
  ]);
  const char = SpeciesCharMap.get(c.species);
  if (char) {
    return { char: char };
  }

  return { char: '?' };
}

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
    return;
  }

  char.level += xp / (xpPerLevel[lvl + 1] - xpPerLevel[lvl]);
}
