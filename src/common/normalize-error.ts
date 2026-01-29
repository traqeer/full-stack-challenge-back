export function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }

  if (typeof err === 'string') {
    return new Error(err);
  }

  if (typeof err === 'object' && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {
      return new Error('Unknown object error');
    }
  }

  return new Error(String(err));
}
