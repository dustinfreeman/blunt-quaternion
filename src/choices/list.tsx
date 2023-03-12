import * as ROT from 'rot-js';

import { Choice } from '.';
import { GameState } from '../game';
import { randomChoices } from '../utils';
import * as World from '../world';
import { Species } from '../world';

export function ChoicesFor(char: World.Character, game: GameState): Choice[] {
  const _choiceList: Choice[] = [
    {
      buttonText: 'Think deep thoughts',
      made: () => {
        return {
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
      const rummagingInventory = randomChoices(game.inventory, 3);
      _choiceList.push({
        buttonText: 'Let me rummage through our inventory...',
        made: () => {
          return {
            gameState: {
              followUpChoices: rummagingInventory.map((item) => {
                return {
                  buttonText: 'Do something with ' + item.name,
                  made: () => {
                    return {
                      bluntConsumed: 0.05
                    };
                  }
                };
              })
            },
            bluntConsumed: 0.15,
            choiceResultMessage: 'What do we have here?'
          };
        }
      });

      //putting random stuff in your mouth
      const consumables = game.inventory.filter((item) =>
        ['comestible', 'potion'].includes(item.itemType)
      );
      const randomToConsume = ROT.RNG.getItem(consumables);
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

    if (char.ringFinger === undefined) {
      const wearables = game.inventory.filter((item) =>
        ['ring'].includes(item.itemType)
      );
      const randomWearable = ROT.RNG.getItem(wearables);
      if (randomWearable) {
        _choiceList.push({
          buttonText: "I'm going to put on this " + randomWearable.name,
          made: (game) => {
            char.ringFinger = randomWearable;
            return {
              gameState: {
                inventory: game.inventory.filter(
                  (item) => item !== randomWearable
                )
              },
              bluntConsumed: 0.1,
              choiceResultMessage: 'shiny!'
            };
          }
        });
      }
    } else {
      _choiceList.push({
        buttonText: "I'm going to take off this " + char.ringFinger.name,
        made: (game) => {
          game.inventory.push(char.ringFinger!);
          char.ringFinger = undefined;
          return {
            bluntConsumed: 0.1,
            choiceResultMessage: 'it was ugly anyway'
          };
        }
      });
    }

    //TACTICS
    if (char.tactics.aggression < 1) {
      _choiceList.push({
        buttonText: 'I should be more aggressive.',
        made: () => {
          char.tactics.aggression = ROT.Util.clamp(
            char.tactics.aggression + 0.25,
            0,
            1
          );
          return {
            bluntConsumed: 0.1,
            choiceResultMessage: 'grrr!'
          };
        }
      });
    }
    if (char.tactics.aggression > 0) {
      _choiceList.push({
        buttonText: 'I should be less aggressive.',
        made: () => {
          char.tactics.aggression = ROT.Util.clamp(
            char.tactics.aggression - 0.25,
            0,
            1
          );
          return {
            bluntConsumed: 0.3,
            choiceResultMessage: 'I will try to get into less confrontations.'
          };
        }
      });
    }

    if (char.name === 'You' && !game.elberethed) {
      _choiceList.push({
        buttonText: 'Let me tell you of the beauty of Elbereth, man',
        made: () => {
          return {
            gameState: { elberethed: true },
            bluntConsumed: 0.5,
            choiceResultMessage:
              'I have asked Elbereth to protect us this coming delve'
          };
        }
      });
    }

    const SpeciesBarks = new Map<Species, string>([
      ['dog', 'Woof!'],
      ['cat', 'Meow!'],
      ['pony', 'Stomp!']
    ]);
    const barkable = SpeciesBarks.get(char.species);
    if (barkable) {
      _choiceList.push({
        buttonText: barkable,
        made: (game) => {
          const char = game.party[game.quaternionIndex];

          //exercising
          const choiceMessage =
            barkable +
            (char.attributes.STR.exercise(0.3)
              ? ' (my strength increased!)'
              : '');
          return {
            bluntConsumed: 0.05,
            choiceResultMessage: choiceMessage
          };
        }
      });
    }
  }
  _choiceList.push(...char.extraChoices);

  return _choiceList;
}
