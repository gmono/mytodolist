import { useLocalStore, useObserver } from "mobx-react";
import { useCallback, useEffect, useRef } from "react";
import { assert, json } from "ts-pystyle";
import { useHistory, useParams } from "react-router";
import { ListInfo, TaskItem, useMainStore } from "./Data";
import { CSSTransition } from "react-transition-group";
import { Container, TopPopupBar } from "./components/TopPopupBar";
import {
  ActionButton,
  DefaultButton,
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
import okimg from "./assets/ok.gif";
import doingimg from "./assets/doing.gif";
import classname from "classnames";
//顶栏用来显示执行状态
function TopBar() {
  const mainstore = useMainStore();
  // console.log(mainstore.nowExecutingItem);
  return mainstore.nowExecutingItem ? (
    <div style={{ border: "solid 1px black" }}>
      状态：{mainstore.executingState.state}
    </div>
  ) : (
    <div></div>
  );
}

function ItemCell({
  item,
  onClick,
  state,
  className
}: {
  item: TaskItem;
  onClick: () => void;
  state: string;
  className: string;
}) {
  const v = item;
  return (
    <div
      onClick={() => onClick()}
      className={`${mergeStyles({
        borderRadius: "10px",
        padding: "16px",
        background: state == "执行中" ? "#00aa0033" : "white",
        boxShadow: getTheme().semanticColors.cardShadow,
        paddingLeft: 20,
        "&:hover": {
          boxShadow: getTheme().semanticColors.cardShadowHovered
        } as CSSProperties,
        "& *": {
          cursor: "pointer",
          userSelect: "none"
        } as CSSProperties
      })} ${className}`}
    >
      <h3>{v.name}</h3>
      <div>{dayjs(v.pushTime).format("YYYY-MM-DD HH:mm:ss")}</div>
      <div>{state}</div>
    </div>
  );
}
/**
 * /list/id
 */
export function ItemsPalne() {
  const mainstore = useMainStore();
  const store = useLocalStore(() => ({
    nowEditingItem: "",
    nowListInfo: null as ListInfo,
    面板是否展开: false
  }));
  const items = useDynamicList<TaskItem>([]);
  function refresh() {
    getItemsOfList(mainstore.nowListID).then((v: TaskItem[]) => {
      // console.log(mainstore.nowListID, v);
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
  const onExecute = useCallback(
    async (idx: number) => {
      // alert(json(items.list));
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
      refresh();
    },
    [items]
  );

  function 执行面板() {
    function 展开面板() {
      store.面板是否展开 = true;
    }
    function 收起面板() {
      store.面板是否展开 = false;
      // alert(store.面板是否展开);
    }
    const h = store.面板是否展开 ? "80vh" : 100;
    return (
      <div>
        <div
          style={{
            height: store.面板是否展开 ? "100vh" : 100,
            transition: "height 1s ease-in-out"
          }}
        >
          占位符
        </div>
        <div
          onClick={() => 展开面板()}
          className={classname(
            mergeStyles({
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100px",
              zIndex: 999
            })
          )}
          style={{
            height: store.面板是否展开 ? "100vh" : 100,
            transition: "height 1s ease-in-out",
            overflow: "hidden",
            contain: "paint"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              background: "#eeeeee",
              height: store.面板是否展开 ? "80vh" : 100,
              transition: "height 1s ease-in-out"
            }}
          >
            <img
              src={doingimg}
              className={mergeStyles({
                height: 80,
                width: 80,
                // background: "red",
                marginLeft: "10%",
                marginRight: getTheme().spacing.l2
              })}
              alt="图标"
            />
            <Stack>
              <h1>正在执行：{mainstore.nowExecutingItem.name}</h1>
              <h2>
                用时:
                {dayjs(0)
                  .subtract(8, "hour")
                  .second(mainstore.executingState.time)
                  .format("HH:mm:ss")}
              </h2>
            </Stack>
            <Stack style={{ flexGrow: 1, marginLeft: 50, marginRight: 24 }}>
              <Stack style={{ justifyContent: "center", alignItems: "end" }}>
                <PrimaryButton
                  style={{ width: 128 }}
                  onClick={() => {
                    mainstore.executeDone();
                    refresh();
                  }}
                >
                  点击完成
                </PrimaryButton>
                <DefaultButton
                  style={{ marginTop: 10, width: 128 }}
                  onClick={() => {
                    mainstore.cancelExecute();
                    refresh();
                  }}
                >
                  点击取消
                </DefaultButton>
              </Stack>
            </Stack>
          </div>
          <div
            style={{
              height: "20vh",
              display: store.面板是否展开 ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center"
            }}
            onClick={(e) => {
              e.stopPropagation();
              收起面板();
            }}
            className={classname({
              "animate__animated animate__fadeIn": store.面板是否展开
            })}
          >
            <h1>点击收起</h1>
          </div>
        </div>
      </div>
    );
  }
  // console.log(items);
  return useObserver(
    () =>
      store.nowListInfo && (
        <div style={{ flexGrow: 1 }}>
          <Container
            style={{
              width: "100%",
              padding: 10,
              paddingTop: 0
            }}
          >
            {/* 顶部栏 */}
            {mainstore.nowExecutingItem == null ? (
              <div>
                <h1>{store.nowListInfo.name}</h1>
                <h2>{store.nowListInfo.pushUser}</h2>
                <h3>点击执行任务</h3>
              </div>
            ) : (
              <div className="animate__animated animate__bounce">
                {执行面板()}
              </div>
            )}

            {/* 列表 */}
            <List
              style={{ zIndex: -1 }}
              items={items.list}
              className={mergeStyles({
                paddingTop: getTheme().spacing.l1,
                paddingLeft: getTheme().spacing.l1,
                paddingRight: getTheme().spacing.l1
              })}
              onRenderCell={(v, idx) => (
                <ItemCell
                  className={classname(
                    mergeStyles({
                      marginBottom: 10
                    }),
                    "animate__animated animate__fadeInUp"
                  )}
                  item={v}
                  onClick={() => onExecute(idx)}
                  key={idx}
                  state={
                    mainstore.nowExecutingItemId == v.id
                      ? "执行中"
                      : v.done
                      ? "已完成"
                      : "未完成"
                  }
                />
              )}
            />
            {/* 输入部分 */}
            <Stack
              horizontal
              className={mergeStyles({
                marginTop: 50
              })}
            >
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

              <DefaultButton
                onClick={() => {
                  mainstore.leaveList();
                }}
              >
                返回
              </DefaultButton>
            </Stack>
          </Container>
        </div>
      )
  );
}
