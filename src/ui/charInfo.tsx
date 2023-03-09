import React from 'react';
import styled from 'styled-components';
import * as World from '../world';
import * as ResponsiveApp from '../ResponsiveApp';

// const CharDisplay = styled.div({
//   fontFamily: 'monospace',
//   fontSize: '5em',
//   color: 'white',
//   userSelect: 'none',
//   // display: 'inline-block',
//   position: 'absolute',
//   // background: 'green',
//   top: '50px',
//   width: '60px',
//   left: ResponsiveApp.width / 2 - 30
// });

const CharInfoArea = styled.div({
  backgroundColor: '#0005',
  position: 'absolute',
  textAlign: 'left',
  width: '70px',
  top: ResponsiveApp.height / 2,
  left: 30
});
const CharInfoLine = styled.div({
  fontSize: '8px',
  color: 'white',
  fontFamily: 'monospace'
});

export function RenderCharInfo(c?: World.Character): JSX.Element {
  if (!c) {
    return <span></span>;
  }

  return (
    <CharInfoArea>
      <CharInfoLine>{c.name}</CharInfoLine>
      <CharInfoLine>{c.species}</CharInfoLine>
      <CharInfoLine>{c.role}</CharInfoLine>
      <CharInfoLine>
        Level:{Math.floor(c.level)} XP:{Math.floor(World.getXP(c))}
      </CharInfoLine>
      <CharInfoLine>
        HP: {c.hp.current}/{c.hp.max}
      </CharInfoLine>
    </CharInfoArea>
  );
}
