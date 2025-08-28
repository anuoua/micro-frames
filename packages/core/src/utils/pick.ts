/**
 * 从对象中选择指定的属性，返回一个新对象
 * @param object - 源对象
 * @param paths - 需要选择的属性路径，可以是字符串或字符串数组
 * @returns 包含选定属性的新对象
 */
function pick<T extends object, K extends keyof T>(
  object: T,
  paths: K | K[]
): Pick<T, K>;

function pick<T extends object>(
  object: T,
  paths: (string | number | symbol) | (string | number | symbol)[]
): Partial<T>;

function pick<T extends object>(
  object: T,
  paths:
    | (keyof T | string | number | symbol)
    | (keyof T | string | number | symbol)[]
): any {
  // 处理边界情况
  if (object === null || object === undefined) {
    return {};
  }

  // 标准化 paths 为数组
  const keys = Array.isArray(paths) ? paths : [paths];

  // 创建结果对象
  const result = {} as Partial<T>;

  // 遍历所有指定的键
  for (const key of keys) {
    result[key as keyof T] = object[key as keyof T];
  }

  return result;
}

export { pick };
