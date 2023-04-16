import React, { useCallback, useEffect, useState } from 'react';
import * as ROT from 'rot-js';
import * as THREE from 'three';
//Local:
import * as UI from './ui';
import * as ResponsiveApp from './responsive';
import * as Game from './game';
import * as World from './world';
import * as Comms from './comms';
import * as Choices from './choices';
import { filterInPlace, randomChoices } from './utils';
import { scene, camera, createRandomLevel, animate } from './thirdDimension';
import { MazesOfMenace } from './world';
import { SimulateDelve } from './delve';

function App() {
  const canvasRef = React.createRef<HTMLCanvasElement>();

  const [game, setGame] = useState<Game.GameState>(Game.Empty());
  const [charInfo, setCharInfo] = useState<JSX.Element>(<span></span>);
  const [choiceList, setChoiceList] = useState<Choices.Choice[]>([]);

  const cValRand = () => {
    const cMin = 5;
    const cMax = 200;
    return ROT.RNG.getUniformInt(cMin, cMax);
  };
  const [bgColors, setBGColors] = useState({
    c1: ROT.Color.add([0, 0, 0]),
    c2: ROT.Color.add([0, 0, 0]),
    opacity: 1
  });
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, ResponsiveApp.width, ResponsiveApp.height);
    const arc =
      game.party.length > 0
        ? Math.abs(0.5 - game.quaternionIndex / game.party.length)
        : 0;
    const bgColor = ROT.Color.interpolate(bgColors.c1, bgColors.c2, arc);
    const fs =
      ROT.Color.toHex(bgColor) +
      (Math.floor(bgColors.opacity) * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = fs;
    ctx.fillRect(0, 0, ResponsiveApp.width, ResponsiveApp.height);

    if (!partyIsDead() && game.currentDungeonLevel % 1 === 0) {
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

      const yawRadians =
        (game.quaternionIndex / game.party.length) * 2 * Math.PI;
      camera.setRotationFromEuler(
        new THREE.Euler(Math.PI * 0.5, -yawRadians, 0)
      );
    }
  }, [game]);

  //game updated
  useEffect(() => {
    if (game.quaternionIndex % 1 === 0) {
      console.log('game state: ', game);
    }
    if (!partyIsDead()) {
      //playing
      if (Math.floor(game.quaternionIndex) === game.quaternionIndex) {
        setCharInfo(UI.RenderCharInfo(game.party.at(game.quaternionIndex)));
      } else {
        setCharInfo(<span></span>);
      }
    }
  }, [game]);

  //rotation animation
  const rotateRate = 0.12;
  useEffect(() => {
    const interval = setInterval(() => {
      const phase = game.quaternionIndex % 1;
      if (phase !== 0) {
        if (phase < rotateRate || 1 - phase < rotateRate) {
          //snap
          setGame({
            ...game,
            quaternionIndex:
              Math.round(game.quaternionIndex) % game.party.length,
            choiceMade: false
          });
        } else {
          //keep rotating
          setGame({
            ...game,
            quaternionIndex:
              (game.quaternionIndex + rotateRate) % game.party.length
          });
        }
      }
    }, 1000 / 24); //animated like the movies
    return () => clearInterval(interval);
  });

  const StartGame = useCallback(() => {
    setBGColors({
      c1: ROT.Color.add([cValRand(), cValRand(), cValRand()]),
      c2: ROT.Color.add([cValRand(), cValRand(), cValRand()]),
      opacity: 0.3
    });

    const newGame = Game.Begin();
    createRandomLevel(MazesOfMenace[newGame.currentDungeonLevel]!.threeD);
    setGame(newGame);
  }, [game, setGame]);

  const StartScreen: JSX.Element = (
    <ResponsiveApp.Overlay style={{ backgroundColor: 'black' }}>
      <UI.Title>Blunt Quaternion</UI.Title>
      <UI.DelveButton onClick={StartGame}>Begin...</UI.DelveButton>
    </ResponsiveApp.Overlay>
  );

  function refreshChoices() {
    if (game.followUpChoices.length > 0) {
      setChoiceList(ROT.RNG.shuffle(game.followUpChoices));
      return;
    }

    if (game.choiceMade) {
      //choice already made for this character, only pass will be available
      setChoiceList([]);
      return;
    }

    const char = game.party[game.quaternionIndex];
    //if char is undefined, we might be mid-rotation
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
      lastChoiceResult: '',
      followUpChoices: []
    });
  };

  const makeChoice = useCallback(
    (choiceResult: Choices.ChoiceResult) => {
      setGame({
        ...game,
        followUpChoices: [],
        ...choiceResult.gameState,
        bluntFraction: game.bluntFraction - choiceResult.bluntConsumed,
        lastChoiceResult: choiceResult.choiceResultMessage ?? '',
        choiceMade: true
      });
    },
    [game, setGame]
  );

  const delveNext = useCallback(() => {
    //interm:
    setBGColors({
      c1: ROT.Color.add([0, 0, 0]),
      c2: ROT.Color.add([0, 0, 0]),
      opacity: 0
    });
    setGame({
      ...game,
      currentDungeonLevel: game.currentDungeonLevel + 0.1
    });

    const newGameState = SimulateDelve(game);

    setTimeout(() => {
      createRandomLevel(
        MazesOfMenace[newGameState.currentDungeonLevel]!.threeD
      );
      setBGColors({
        c1: ROT.Color.add([cValRand(), cValRand(), cValRand()]),
        c2: ROT.Color.add([cValRand(), cValRand(), cValRand()]),
        opacity: 0.3
      });

      // destination:
      setGame(newGameState);
    }, 500);
  }, [game, setGame]);

  const readyToDelve = useCallback(() => {
    return game.bluntFraction <= 0 && game.quaternionIndex % 1 === 0;
  }, [game]);

  const restartGame = useCallback(() => {
    setGame(Game.Empty());
  }, [setGame]);

  //"run once"
  useEffect(() => {
    //HACK: uncomment to autostart game during development
    // StartGame();
  }, []);

  const BQScreen: JSX.Element = (
    <ResponsiveApp.Overlay>
      <UI.DungeonLevelTitle>
        Dungeon Level: {game.currentDungeonLevel} <br />
        {World.MazesOfMenace.at(game.currentDungeonLevel)?.name}
      </UI.DungeonLevelTitle>
      <span>
        {game.bluntFraction > 0 && (
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
        )}
        <Choices.ShowChoices
          choices={choiceList}
          game={game}
          onChoice={makeChoice}
        />
      </span>
      {readyToDelve() && (
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
    <ResponsiveApp.Overlay style={{ backgroundColor: 'black' }}>
      <UI.DungeonLevelTitle>Delving...</UI.DungeonLevelTitle>
    </ResponsiveApp.Overlay>
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
      game.party
        .filter((c) => c.hp.current > 0)
        .filter((c) => c.relationship === 'Party Member').length === 0
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

  //Shortcut Key Handling
  const handleKeyDown = useCallback(
    (e: any) => {
      console.log('key down handled! ', e);
      if (game.currentDungeonLevel < 0) {
        if (e.key === ' ') {
          StartGame();
        }
      } else {
        //playing the game
        if (e.key === ' ') {
          if (readyToDelve()) {
            delveNext();
          } else {
            passBlunt();
          }
        }
        const ChoiceShortcutMap = new Map<string, number>([
          ['a', 0],
          ['s', 1],
          ['d', 2]
        ]);
        const choiceIndex = ChoiceShortcutMap.get(e.key);
        if (choiceIndex !== undefined && choiceIndex < choiceList.length) {
          //TODO: highlight the choice button chosen, please
          makeChoice(choiceList[choiceIndex].made(game));
        }
      }
    },
    [game, StartGame, delveNext, passBlunt, choiceList, makeChoice]
  );
  useEffect(() => {
    document.body.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  });

  const [showHelp, setShowHelp] = useState(false);

  return (
    <ResponsiveApp.RootDivWithThree
      canvasRef={canvasRef}
      scene={scene}
      camera={camera}
      animate={animate}>
      {game.currentDungeonLevel < 0 && StartScreen}
      {game.currentDungeonLevel >= 0 && PlayingScreen}
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
    </ResponsiveApp.RootDivWithThree>
  );
}

export default App;
