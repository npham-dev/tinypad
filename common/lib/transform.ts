export const omit = <T, K extends keyof T>(record: T, keys: K[]) => {
  const shallowClone = { ...record };
  for (const key of keys) {
    delete shallowClone[key];
  }
  return shallowClone as Omit<T, K>;
};
