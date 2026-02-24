export interface SyncCycleDependencies {
  runRetryWorker: () => Promise<number>;
  readDeadLetterCount: () => Promise<number>;
}

export interface SyncCycleResult {
  processed: number;
  deadLetterCount: number;
}

export const runSyncCycle = async (
  dependencies: SyncCycleDependencies,
): Promise<SyncCycleResult> => {
  const processed = await dependencies.runRetryWorker();
  const deadLetterCount = await dependencies.readDeadLetterCount();
  return {
    processed,
    deadLetterCount,
  };
};
