import React from 'react';
import styled from 'styled-components';
import * as UI from '../ui';
import * as ResponsiveApp from '../responsive';
import { GameState } from '../game';
import * as World from '../world';

export interface ChoiceResult {
  gameState?: Partial<GameState>;
  bluntConsumed: number;
  choiceResultMessage?: string;
}

export interface Choice {
  buttonText: string;
  made: (game: GameState) => ChoiceResult;
  //We assume a choice is relevant unless this function exists and returns false
  relevant?: (char: World.Character, game: GameState) => boolean;
}

const ChoiceList = styled.div({
  position: 'absolute',
  // backgroundColor: '#fa48',
  bottom: 10,
  left: ResponsiveApp.width / 2 + 20,
  right: 60
});

const ChoiceButton = styled.button({
  ...UI.BaseButton,
  textDecorationLine: 'none',
  opacity: 0.8,
  verticalAlign: 'top',
  textAlign: 'left',
  fontSize: '8px',
  display: 'inline',
  width: '100%',
  margin: 2,
  minHeight: 30
});

export function ShowChoices(props: {
  choices: Choice[];
  game: GameState;
  onChoice: (choiceResult: ChoiceResult) => void;
}) {
  const displayedChoices: JSX.Element[] = [];
  for (let i = 0; i < props.choices.length; i++) {
    const choice = props.choices[i];
    displayedChoices.push(
      <ChoiceButton
        key={i}
        onClick={() => {
          const choiceResult = choice.made(props.game);
          props.onChoice(choiceResult);
        }}>
        {choice.buttonText}
      </ChoiceButton>
    );
  }

  return <ChoiceList>{displayedChoices}</ChoiceList>;
}
