import { useLocalStore, useObserver } from "mobx-react";
import { useCallback, useEffect, useRef } from "react";
import { assert, json } from "ts-pystyle";
import { useHistory, useParams } from "react-router";
import { ListInfo, TaskItem, useMainStore } from "./Data";
import { CSSTransition } from "react-transition-group";
import { Container, TopPopupBar } from "./components/TopPopupBar";
import {
  ActionButton,
  Button,
  ButtonType,
  DefaultButton,
  getTheme,
  List,
  mergeStyles,
  Panel,
  PrimaryButton,
  Stack,
  TextField
} from "@fluentui/react";
import { CSSProperties } from "styled-components";
import dayjs from "dayjs";
import { useDynamicList } from "ahooks";
import { addItem, getItemsOfList, getListInfo, updateItem } from "./Apis";
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
  const color = {
    已完成: "#aaffaaaa",
    执行中: "#ffff0033",
    未完成: "#ffffffff"
  };
  return (
    <div
      onClick={() => onClick()}
      className={`${mergeStyles({
        borderRadius: "10px",
        padding: "16px",
        background: color[state],
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
      <h3 style={{ marginBottom: 16 }}>{v.name}</h3>
      <div style={{ marginBottom: 8 }}>
        {dayjs(v.pushTime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
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
    面板是否展开: false,
    当前编辑的ItemIDX: -1,
    当前编辑的Item: null as TaskItem,
    编辑面板是否打开: false
  }));
  const items = useDynamicList<TaskItem>([]);
  function refresh() {
    getItemsOfList(mainstore.nowListID).then((v: TaskItem[]) => {
      // console.log(mainstore.nowListID, v);
      items.resetList(v);
    });
    //通知容器刷新数据
    mainstore.refreshItemInfo();
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

  const executeItem = useCallback(
    async (idx: number) => {
      //打开编辑对话框
      // alert(json(items.list));

      if (items.list[idx].done) {
        console.log("已经执行过了");
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
  /**
   * 点击执行 整个应用进行zen模式
   */
  const onItemClick = useCallback(
    (idx: number) => {
      store.编辑面板是否打开 = true;
      store.当前编辑的Item = items.list[idx];
      store.当前编辑的ItemIDX = idx;
    },
    [items, store]
  );
  const onEditClose = useCallback(() => {
    store.编辑面板是否打开 = false;
    store.当前编辑的Item = null;
    store.当前编辑的ItemIDX = -1;
  }, [store]);

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
          onClick={() => 展开面板()}
          className={classname(
            mergeStyles({
              // position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100px",
              zIndex: 999
            })
          )}
          style={{
            height: store.面板是否展开 ? "100vh" : 100,
            transition: "height 0.3s ease-in-out",
            overflow: "hidden",
            contain: "paint"
          }}
        >
          {/* 最上面的一栏 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexDirection: "column",
              alignItems: "center",
              background: "#f0f0f0",
              height: store.面板是否展开 ? "80vh" : 100,
              transition: "height 0.3s ease-in-out"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
                paddingTop: 10
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
                {/* 面板信息栏 */}
                <h3>正在执行：{mainstore.nowExecutingItem.name}</h3>
                <h4>
                  用时:
                  {dayjs(0)
                    .subtract(8, "hour")
                    .second(mainstore.executingState.time)
                    .format("HH:mm:ss")}
                </h4>
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
            <div style={{ background: "white" }}>
              {/* 这里是下面的内容区 用来显示当前正在执行的item和允许执行的操作 */}
            </div>
          </div>

          <div>{/* 内容 */}</div>
          {/* 下层面板 */}

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
  const onEditOk = useCallback(() => {
    const result = store.当前编辑的Item;
    onEditClose();
    //提交
    updateItem(result.id, result);
    refresh();
  }, []);
  // console.log(items);
  return useObserver(
    () =>
      store.nowListInfo && (
        <div style={{ flexGrow: 1 }}>
          <Panel
            isOpen={store.编辑面板是否打开}
            onDismiss={(e) => onEditClose()}
            headerText="任务详情"
            closeButtonAriaLabel="返回"
            onRenderFooterContent={() => (
              <Stack tokens={{ childrenGap: 24 }}>
                <DefaultButton
                  style={{
                    height: 64,
                    background: getTheme().palette.purpleLight
                  }}
                  onClick={() => {
                    executeItem(store.当前编辑的ItemIDX);
                    onEditOk();
                  }}
                >
                  执行
                </DefaultButton>
                <Stack horizontal tokens={{ childrenGap: 25 }}>
                  <PrimaryButton onClick={onEditOk} style={{ flexGrow: 1 }}>
                    保存
                  </PrimaryButton>
                  <DefaultButton onClick={onEditClose} style={{ flexGrow: 1 }}>
                    取消
                  </DefaultButton>
                </Stack>
              </Stack>
            )}
            // Stretch panel content to fill the available height so the footer is positioned
            // at the bottom of the page
            isFooterAtBottom={true}
          >
            {/* <h3>您的更改已实时保存</h3> */}
            {store.当前编辑的Item && (
              <Stack tokens={{ childrenGap: 8 }}>
                <TextField
                  label="名称"
                  onChange={(e, v) => (store.当前编辑的Item.name = v)}
                  value={store.当前编辑的Item.name}
                />
                <TextField
                  label="添加日期"
                  disabled
                  readOnly
                  value={dayjs(store.当前编辑的Item.pushTime).format(
                    "YYYY-MM-DD hh:mm:ss"
                  )}
                />
                <TextField
                  label="完成状态"
                  disabled
                  value={store.当前编辑的Item.done ? "已完成" : "未完成"}
                />
                <Stack.Item grow>
                  <TextField
                    label="附加信息"
                    value={store.当前编辑的Item.description}
                    multiline
                    // rows={10}
                    onChange={(e, v) => (store.当前编辑的Item.description = v)}
                    resizable={false}
                    rows={20}
                  />
                </Stack.Item>
              </Stack>
            )}
          </Panel>
          <Container
            style={{
              width: "100%",
              paddingTop: 0
            }}
          >
            {/* 顶部栏 */}
            {mainstore.nowExecutingItem == null ? (
              <div>
                <h2 style={{ marginTop: 24, marginLeft: 24 }}>
                  当前列表：{store.nowListInfo.name}
                </h2>
                <h3 style={{ marginTop: 12, marginLeft: 24 }}>
                  用户：{store.nowListInfo.pushUser}
                </h3>
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
                  onClick={() => onItemClick(idx)}
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
              tokens={{ childrenGap: 12 }}
            >
              <div style={{ width: 24 }} />
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
