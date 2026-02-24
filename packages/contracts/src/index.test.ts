import { describe, expect, it } from 'vitest';
import { OrderContract } from './index';

describe('contracts package', () => {
  it('exports order contract type', () => {
    const example: OrderContract = { orderId: 'o1', state: 'SYNC_PENDING' };
    expect(example.orderId).toBe('o1');
  });
});
