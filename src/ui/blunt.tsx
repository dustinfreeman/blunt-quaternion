import React from 'react';
import styled from 'styled-components';

const WholeBlunt = styled.div({
  backgroundColor: '#222a',
  position: 'absolute',
  width: 40,
  top: 50,
  right: 5,
  bottom: 80
  //need to leave lower right open for Itch.io's fullscreen button
});

const UnburntSection = styled.div({
  position: 'relative',
  backgroundColor: '#aaa'
});

export function Blunt(props: {
  bluntFraction: number;
  children: React.ReactNode;
}) {
  return (
    <WholeBlunt>
      <UnburntSection
        style={{
          top: (1 - props.bluntFraction) * 100 + '%',
          height: props.bluntFraction * 100 + '%'
        }}
      />
      {props.children}
    </WholeBlunt>
  );
}
