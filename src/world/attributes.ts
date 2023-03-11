export class Attribute {
  private _val: number;
  constructor() {
    this._val = 10;
  }
  val() {
    return Math.floor(this._val);
  }
  exercise(amount: number): boolean {
    //returns true if changed by an integer
    const newVal = this._val + amount;
    const changed = Math.floor(newVal) !== Math.floor(this._val);
    this._val = newVal;
    return changed;
  }
}

// const getAttrVal = (attrBlock: Attributes, attrName: string): number => {
//   switch (attrName) {
//     case 'STR':
//       return attrBlock.STR;
//     case 'WIS':
//       return attrBlock.STR;
//     default:
//       return 0;
//   }
// };

export interface AttrBlock {
  // https://nethackwiki.com/wiki/Attribute
  STR: Attribute;
  WIS: Attribute;
}

export const AttrsDefault = (): AttrBlock => {
  return {
    STR: new Attribute(),
    WIS: new Attribute()
  };
};
