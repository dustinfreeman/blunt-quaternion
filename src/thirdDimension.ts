import * as ROT from 'rot-js';
import * as THREE from 'three';
import * as ResponsiveApp from './responsive';

export const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x8855aa);
scene.background = new THREE.Color(0x000);

export const camera = new THREE.PerspectiveCamera(
  75,
  ResponsiveApp.width / ResponsiveApp.height,
  0.9,
  7
);
camera.position.z = 1;
camera.setRotationFromEuler(new THREE.Euler(Math.PI * 0.5, 0, 0));

const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
const material = new THREE.MeshDepthMaterial({ wireframe: false });

//Cube Grid
const levelObjects: THREE.Object3D[] = [];
function makeCubeAt(x: number, y: number, z: number) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  scene.add(cube);
  levelObjects.push(cube);
}

export interface ThreeDLevelProps {
  innerRoom: number;
  outerWall: number;
  probBlock: number;
  ceiling: boolean;
}

export function createRandomLevel(props?: Partial<ThreeDLevelProps>) {
  const fullProps: ThreeDLevelProps = {
    ...{
      innerRoom: 2,
      outerWall: 7,
      probBlock: 0.3,
      ceiling: true
    },
    ...props
  };

  levelObjects.forEach((cube) => scene.remove(cube));
  levelObjects.splice(0, levelObjects.length);

  for (let i = -fullProps.outerWall; i <= fullProps.outerWall; i++) {
    for (let j = -fullProps.outerWall; j <= fullProps.outerWall; j++) {
      //floor
      makeCubeAt(i, j, -1);
      //ceiling
      if (fullProps.ceiling) {
        makeCubeAt(i, j, 3);
      }
      if (
        Math.abs(i) <= fullProps.innerRoom &&
        Math.abs(j) <= fullProps.innerRoom
      ) {
        continue;
      }
      if (
        ROT.RNG.getUniform() < fullProps.probBlock ||
        Math.abs(i) === fullProps.outerWall ||
        Math.abs(j) === fullProps.outerWall
      ) {
        makeCubeAt(i, j, 0);
        makeCubeAt(i, j, 1);
        makeCubeAt(i, j, 2);
      }
    }
  }
}

export const animate = () => {};
