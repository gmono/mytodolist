import { useLocalStore, useObserver } from "mobx-react";
import { useCallback, useEffect, useRef } from "react";
import { assert } from "ts-pystyle";
import { useHistory, useParams } from "react-router";
import { ListInfo, TaskItem, useMainStore } from "./Data";
import { Container, TopPopupBar } from "./components/TopPopupBar";
import {
  ActionButton,
  getTheme,
  List,
  mergeStyles,
  PrimaryButton,
  Stack,
  TextField
} from "@fluentui/react";
import { CSSProperties } from "styled-components";
import dayjs from "dayjs";
import { useDynamicList } from "ahooks";
import { addItem, getItemsOfList, getListInfo } from "./Apis";
//顶栏用来显示执行状态
function TopBar() {
  const mainstore = useMainStore();
  console.log(mainstore.nowExecutingItem);
  return mainstore.nowExecutingItem ? (
    <div style={{ border: "solid 1px black" }}>
      状态：{mainstore.executingState.state}
    </div>
  ) : (
    <div></div>
  );
}
/**
 * /list/id
 */
export function ItemsPalne() {
  const mainstore = useMainStore();
  const store = useLocalStore(() => ({
    nowEditingItem: "",
    nowListInfo: null as ListInfo
  }));
  const items = useDynamicList<TaskItem>([]);
  function refresh() {
    getItemsOfList(mainstore.nowListID).then((v: TaskItem[]) => {
      console.log(mainstore.nowListID, v);
      items.resetList(v);
    });
  }
  useEffect(() => {
    refresh();
  }, [mainstore.nowListID]);
  useEffect(() => {
    getListInfo(mainstore.nowListID).then((v: ListInfo) => {
      store.nowListInfo = v;
    });
  }, [mainstore.nowListID]);
  // // let local = useLocation();
  // /**
  //  * 当id改变时执行一些操作
  //  */
  // if (mainstore.nowListID != null && mainstore.nowListID != id) {
  //   mainstore.leaveList();
  //   mainstore.enterList(id);
  // } else if (mainstore.nowListID == null) {
  //   mainstore.enterList(id);
  // }
  // console.log(mainstore.nowListID, id);
  /**
   * 确保有可以处理的列表
   */
  // assert(mainstore.nowListID != null, "没有要处理的列表");

  /**
   * 点击执行 整个应用进行zen模式
   */
  const onExecute = useCallback(async (idx: number) => {
    if (items.list[idx].done) {
      alert("已经执行过了");
    } else {
      if (mainstore.nowExecutingItem != null) {
        //如果有正在执行的
        if (mainstore.nowExecutingItemId == items.list[idx].id) {
          //如果正在执行同一个
          alert("正在执行中");
        } else {
          //退出并执行
          await mainstore.executeDone();
          await mainstore.executeItem(items.list[idx].id);
        }
      } else {
        //如果没有正在执行的就直接执行
        await mainstore.executeItem(items.list[idx].id);
      }
    }
  }, []);
  // console.log(items);
  return useObserver(
    () =>
      store.nowListInfo && (
        <div style={{ flexGrow: 1 }}>
          <Container style={{ width: "100%", padding: 10, paddingTop: 0 }}>
            {mainstore.nowExecutingItem == null ? (
              <div>
                <h1>{store.nowListInfo.name}</h1>
                <h2>{store.nowListInfo.pushUser}</h2>
                <h3>点击执行任务</h3>
              </div>
            ) : (
              <div>
                <h1>正在执行：{mainstore.nowExecutingItem.name}</h1>
                <h2>
                  用时:
                  {dayjs(0)
                    .subtract(8, "hour")
                    .second(mainstore.executingState.time)
                    .format("HH:mm:ss")}
                </h2>
                <div>点击完成任务</div>
              </div>
            )}

            <List
              items={items.list}
              className={mergeStyles({
                paddingTop: getTheme().spacing.l1,
                paddingLeft: getTheme().spacing.l1,
                paddingRight: getTheme().spacing.l1
              })}
              onRenderCell={(v, idx) => (
                console.log("fasdfsassdgsdfgfasdfas"),
                (
                  <div
                    onClick={() => onExecute(idx)}
                    key={idx}
                    className={mergeStyles({
                      paddingLeft: 20,
                      "&:hover": {
                        boxShadow: getTheme().semanticColors.cardShadow
                      } as CSSProperties,
                      "& *": {
                        cursor: "pointer",
                        userSelect: "none"
                      } as CSSProperties
                    })}
                  >
                    <h3>{v.name}</h3>
                    <div>{v.pushTime.toString()}</div>
                    <div>
                      {mainstore.nowExecutingItemId == v.id
                        ? "执行中"
                        : v.done
                        ? "已完成"
                        : "未完成"}
                    </div>
                  </div>
                )
              )}
            />
            {/* 输入部分 */}
            <Stack horizontal>
              <Stack.Item grow>
                <TextField
                  type="text"
                  value={store.nowEditingItem}
                  onChange={(e, v) => (store.nowEditingItem = v)}
                />
              </Stack.Item>
              <PrimaryButton
                onClick={async () => {
                  await addItem(
                    Object.assign(new TaskItem(), {
                      name: store.nowEditingItem,
                      listId: mainstore.nowListID
                    } as Partial<TaskItem>)
                  );
                  store.nowEditingItem = "";
                  refresh();
                }}
              >
                添加
              </PrimaryButton>
              <ActionButton
                onClick={() => {
                  mainstore.leaveList();
                }}
              >
                返回
              </ActionButton>
            </Stack>
          </Container>
        </div>
      )
  );
}
