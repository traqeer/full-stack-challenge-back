export type SafeResult<T> = [T, null] | [null, Error];

export function safe<T>(input: Promise<T>): Promise<SafeResult<T>> {
  return input
    .then(value => [value, null] as SafeResult<T>)
    .catch(err => [null, err instanceof Error ? err : new Error(String(err))]);
}
