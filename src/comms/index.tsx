import React from 'react';
import styled from 'styled-components';
// import * as ResponsiveApp from '../ResponsiveApp';

// Credit: https://opengameart.org/content/comic-speech-balloons
import ImgThoughtBubble from './comic-1.png';

const CommsBubble = styled.div({
  width: 100,
  opacity: 0.6,
  position: 'absolute',
  left: 30,
  // backgroundColor: 'orange',
  height: 100
});

const CommsBubbleImg = styled.img({
  width: '100%',
  position: 'absolute',
  left: 0
});

const CommsText = styled.div({
  width: '70%',
  textAlign: 'center',
  height: '100%',
  margin: '15%',
  position: 'absolute',
  fontSize: 8
});

export const ThoughtBubble = (props: { lastChoiceResult: string }) => {
  return (
    <CommsBubble>
      <CommsBubbleImg src={ImgThoughtBubble} />
      <CommsText>{props.lastChoiceResult}</CommsText>
    </CommsBubble>
  );
};
