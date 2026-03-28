import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { clamp } from './utils';

describe('Property-Based Tests', () => {
  it('clamp should always return a value between min and max', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        fc.integer(),
        (value, a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const result = clamp(value, min, max);
          return result >= min && result <= max;
        }
      ),
      { numRuns: 20 }
    );
  });
});

