import { v4 } from "uuid";
import { patchedData } from "./common";
import { ListInfo, TaskItem } from "./Data";
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
  return (await listTable.find({}).toArray()) as ListInfo[];
}
export async function addList(info: ListInfo) {
  await listTable.insert(info);
}
export async function getItemsOfList(listid: string) {
  return await itemTable.find({ listId: listid } as TaskItem).toArray();
}
export async function getListInfo(id: string) {
  return await listTable.findOne({ id });
}
/**
 * 获取一个任务
 * @param id 任务id
 */
export async function getItem(id: string) {
  return (await itemTable.findOne({ id })) as TaskItem;
}
/**
 * 更新item 不能改变id
 * @param id itemid
 * @param item 要更新的item信息，不能改变id
 */
export async function updateItem(id: string, item: TaskItem) {
  return await itemTable.update({ id }, patchedData(item, { id }));
}

/**
 * 返回id
 * @param item 信息
 */
export async function addItem(item: TaskItem) {
  const id = v4();
  await itemTable.insert(patchedData(item, { id }));
  return id;
}
