import React from 'react';
import styled from 'styled-components';
import * as World from '../world';
import * as ResponsiveApp from '../responsive';

const CharInfoArea = styled.div({
  backgroundColor: '#0005',
  position: 'absolute',
  textAlign: 'left',
  width: 90,
  top: ResponsiveApp.height / 2 + 20,
  left: 20
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
      <CharInfoLine style={{ fontStyle: 'italic' }}>
        {c.relationship}
      </CharInfoLine>
      <CharInfoLine>
        Level:{Math.floor(c.level)} XP:{Math.floor(World.getXP(c))}
      </CharInfoLine>
      <CharInfoLine
        style={{
          color:
            c.hp.frac() > 0.66 ? 'white' : c.hp.frac() > 0.33 ? 'yellow' : 'red'
        }}>
        HP: {c.hp.current}/{c.hp.max}
      </CharInfoLine>
    </CharInfoArea>
  );
}
