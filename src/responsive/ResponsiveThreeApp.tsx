import React, { useEffect } from 'react';
import * as THREE from 'three';
import { FillCanvas, height, Overlay, Root, width } from '.';

let threeCanvas: HTMLCanvasElement | undefined = undefined;

export function RootDivWithThree(props: {
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scene: THREE.Scene;
  camera: THREE.Camera;
  animate: () => void;
}) {
  const appContainerRef = React.createRef<HTMLDivElement>();
  const threeCanvasMountPoint = React.createRef<HTMLDivElement>();

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

  //"run every time"
  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  });

  //"run once"
  useEffect(() => {
    //want to prevent re-run if the scene has already been added to the DOM...
    if (threeCanvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    threeCanvas = renderer.domElement;
    threeCanvasMountPoint.current?.appendChild(threeCanvas);

    function animate() {
      requestAnimationFrame(animate);
      props.animate();
      renderer.render(props.scene, props.camera);
    }

    animate();
  }, [threeCanvasMountPoint]);

  return (
    <Root ref={appContainerRef}>
      <Overlay ref={threeCanvasMountPoint}></Overlay>
      <Overlay>
        <FillCanvas ref={props.canvasRef} width={width} height={height} />
        {props.children}
      </Overlay>
    </Root>
  );
}
