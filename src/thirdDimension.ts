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
const innerRoom = 1;
const outerWall = 7;
function makeCubeAt(x: number, y: number, z: number) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  scene.add(cube);
  levelObjects.push(cube);
}

export function createRandomLevel() {
  levelObjects.forEach((cube) => scene.remove(cube));
  levelObjects.splice(0, levelObjects.length);

  for (let i = -outerWall; i <= outerWall; i++) {
    for (let j = -outerWall; j <= outerWall; j++) {
      //floor
      makeCubeAt(i, j, -1);
      //ceiling
      makeCubeAt(i, j, 3);
      if (Math.abs(i) <= innerRoom && Math.abs(j) <= innerRoom) {
        continue;
      }
      if (
        ROT.RNG.getUniform() < 0.3 ||
        Math.abs(i) === outerWall ||
        Math.abs(j) === outerWall
      ) {
        makeCubeAt(i, j, 0);
        makeCubeAt(i, j, 1);
        makeCubeAt(i, j, 2);
      }
    }
  }
}

export const animate = () => {};
