import * as ROT from 'rot-js';

import { Choice } from '.';
import { GameState } from '../game';
import * as World from '../world';

export function ChoicesFor(char: World.Character, game: GameState): Choice[] {
  const _choiceList: Choice[] = [
    {
      buttonText: 'Think deep thoughts',
      made: (game) => {
        return {
          gameState: game,
          bluntConsumed: 0.25,
          choiceResultMessage:
            (char.attributes.WIS.val() < 17
              ? 'I am a ' + char.species
              : 'I am a simulated ' +
                char.species +
                ' in a virtual environment.') +
            (char.attributes.WIS.exercise(0.3) ? ' (my wisdom increased!)' : '')
        };
      }
    }
    // {
    //   buttonText: "I'm going to drink this dubious potion",
    //   made: (game) => {
    //     char.hp.update(-2);
    //     return { gameState: game, bluntConsumed: 0.05 };
    //   }
    // }
    // {
    //   buttonText: 'YASD',
    //   made: (game) => {
    //     const deadParty = game.party;
    //     deadParty.forEach((c) => (c.hp.current = 0));
    //     return { gameState: { ...game, party: deadParty }, bluntConsumed: 0 };
    //   }
    // },
    // {
    //   buttonText: 'Just gonna off myself',
    //   made: (game) => {
    //     char.hp.current = 0;
    //     return {
    //       gameState: game,
    //       bluntConsumed: 0.05,
    //       choiceResultMessage: 'Byeee'
    //     };
    //   }
    // },
    // {
    //   buttonText: 'Heal me please',
    //   made: (game) => {
    //     char.hp.current = char.hp.max;
    //     return { gameState: game, bluntConsumed: 0.1 };
    //   }
    // },
    // {
    //   buttonText: 'I am just chilling, man',
    //   made: (game) => {
    //     return { gameState: game, bluntConsumed: 0.05 };
    //   }
    // }
  ];

  if (char.relationship === 'Party Member') {
    if (game.inventory.length > 0) {
      const randomToConsume = ROT.RNG.getItem(game.inventory);
      if (randomToConsume?.onConsume !== undefined) {
        _choiceList.push({
          buttonText:
            "I'm going to " +
            World.ConsumeVerb(randomToConsume) +
            ' this ' +
            randomToConsume.name,
          made: (game) => {
            const onConsumeMessage = randomToConsume.onConsume?.(char);
            return {
              gameState: {
                ...game,
                inventory: game.inventory.filter(
                  (item) => item !== randomToConsume
                )
              },
              bluntConsumed: 0.1,
              choiceResultMessage: onConsumeMessage ?? 'yum!'
            };
          }
        });
      }
    }
    if (char.tactics.aggression < 1) {
      _choiceList.push({
        buttonText: 'I should be more aggressive.',
        made: (game) => {
          char.tactics.aggression = ROT.Util.clamp(
            char.tactics.aggression + 0.25,
            0,
            1
          );
          return {
            gameState: game,
            bluntConsumed: 0.1,
            choiceResultMessage: 'grrr!'
          };
        }
      });
    }
    if (char.tactics.aggression > 0) {
      _choiceList.push({
        buttonText: 'I should be less aggressive.',
        made: (game) => {
          char.tactics.aggression = ROT.Util.clamp(
            char.tactics.aggression - 0.25,
            0,
            1
          );
          return {
            gameState: game,
            bluntConsumed: 0.3,
            choiceResultMessage: 'I will try to get into less confrontations.'
          };
        }
      });
    }
  }
  _choiceList.push(...char.extraChoices);

  return _choiceList;
}
