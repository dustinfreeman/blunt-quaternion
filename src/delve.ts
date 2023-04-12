import * as ROT from 'rot-js';
import * as Game from './game';
import * as World from './world';
import { filterInPlace, randomChoices } from './utils';

export function SimulateDelve(game: Game.GameState): Game.GameState {
  //Simulate an adventure, taking the "real work" out of playing roguelikes
  const delveSummaryMessage: string[] = [];

  //leave behind any non-party members
  const party = [...game.party];
  filterInPlace(party, (p) => p.relationship === 'Party Member');

  //Loot Simulation
  const inventory = game.inventory;
  const someoneWearingRingOfSearching =
    party.filter((c) => c.ringFinger?.name === 'ring of searching').length > 0;
  const newLootCount =
    2 *
    (1 + (someoneWearingRingOfSearching ? 1 : 0)) *
    game.delveSimulation.lootMultiplier;
  inventory.push(...randomChoices(World.LootList, newLootCount));
  if (newLootCount) {
    delveSummaryMessage.push('We found ' + newLootCount + ' pieces of loot.');
  }

  //Combat Simulation
  let totalCombatIncidence = 0;
  const simulateCombat = () => {
    //TODO: assemble total combat power, instead of per-party member
    party.forEach((c: World.Character) => {
      const wearingRingOfConflict = c.ringFinger?.name === 'ring of conflict';
      const combatIncidence =
        (c.tactics.aggression + 0.5) *
        (game.currentDungeonLevel + 1) *
        (wearingRingOfConflict ? 2 : 1) *
        (ROT.RNG.getUniform() + 1.5) *
        game.delveSimulation.combatMultiplier;
      totalCombatIncidence += combatIncidence;

      //how much damage you took
      // wearing a ring of warning perhaps means you were able to
      // avoid combats you wouldn't do well in.
      const wearingRingOfWarning = c.ringFinger?.name === 'ring of warning';
      c.hp.update(
        Math.round(
          ROT.RNG.getUniform() *
            -5 *
            combatIncidence *
            (wearingRingOfWarning ? 0.5 : 1)
        )
      );

      //how much good combats you completed
      // https://nethackwiki.com/wiki/Strength#Uses_of_strength
      const strengthScaling = 2 * ((c.attributes.STR.val() - 10) / 10) + 1;
      let wisdomScaling = 1;
      if (c.role && ['Valkyrie', 'Wizard'].includes(c.role)) {
        wisdomScaling *= 2 * ((c.attributes.WIS.val() - 10) / 10) + 1;
      }

      console.log(
        'Simulations',
        game.delveSimulation,
        c.name,
        c.species,
        c.role,
        'combatIncidence',
        combatIncidence,
        'totalCombatIncidence',
        totalCombatIncidence
      );

      World.addXP(
        c,
        Math.round(combatIncidence * 16 * strengthScaling * wisdomScaling)
      );
    });
    if (totalCombatIncidence >= 1) {
      delveSummaryMessage.push(
        'We got into ' + Math.floor(totalCombatIncidence),
        ' battles.'
      );
    }
  };
  const protectedByElbereth =
    game.delveSimulation.elberethed && ROT.RNG.getUniform() < 0.7;
  if (!protectedByElbereth) {
    simulateCombat();
  } else {
    delveSummaryMessage.push('Thank Elbereth for protecting us.');
  }

  // https://nethackwiki.com/wiki/Regeneration
  // ideally, approximate how "long" the delve was
  const regenBase =
    1 +
    game.currentDungeonLevel +
    newLootCount * 0.25 +
    totalCombatIncidence * 0.1;
  party.forEach((c) => {
    const wearingRingOfRegen = c.ringFinger?.name === 'ring of regeneration';
    const regen = regenBase * (wearingRingOfRegen ? 2 : 1);
    c.hp.update(Math.floor(regen));
  });

  //Remove dead party members
  const freshCorpses = filterInPlace(party, (p) => p.hp.current > 0);
  freshCorpses.forEach((corpse) =>
    delveSummaryMessage.push([corpse.species, corpse.role].join(' ') + ' died.')
  );

  //Delving Direction
  const amuletInInventory =
    game.inventory.filter((i) => i.name === 'Amulet of Yendor').length > 0;
  if (amuletInInventory) {
    game.delveDirection = -1;
  }
  //TODO: bring back stochastic delving depth.
  // const delveDelta = Math.floor(0.9 + ROT.RNG.getUniform() * 1.2);
  const delveDelta = 1;
  const nextDungeonLevel = Math.min(
    game.currentDungeonLevel + delveDelta * game.delveDirection,
    World.MazesOfMenace.length - 1
  );

  // At Destination Level
  //add to party from this level
  const locals = [
    ...World.FleshOut(World.MazesOfMenace[nextDungeonLevel].characters ?? [])
  ];
  //guarantee adding guides
  filterInPlace(locals, (p) => p.relationship !== 'Guide', party);
  //randomly add remaining locals
  if (party.length < 4) {
    party.push(...randomChoices(locals, 4 - party.length));
  }

  return {
    ...game,
    currentDungeonLevel: nextDungeonLevel,
    party: party,
    graveyard: [...game.graveyard, ...freshCorpses],
    inventory: inventory,
    //reset quaternion for next blaze
    quaternionIndex: 0,
    bluntFraction: 1,
    choiceMade: false,
    lastChoiceResult: delveSummaryMessage.join(' '),
    delveSimulation: Game.DelveSimulationDefaults()
  };
}
