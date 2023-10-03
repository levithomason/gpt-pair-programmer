export const retryUntil = async <TReturn>(
  fn: () => Promise<TReturn>,
  condition: (result: TReturn) => Promise<boolean>,
  maxRetries = 3,
) => {
  let result = null;
  let retries = 0;

  while (!(await condition(result)) && retries < maxRetries) {
    result = await fn();
    retries++;
  }

  return result;
};
