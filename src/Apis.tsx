import { ListInfo } from "./Data";
import { IDXDB } from "./database";

//存储
const db = new IDXDB<{
  listTable: ListInfo;
}>("listTable", {
  listTable: {
    id: true,
    name: true,
    pushTime: false,
    pushUser: false
  }
});
const db2 = new IDXDB("itemTable", {
  itemTable: {
    id: true,
    name: true,
    pushTime: true,
    done: true,
    listId: true,
    description: false,
    doneTime: false
  }
});
const listTable = db.collection("listTable");
const itemTable = db2.collection("itemTable");

/**
 * 获取所有列表信息
 */
export async function getAllList() {
  return await listTable.find({}).toArray();
}
/**
 * 获取一个任务
 * @param id 任务id
 */
export async function getItem(id: string) {
  return await itemTable.findOne({ id });
}
