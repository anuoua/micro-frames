const fnMap = new WeakMap<any, any[]>();

export const createContext = <C extends Record<string, any>>(
  defaultValue: C
) => {
  const runWithContextValue = <T extends (...args: any) => any>(
    fn: T,
    ctxValue: C
  ) => {
    return ((...args) => {
      const res = fnMap.get(ctx);

      if (res) {
        fnMap.set(ctx, [...res, ctxValue]);
      } else {
        fnMap.set(ctx, [ctxValue]);
      }

      let ret: any;
      let err: any;

      try {
        ret = fn(...args);
      } catch (e) {
        err = e;
      } finally {
        const ctxs = [...(fnMap.get(ctx) ?? [])];
        ctxs.pop();
        fnMap.set(ctx, ctxs);
      }

      if (err) {
        throw err;
      }

      return ret;
    }) as T;
  };

  const getContextValue = () => {
    return (fnMap.get(ctx)?.[0] || defaultValue) as unknown as C | undefined;
  };

  const ctx = {
    runWithContextValue,
    getContextValue,
  };

  return ctx;
};
