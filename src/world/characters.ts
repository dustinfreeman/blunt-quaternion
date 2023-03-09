import * as ROT from 'rot-js';
import { Choice } from '../choices';

// https://nethackwiki.com/wiki/Role
// https://nethackwiki.com/wiki/Role_difficulty#Role_difficulty_statistics
export const Roles = [undefined, 'Ranger', 'Rogue', 'Valkyrie', 'Archeologist'];
export type Role = (typeof Roles)[number];

// https://nethackwiki.com/wiki/Race
export const PlayerSpeciesList = ['human', 'dwarf', 'elf', 'gnome', 'orc'];
// https://nethackwiki.com/wiki/Pet
export const Pets = ['dog', 'cat', 'pony'];
export const Monsters = ['owlbear'];
const SpeciesList = [undefined, ...PlayerSpeciesList, ...Pets, ...Monsters];
export type Species = (typeof SpeciesList)[number];

export class Meter {
  current: number;
  max: number;
  constructor(max: number, current?: number) {
    this.max = max;
    this.current = current ?? this.max;
  }
  update(delta: number) {
    this.current = ROT.Util.clamp(this.current + delta, 0, this.max);
  }
}

interface Attributes {
  // https://nethackwiki.com/wiki/Attribute
  STR: number;
}

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
  attributes: Attributes;
  relationship: Relationship;
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

export function FleshOut(chars: FormCharacter[]): Character[] {
  return chars.map((c) => {
    //EXTRA CHOICES
    const charChoices: Choice[] = [];
    const SpeciesBarks = new Map<Species, string>([
      ['dog', 'Woof!'],
      ['cat', 'Meow!'],
      ['pony', 'Stomp!']
    ]);
    const barkable = SpeciesBarks.get(c.species);
    if (barkable) {
      charChoices.push({
        buttonText: barkable,
        made: (game) => {
          const char = game.party[game.quaternionIndex];
          //excercising
          const newSTR = char.attributes.STR + 0.3;
          const excerciseAttrUp =
            Math.floor(char.attributes.STR) < Math.floor(newSTR);
          const choiceMessage =
            barkable +
            (excerciseAttrUp ? ' (and their strength increased!)' : '');
          console.log(
            char.attributes.STR,
            Math.floor(char.attributes.STR),
            newSTR,
            Math.floor(newSTR),
            excerciseAttrUp,
            choiceMessage
          );
          char.attributes.STR = newSTR;
          return {
            gameState: game,
            bluntConsumed: 0.05,
            choiceResultMessage: choiceMessage
          };
        }
      });
    }

    if (c.name === 'You') {
      charChoices.push({
        buttonText: 'Let me tell you of the beauty of Elbereth, maaan',
        made: (game) => {
          //TODO: Elbereth - maybe kicks enemies out of the circle?
          return { gameState: game, bluntConsumed: 0.5 };
        }
      });
    }

    return {
      //defaults first...
      role: undefined,
      relationship: 'Party Member',
      attributes: { STR: 10 },
      //HACK:  https://nethackwiki.com/wiki/Hit_points#Hit_points_gained_on_level_gain_and_starting_hitpoints
      hp: new Meter(c.level * 4),
      tactics: { aggression: 0.2, looting: 0.2 },
      extraChoices: charChoices,
      //then the form object...
      ...c
    };
  });
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
