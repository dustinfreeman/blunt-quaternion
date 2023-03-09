import React, { useCallback, useEffect, useState } from 'react';
import * as ROT from 'rot-js';
import * as UI from './ui';
import * as ResponsiveApp from './ResponsiveApp';
import * as Game from './game';
import * as World from './world';
import * as Comms from './comms';
import * as Choices from './choices';
import { filterInPlace, randomChoices } from './utils';

const debug = false;

const cValRand = () => {
  const cMin = 5;
  const cMax = 120;
  return ROT.RNG.getUniformInt(cMin, cMax);
};

function App() {
  const canvasRef = React.createRef<HTMLCanvasElement>();

  const [bgColors, setBGColors] = useState({
    c1: ROT.Color.add([0, 0, 0]),
    c2: ROT.Color.add([0, 0, 0])
  });

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d'); //, { alpha: false });
    if (!ctx) {
      return;
    }

    const arc = Math.abs(0.5 - game.quaternionIndex / game.party.length);
    const bgColor = ROT.Color.interpolate(bgColors.c1, bgColors.c2, arc);
    ctx.fillStyle = ROT.Color.toHex(bgColor);
    ctx.fillRect(0, 0, ResponsiveApp.width, ResponsiveApp.height);

    if (game.party.length > 0 && game.currentDungeonLevel % 1 === 0) {
      //visible characters around quaternion
      ctx.fillStyle = 'white';
      ctx.font = String('160') + 'px monospace';
      ctx.textAlign = 'center';
      const top = 180;

      const current = Math.floor(game.quaternionIndex);
      const next = Math.ceil(game.quaternionIndex) % game.party.length;
      const phase = game.quaternionIndex % 1;
      if (game.party[current]) {
        ctx.fillText(
          World.Display(game.party[current]).char,
          ResponsiveApp.width * (0.5 - phase),
          top
        );
      }
      if (game.party[next]) {
        ctx.fillText(
          World.Display(game.party[next]).char,
          ResponsiveApp.width * (1.5 - phase),
          top
        );
      }
    }
  });

  const [game, setGame] = useState<Game.GameState>(Game.Empty());
  const [charInfo, setCharInfo] = useState<JSX.Element>(<span></span>);
  const [choiceList, setChoiceList] = useState<Choices.Choice[]>([]);

  //game updated
  useEffect(() => {
    if (game.quaternionIndex % 1 === 0) {
      console.log('current: ', game);
    }
    if (game.party.length > 0) {
      //playing
      if (Math.floor(game.quaternionIndex) === game.quaternionIndex) {
        setCharInfo(UI.RenderCharInfo(game.party.at(game.quaternionIndex)));
      } else {
        setCharInfo(<span></span>);
      }
    }
  }, [game]);

  //rotation animation
  const rotateRate = 0.1;
  useEffect(() => {
    const interval = setInterval(() => {
      const phase = game.quaternionIndex % 1;
      if (phase !== 0) {
        if (phase < rotateRate || 1 - phase < rotateRate) {
          //snap
          setGame({
            ...game,
            quaternionIndex:
              Math.round(game.quaternionIndex) % game.party.length
          });
        } else {
          //keep rotating
          setGame({
            ...game,
            quaternionIndex: (game.quaternionIndex + 0.1) % game.party.length
          });
        }
      }
    }, 1000 / 24); //animated like the movies
    return () => clearInterval(interval);
  });

  const StartGame = useCallback(() => {
    setGame(Game.Begin());
  }, [game, setGame]);

  const StartScreen: JSX.Element = (
    <ResponsiveApp.Overlay>
      <UI.Title>Blunt Quaternion</UI.Title>
      <UI.DelveButton onClick={StartGame}>Begin...</UI.DelveButton>
    </ResponsiveApp.Overlay>
  );
  //HACK: game start
  // useEffect(() => {
  //   if (game.party.length === 0) {
  //     StartGame();
  //   }
  // });

  function refreshChoices() {
    const char = game.party[game.quaternionIndex];
    if (!char || char.hp.current === 0) {
      setChoiceList([]);
      return;
    }
    const _choiceList: Choices.Choice[] = Choices.ChoicesFor(char, game);

    //filter choices for relevance
    filterInPlace(
      _choiceList,
      (_choice) => !_choice.relevant || _choice.relevant(char, game)
    );

    setChoiceList(ROT.RNG.shuffle(randomChoices(_choiceList, 3)));
  }
  useEffect(() => {
    refreshChoices();
  }, [game, setChoiceList]);

  const passBlunt = () => {
    //start rotating; must be more than rate
    setGame({
      ...game,
      bluntFraction: game.bluntFraction - 0.1,
      quaternionIndex:
        (game.quaternionIndex + rotateRate * 1.1) % game.party.length,
      lastChoiceResult: ''
    });

    setChoiceList([]);
  };

  const makeChoice = useCallback(
    (choiceResult: Choices.ChoiceResult) => {
      setGame({
        ...choiceResult.gameState,
        bluntFraction: game.bluntFraction - choiceResult.bluntConsumed,
        lastChoiceResult: choiceResult.choiceResultMessage ?? ''
      });
      refreshChoices();
    },
    [game, setGame]
  );

  const delveNext = useCallback(() => {
    //interm:
    setBGColors({
      c1: ROT.Color.add([0, 0, 0]),
      c2: ROT.Color.add([0, 0, 0])
    });
    setGame({
      ...game,
      currentDungeonLevel: game.currentDungeonLevel + 0.1
    });

    //Simulate an adventure, taking the "real work" out of playing roguelikes
    const party = ROT.RNG.shuffle(game.party);
    //Loot Simulation
    const inventory = game.inventory;
    inventory.push(...randomChoices(World.LootList, 1));

    //Combat Simulation
    party.forEach((c: World.Character) => {
      const combatIncidence =
        (c.tactics.aggression + 0.25) *
        (game.currentDungeonLevel + 1) *
        ROT.RNG.getUniform();

      c.hp.update(
        // -1
        Math.round(ROT.RNG.getUniform() * -3 * combatIncidence)
      );
      World.addXP(c, Math.round(combatIncidence * 4));
    });
    //Remove dead party members
    const freshCorpses = party.filter((p) => p.hp.current <= 0);
    filterInPlace(party, (p) => p.hp.current > 0);
    //leave behind any non-party members
    filterInPlace(party, (p) => p.relationship === 'Party Member');

    //Delving Direction
    let changeDelveDirectionMaybe: Partial<Game.GameState> = {};
    if (game.currentDungeonLevel >= World.MazesOfMenace.length - 1) {
      changeDelveDirectionMaybe = { delveDirection: -1 };
    }
    const moveDelta = Math.floor(0.9 + ROT.RNG.getUniform() * 1.2);
    const nextDungeonLevel = Math.min(
      game.currentDungeonLevel + moveDelta * game.delveDirection,
      World.MazesOfMenace.length - 1
    );

    setTimeout(() => {
      setBGColors({
        c1: ROT.Color.add([cValRand(), cValRand(), cValRand()]),
        c2: ROT.Color.add([cValRand(), cValRand(), cValRand()])
      });

      //add to party from this level
      const locals = [
        ...World.FleshOut(
          World.MazesOfMenace[nextDungeonLevel].characters ?? []
        )
      ];
      console.log(
        'locals!',
        nextDungeonLevel,
        locals,
        World.MazesOfMenace[nextDungeonLevel]
      );
      //definitely add guides
      //TODO: generalize "move from one array to another with a filter"
      party.push(...locals.filter((p) => p.relationship === 'Local Guide'));
      filterInPlace(locals, (p) => p.relationship !== 'Local Guide');
      //choose another random local
      party.push(...randomChoices(locals, 1));

      // destination:
      setGame({
        ...game,
        currentDungeonLevel: nextDungeonLevel,
        ...changeDelveDirectionMaybe,
        party: party,
        graveyard: [...game.graveyard, ...freshCorpses],
        inventory: inventory,
        //reset quaternion for next blaze
        quaternionIndex: ROT.RNG.getUniformInt(0, game.party.length - 1),
        bluntFraction: 1,
        lastChoiceResult: ''
      });
    }, 500);
  }, [game, setGame]);

  const restartGame = useCallback(() => {
    setGame(Game.Empty());
  }, [setGame]);

  const BQScreen: JSX.Element = (
    <ResponsiveApp.Overlay>
      <UI.DungeonLevelTitle>
        Dungeon Level: {game.currentDungeonLevel} <br />
        {World.MazesOfMenace.at(game.currentDungeonLevel)?.name}
      </UI.DungeonLevelTitle>
      {game.bluntFraction > 0 && (
        <span>
          <UI.Blunt bluntFraction={game.bluntFraction}>
            <UI.PassButton
              onClick={() => {
                passBlunt();
              }}>
              Pass
              <br />
              Blunt
            </UI.PassButton>
          </UI.Blunt>
          <Choices.ShowChoices
            choices={choiceList}
            game={game}
            onChoice={makeChoice}
          />
        </span>
      )}
      {game.bluntFraction <= 0 && (
        <UI.DelveButton
          onClick={() => {
            delveNext();
          }}>
          Continue Delving...
        </UI.DelveButton>
      )}
      {charInfo}
      {game.lastChoiceResult !== '' && (
        <Comms.ThoughtBubble lastChoiceResult={game.lastChoiceResult} />
      )}
    </ResponsiveApp.Overlay>
  );

  const DelvingScreen: JSX.Element = (
    <UI.DungeonLevelTitle>Delving...</UI.DungeonLevelTitle>
  );

  const WinScreen: JSX.Element = (
    <ResponsiveApp.Overlay style={{ backgroundColor: 'darkslategray' }}>
      <UI.DungeonLevelTitle>
        Your party has returned to the surface, <br />
        with the Amulet of Yendor in your possession.
        <br />
        You have ascended and won!
      </UI.DungeonLevelTitle>
      <UI.DelveButton
        onClick={() => {
          restartGame();
        }}>
        The End
      </UI.DelveButton>
    </ResponsiveApp.Overlay>
  );

  const LossScreen: JSX.Element = (
    <ResponsiveApp.Overlay style={{ backgroundColor: 'black' }}>
      <UI.DungeonLevelTitle>Your entire party has died.</UI.DungeonLevelTitle>
      <UI.DelveButton
        onClick={() => {
          restartGame();
        }}>
        The End
      </UI.DelveButton>
    </ResponsiveApp.Overlay>
  );

  function partyIsDead(): boolean {
    //any party members with hp > 0 means the party is alive
    return (
      game.party.length === 0 ||
      game.party.filter((p) => p.hp.current > 0).length === 0
    );
  }

  const PlayingScreen: JSX.Element = (
    <ResponsiveApp.Overlay>
      {game.currentDungeonLevel % 1 === 0 && BQScreen}
      {game.currentDungeonLevel === 0 && game.delveDirection < 0 && WinScreen}
      {game.currentDungeonLevel % 1 !== 0 && DelvingScreen}
      {partyIsDead() && LossScreen}
    </ResponsiveApp.Overlay>
  );

  const [showHelp, setShowHelp] = useState(false);

  return (
    <ResponsiveApp.RootDiv canvasRef={canvasRef}>
      <ResponsiveApp.Overlay>
        {game.currentDungeonLevel < 0 && StartScreen}
        {game.currentDungeonLevel >= 0 && PlayingScreen}
        {debug && (
          <ResponsiveApp.Overlay>
            <UI._BaseButton
              onClick={() => {
                game.party.forEach((c) => c.hp.update(-1000));
              }}>
              Kill Party
            </UI._BaseButton>
          </ResponsiveApp.Overlay>
        )}
        {showHelp && (
          <ResponsiveApp.Overlay style={{ backgroundColor: 'darkslateblue' }}>
            <UI.Title>Help?</UI.Title>
            <UI._BaseButton
              onClick={() => {
                setShowHelp(false);
                restartGame();
              }}>
              Restart Game
            </UI._BaseButton>
          </ResponsiveApp.Overlay>
        )}
        <UI.HelpButton
          onClick={() => {
            setShowHelp(!showHelp);
          }}>
          {'_?_'}
        </UI.HelpButton>
      </ResponsiveApp.Overlay>
    </ResponsiveApp.RootDiv>
  );
}

export default App;
