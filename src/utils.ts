import * as ROT from 'rot-js';

export function filterInPlace<T>(
  src: T[],
  condition: (val: T) => boolean,
  dst?: T[]
) {
  //removes elements not matching condition from src array,
  // and returns them as dst array

  //optionally, can use a passed pre-existing dst array
  if (!dst) {
    dst = [];
  }

  let i = 0,
    j = 0;

  while (i < src.length) {
    const val = src[i];
    if (condition(val)) {
      src[j++] = val;
    } else {
      dst.push(val);
    }
    i++;
  }

  src.length = j;

  return dst;
}

export function randomChoices<T>(arr: readonly T[], quantity: number): T[] {
  //return a quantity from the original array, without replacement
  if (arr.length === 0) {
    return [];
  }
  const copiedArr = [...arr];
  const returnArr = [];
  for (let i = 0; i < quantity; i++) {
    const randIndex = Math.floor(Math.random() * copiedArr.length);
    returnArr.push(copiedArr.splice(randIndex, 1)[0]);
    if (copiedArr.length === 0) {
      break;
    }
  }
  return returnArr;
}

export class Meter {
  current: number;
  max: number;
  constructor(max: number, current?: number) {
    this.max = max;
    this.current = current ?? this.max;
  }
  update(delta: number) {
    this.current = ROT.Util.clamp(this.current + delta, 0, this.max);
  }
  frac() {
    return this.current / this.max;
  }
  isFull() {
    return this.current === this.max;
  }
}
