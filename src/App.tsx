import React, { useEffect, useState } from 'react';
import styled, { CSSObject } from 'styled-components';
import * as ResponsiveApp from './ResponsiveApp';

const Title = styled.h3({ top: '20%', color: '#66bb66' });

const BaseButton: CSSObject = {
  fontSize: '1em',
  textAlign: 'center',
  textDecorationLine: 'underline',
  color: 'palevioletred',
  fontFamily: 'monospace',
  position: 'relative',
  borderRadius: '0px'
};

const DelveButton = styled.button({
  ...BaseButton,
  position: 'absolute',
  top: '120px',
  margin: '0 -30px  0 -30px'
});

const LeftButton = styled.button({
  ...BaseButton,
  position: 'absolute',
  top: '50px',
  left: '5px'
});
const RightButton = styled.button({
  ...BaseButton,
  position: 'absolute',
  top: '80px',
  right: '5px'
});

function App() {
  const canvasRef = React.createRef<HTMLCanvasElement>();

  //canvas drawing
  const bgs = ['#f006', '#0f06', '#00f6', '#0006'];
  const [canvasBGIndex, setCanvasBGIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d'); //, { alpha: false });
    if (!ctx) {
      return;
    }

    ctx.fillStyle = bgs[canvasBGIndex];
    ctx.fillRect(0, 0, ResponsiveApp.width, ResponsiveApp.height);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'red';
    const sqWidth = 5;
    //left delve!?
    ctx.strokeRect(5 - sqWidth / 2, 50 - sqWidth / 2, sqWidth, sqWidth);
    //right pass blunt
    ctx.strokeRect(
      ResponsiveApp.width - 5 - sqWidth / 2,
      80 - sqWidth / 2,
      sqWidth,
      sqWidth
    );
    //delve!
    ctx.strokeRect(
      ResponsiveApp.width / 2,
      120 - sqWidth / 2,
      sqWidth,
      sqWidth
    );

    console.log('canvas draw one time', canvas.width, canvas.height);
  });

  return (
    <ResponsiveApp.RootDiv canvasRef={canvasRef}>
      <ResponsiveApp.Overlay>
        <Title>Blunt Quaternion</Title>
        <LeftButton>Delve!?</LeftButton>
        <RightButton
          onClick={() => {
            setCanvasBGIndex((canvasBGIndex + 1) % bgs.length);
          }}>
          Pass Blunt
        </RightButton>
        <DelveButton>Delve!</DelveButton>
      </ResponsiveApp.Overlay>
    </ResponsiveApp.RootDiv>
  );
}

export default App;
