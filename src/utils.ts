import * as ROT from 'rot-js';

export function filterInPlace<T>(a: T[], condition: (val: T) => boolean) {
  let i = 0,
    j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
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
}
