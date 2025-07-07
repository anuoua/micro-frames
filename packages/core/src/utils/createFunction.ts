import Framebus from "framebus";

export const createFunction = <Args extends Array<any>, Res>(
  framebus: Framebus,
  key: string,
  handler: (...args: Args) => Res
) => {
  type SubFn = undefined extends []
    ? () => Promise<Res>
    : (...args: Args) => Promise<Res>;

  return {
    regist: () => {
      framebus.on(key, async function () {
        if (arguments.length === 1) {
          // @ts-expect-error
          arguments[0](await handler());
        } else {
          arguments[1](await handler(...arguments[0]));
        }
      });
    },
    emit: ((...args) => framebus.emitAsPromise<Res>(key, args as any)) as SubFn,
  } as const;
};
