import { describe, expect, it } from 'vitest';
import { runSyncCycle } from '../../src/sync-cycle';

describe('runSyncCycle', () => {
  it('returns processed and dead-letter metrics from dependencies', async () => {
    const result = await runSyncCycle({
      runRetryWorker: async () => 4,
      readDeadLetterCount: async () => 2,
    });

    expect(result).toEqual({ processed: 4, deadLetterCount: 2 });
  });
});
