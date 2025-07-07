import Framebus from "framebus";
import { createFunction } from "./createFunction";

export const createFunctions = <T extends Record<string, any>>(
  framebus: Framebus,
  obj: T
) => {
  type CF<K extends keyof T> = ReturnType<
    typeof createFunction<Parameters<T[K]>, Awaited<ReturnType<T[K]>>>
  >;

  const functions = {} as {
    [K in keyof T]: CF<K>["emit"];
  };

  const regists: (() => void)[] = [];

  const registFunctions = () => {
    regists.forEach((fn) => fn());
  };

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const { regist, emit } = createFunction(
        framebus,
        `function.${key}`,
        obj[key]
      );

      regists.push(regist);

      functions[key] = emit as any;
    }
  }

  return { registFunctions, functions };
};
