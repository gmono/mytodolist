import clone from "clone";
//工具函数 如何让class和纯对象互相转换
export type RecordOf<T extends object> = { [i in keyof T]: T[i] };
export function getData<T extends object>(obj: T): RecordOf<T> {
  return Object.assign({}, obj);
}
export function constructClass<T extends object>(
  consturctor: new () => T,
  data: Partial<RecordOf<T>>
): T {
  return Object.assign(new consturctor(), data);
}
export function patchedData<T>(obj: T, patch: Partial<T>): T {
  return Object.assign(clone(obj), patch);
}
/**
 * 实现对class构造器的参数获取
 */
export type ConsturctorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never;
