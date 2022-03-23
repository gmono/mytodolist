import { Callback, Collection, Cursor, Db, ResultCallback } from "zangodb";

/**
 * 强类型idxdborm
 */
export class IDXDB<T> extends Db {
  constructor(
    name: string,
    scheme: {
      [k in keyof T]: {
        [kk in keyof T[k]]: boolean;
      };
    }
  ) {
    super(name, undefined, scheme);
  }

  // public collection(name: string) {
  //   let s = super.collection(name);
  // }
}

/**
 * Collection的包装器
 */
class IDXCollection implements Collection {
  constructor(protected col: Collection) {}
  name: string;

  aggregate(pipeline: Object[]): Cursor {}
  find(expr: Object, projection_spec?: Object): Cursor {}
  findOne(
    expr: Object,
    projection_spec?: Object,
    cb?: ResultCallback<Object>
  ): Promise<Object> {}
  insert(docs: Object | Object[], cb?: Callback): Promise<void> {}
  remove(expr: Object, cb?: Callback): Promise<void> {}
  update(expr: Object, spec: Object, cb?: Callback): Promise<void> {}
}
