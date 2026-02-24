import { describe, expect, it } from 'vitest';

const dedupe = (keys: string[]): number => new Set(keys).size;

describe('sync idempotency', () => {
  it('deduplicates by stable sync key', () => {
    expect(dedupe(['a', 'a', 'b'])).toBe(2);
  });
});
