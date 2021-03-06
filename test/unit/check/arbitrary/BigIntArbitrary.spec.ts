import * as fc from '../../../../lib/fast-check';

import { bigIntN, bigUintN, bigInt, bigUint } from '../../../../src/check/arbitrary/BigIntArbitrary';
import { generateOneValue } from './generic/GenerateOneValue';

import * as genericHelper from './generic/GenericArbitraryHelper';

declare function BigInt(n: number | bigint | string): bigint;

const isStrictlySmallerBigInt = (v1: bigint, v2: bigint) => {
  const posV1 = v1 >= BigInt(0) ? v1 : -v1;
  const posV2 = v2 >= BigInt(0) ? v2 : -v2;
  return posV1 < posV2;
};

describe('BigIntArbitrary', () => {
  if (typeof BigInt === 'undefined') {
    it('no test', () => {
      expect(true).toBe(true);
    });
    return;
  }
  describe('bigIntN', () => {
    describe('Given number of bits N [2^(N-1) <= value < 2^(N-1)]', () => {
      genericHelper.isValidArbitrary((n: number) => bigIntN(n), {
        seedGenerator: fc.integer(1, 2000),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, n: number) =>
          typeof g === 'bigint' && g >= BigInt(-1) << BigInt(n - 1) && g <= (BigInt(1) << BigInt(n - 1)) - BigInt(1),
      });
    });
  });
  describe('bigUintN', () => {
    describe('Given number of bits N [0 <= value < 2^N]', () => {
      genericHelper.isValidArbitrary((n: number) => bigUintN(n), {
        seedGenerator: fc.integer(1, 2000),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, n: number) =>
          typeof g === 'bigint' && g >= BigInt(0) && g <= (BigInt(1) << BigInt(n)) - BigInt(1),
      });
    });
  });
  describe('bigInt', () => {
    describe('Given no constraints', () => {
      genericHelper.isValidArbitrary(() => bigInt(), {
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint) => typeof g === 'bigint',
      });
    });
    describe('Given minimal value only [greater or equal to min]', () => {
      genericHelper.isValidArbitrary((min: bigint) => bigInt({ min }), {
        seedGenerator: fc.bigInt(),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, min: bigint) => typeof g === 'bigint' && min <= g,
      });
    });
    describe('Given maximal value only [less or equal to max]', () => {
      genericHelper.isValidArbitrary((max: bigint) => bigInt({ max }), {
        seedGenerator: fc.bigInt(),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, max: bigint) => typeof g === 'bigint' && g <= max,
      });
    });
    describe('Given minimal and maximal values [between min and max]', () => {
      genericHelper.isValidArbitrary((constraints: { min: bigint; max: bigint }) => bigInt(constraints), {
        seedGenerator: genericHelper.minMax(fc.bigInt()),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, constraints: { min: bigint; max: bigint }) =>
          typeof g === 'bigint' && constraints.min <= g && g <= constraints.max,
      });
    });
    describe('Still support older signatures', () => {
      it('Should support fc.bigInt(min, max)', () => {
        fc.assert(
          fc.property(fc.integer(), genericHelper.minMax(fc.bigInt()), (seed, constraints) => {
            const refArbitrary = bigInt(constraints);
            const otherArbitrary = bigInt(constraints.min, constraints.max);
            expect(generateOneValue(seed, otherArbitrary)).toEqual(generateOneValue(seed, refArbitrary));
          })
        );
      });
    });
  });
  describe('bigUint', () => {
    describe('Given no constraints [positive values]', () => {
      genericHelper.isValidArbitrary(() => bigUint(), {
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint) => typeof g === 'bigint' && g >= BigInt(0),
      });
    });
    describe('Given maximal value [between 0 and max]', () => {
      genericHelper.isValidArbitrary((max: bigint) => bigUint({ max }), {
        seedGenerator: fc.bigUint(),
        isStrictlySmallerValue: isStrictlySmallerBigInt,
        isValidValue: (g: bigint, max: bigint) => typeof g === 'bigint' && g >= BigInt(0) && g <= max,
      });
    });
    describe('Still support older signatures', () => {
      it('Should support fc.bigUint( max)', () => {
        fc.assert(
          fc.property(fc.integer(), fc.bigUint(), (seed, max) => {
            const refArbitrary = bigUint({ max });
            const otherArbitrary = bigUint(max);
            expect(generateOneValue(seed, otherArbitrary)).toEqual(generateOneValue(seed, refArbitrary));
          })
        );
      });
    });
  });
});
