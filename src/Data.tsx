import { autorun, makeAutoObservable } from "mobx";
import { createContext, useContext } from "react";
import { assert } from "ts-pystyle";
import { v4 } from "uuid";
import { constructClass, patchedData } from "./common";
import { Timer } from "./temp";
import { List } from "immutable";
import { IDXDB } from "./database";
import { addItem, getItem, updateItem } from "./Apis";
/**
 * 不保存实际数据只是用来显示的
 */
export class ExecuteInfo {
  public startTime: Date = null;
  public doneTime: Date = null;
}
/**
 * 代表一个事项
 */
export class TaskItem {
  public id: string = v4();
  public name: string;
  /**
   * markdown 显示为富文本
   */
  public description: string = "";
  public pushTime: Date = new Date();
  public doneTime: Date = new Date();
  public done: boolean = false;
  /**
   * 所属的list的id
   */
  public listId: string = null;
  //执行信息
  // public executeRecords: ExecuteInfo[];
}

/**
 * 代表一个列表
 */
export class ListInfo {
  public id: string = v4();
  public name: string = "";
  //添加时间
  public pushTime: Date = new Date();
  //谁添加的
  public pushUser: string = "";
}
(async function () {
  console.log(new TaskItem());
})();

class UserInfo {
  name: string;
}
/**
 * 计时器
 */
const timer = new Timer();
type RunningState = "ready" | "running" | "paused" | "stopped";

/**
 * 主容器 时刻记住其中的所有内容都是用来显示的
 */
class MainStore {
  constructor() {
    makeAutoObservable(this);
  }

  //全局应用状态
  public userInfo: UserInfo = constructClass(UserInfo, {
    name: "gaozijian"
  });
  public login() {}
  public register() {}
  //侧边栏的收起状态
  public isSideBarShow = true;
  public sideBarHide() {
    this.isSideBarShow = false;
  }
  public sideBarShow() {
    this.isSideBarShow = true;
  }
  //关于zen模式

  /**
   * 列表管理
   */
  public nowListID = null;
  //当前正在执行的事项 定义为
  public nowExecutingItemId: string = null;
  public nowExecutingItem = null as TaskItem;

  //执行状态
  public executingState = {
    state: "ready" as RunningState,
    //单位 秒 表示已经执行的时间
    time: 0,
    //表示开始执行的时间
    startTime: null as Date
  };
  /**
   * 计时部分
   */
  private start() {
    timer.interval = 1000;
    timer.on("tick", () => {
      this.executingState.time++;
    });
    timer.start();
    this.executingState.state = "running";
  }
  private pause() {
    timer.pause();
    this.executingState.state = "paused";
  }
  private stop() {
    this.executingState.state = "stopped";
    timer.stopAndInit();
  }
  /**
   * 把执行状态恢复
   */
  private reset() {
    this.executingState.startTime = null;
    this.executingState.state = "ready";
    this.executingState.time = 0;
    // timer.stopAndInit();
  }
  //查看item详情的部分

  /**
   * 当前显示的列表
   * @param listidx 列表的idx
   */
  public async enterList(listidx: string) {
    assert(this.nowListID == null);
    // assert(
    //   (await listTable.findOne({ id: listidx })) != null,
    //   "没有此id的item"
    // );
    this.nowListID = listidx;
    console.log(this.nowListID);
  }
  public leaveList() {
    assert(this.nowListID != null);
    //如果当前有正在执行的list 那么离开list的时候就要取消执行
    if (this.nowExecutingItemId) {
      this.cancelExecute();
    }
    this.nowListID = null;
  }

  /**
   * 开始执行一个列表 从一个项开始
   * @param listname 列表名
   * @param itemname 列表中的项目id
   */
  public async executeItem(id: string) {
    assert(this.executingState.state == "ready", "正在执行");
    this.nowExecutingItemId = id;
    this.nowExecutingItem = await getItem(id);
    this.start();
  }
  /**
   * 取消执行
   */
  public cancelExecute() {
    this.stop();
    this.nowExecutingItemId = null;
    this.nowExecutingItem = null;
    this.reset();
  }
  /**
   * 当前项执行完成
   */
  public async executeDone() {
    this.stop();
    //记录执行信息到item上
    // this.nowExecutingItem.executeRecords.push({
    //   startTime: this.executingState.startTime,
    //   doneTime: new Date()
    // });

    this.nowExecutingItem.done = true;
    this.nowExecutingItem.doneTime = new Date();

    //提交数据
    await updateItem(this.nowExecutingItemId, this.nowExecutingItem);
    //清理数据
    this.nowExecutingItemId = null;
    this.nowExecutingItem = null;
    this.reset();
  }
}
//配置
const mainstore = new MainStore();

//上下文
const context = createContext<MainStore>(null);
export function MainContainer({ children }) {
  return <context.Provider value={mainstore}>{children}</context.Provider>;
}
export function useMainStore() {
  return useContext(context);
}
