import React from 'react';
import styled from 'styled-components';
// import * as ResponsiveApp from '../ResponsiveApp';

// Credit: https://opengameart.org/content/comic-speech-balloons
import ImgThoughtBubble from './comic-3.png';

const CommsBubble = styled.div({
  width: 130,
  height: 80,
  opacity: 0.6,
  position: 'absolute',
  // backgroundColor: '#00a4',
  left: 3,
  top: 30
});

const CommsBubbleImg = styled.img({
  width: '100%',
  position: 'absolute',
  left: 0
});

const CommsText = styled.div({
  textAlign: 'center',
  verticalAlign: 'center',
  position: 'absolute',
  marginTop: '9%',
  marginBottom: '10%',
  height: 'auto',
  marginLeft: '10%',
  marginRight: '14%',
  width: '76%',
  // backgroundColor: '#f006',
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
