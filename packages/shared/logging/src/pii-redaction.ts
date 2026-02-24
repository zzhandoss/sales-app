export const redactPII = (payload: Record<string, unknown>): Record<string, unknown> => {
  const clone: Record<string, unknown> = { ...payload };
  const piiKeys = ['phone', 'email', 'token', 'apiKey', 'password'];
  for (const key of piiKeys) {
    if (key in clone) {
      clone[key] = '[REDACTED]';
    }
  }
  return clone;
};
