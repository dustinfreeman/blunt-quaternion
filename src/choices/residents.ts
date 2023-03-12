import * as World from '../world';
import * as Game from '../game';
import { Choice } from '.';

export const ResidentChoices = (
  char: World.Character,
  game: Game.GameState
): Choice[] => {
  const _choiceList: Choice[] = [];

  if (game.delveSimulation.lootMultiplier === 1) {
    _choiceList.push({
      buttonText: 'I can tell you where the treasure is',
      made: (game) => {
        return {
          gameState: {
            delveSimulation: {
              ...game.delveSimulation,
              lootMultiplier: 2
            }
          },
          choiceResultMessage: "You'll get more loot now!",
          bluntConsumed: 0.2
        };
      }
    });
  }

  if (game.delveSimulation.combatMultiplier === 1) {
    _choiceList.push(
      ...[
        {
          buttonText: 'I can tell you how to avoid monsters on this level',
          made: (game: Game.GameState) => {
            return {
              gameState: {
                delveSimulation: {
                  ...game.delveSimulation,
                  combatMultiplier: 0.5
                }
              },
              choiceResultMessage: 'Stay safe out there!',
              bluntConsumed: 0.4
            };
          }
        },
        {
          buttonText: 'I can tell you where the good fights are',
          made: (game: Game.GameState) => {
            return {
              gameState: {
                delveSimulation: {
                  ...game.delveSimulation,
                  combatMultiplier: 2
                }
              },
              choiceResultMessage: 'Time to git gud!',
              bluntConsumed: 0.1
            };
          }
        }
      ]
    );
  }

  return _choiceList;
};
