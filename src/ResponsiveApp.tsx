import React, { useEffect } from 'react';
import styled, { CSSObject } from 'styled-components';
import './App.css';

export const width = 300;
export const height = 225;

const Root = styled.div({
  display: 'block',
  textAlign: 'center',
  verticalAlign: 'middle',
  backgroundColor: '#335cae',
  width: width + 'px',
  height: height + 'px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transformOrigin: '0 0'
});

export const ParentFill: CSSObject = {
  width: '100%',
  height: '100%',
  positive: 'relative'
};

const Canvas = styled.canvas({
  ...ParentFill
});

export const Overlay = styled.div({
  ...ParentFill,
  position: 'absolute',
  pointerEvents: 'none',
  top: '0',
  left: '0',
  width: width + 'px',
  height: height + 'px',
  backgroundColor: '#ff000009',
  textAlign: 'center'
});

export function RootDiv(props: {
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  const appContainerRef = React.createRef<HTMLDivElement>();

  //window resizing
  const handleWindowSizeChange = () => {
    const appContainer = appContainerRef.current;
    if (!appContainer) {
      return;
    }
    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    );
    appContainer.style.transform = 'scale(' + scale + ') translate(-50%, -50%)';
  };
  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  });
  return (
    <Root ref={appContainerRef}>
      {/* <Canvas ref={props.canvasRef} width={width} height={height} /> */}
      {props.children}
    </Root>
  );
}
