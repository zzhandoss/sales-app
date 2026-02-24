import { createLogger } from '@shared/logging';
import { createRuntimeDependencies } from '../../api/src/runtime/dependencies';
import { runSyncCycle } from './sync-cycle';

const logger = createLogger({ scope: 'worker' });

const pollIntervalMs = Number(process.env.SYNC_WORKER_POLL_MS ?? '5000');
const tenantIdForDeadLetterMetrics = process.env.WORKER_TENANT_ID ?? 'tenant-demo';

const dependencies = createRuntimeDependencies();

const runCycle = async (): Promise<void> => {
  const startedAt = Date.now();
  try {
    const result = await runSyncCycle({
      runRetryWorker: async () => dependencies.syncRetryWorker.run(),
      readDeadLetterCount: async () => {
        const deadLetters = await dependencies.listDeadLetterUseCase.execute(tenantIdForDeadLetterMetrics);
        return deadLetters.length;
      },
    });
    logger.info(
      {
        processed: result.processed,
        deadLetterCount: result.deadLetterCount,
        durationMs: Date.now() - startedAt,
      },
      'Sync cycle completed',
    );
  } catch (error) {
    logger.error({ err: error }, 'Sync cycle failed');
  }
};

void runCycle();
setInterval(() => {
  void runCycle();
}, pollIntervalMs);
