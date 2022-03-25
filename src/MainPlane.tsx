import {
  Button,
  PrimaryButton,
  TextField,
  Stack,
  List,
  getTheme,
  mergeStyleSets,
  mergeStyles
} from "@fluentui/react";
import { useDynamicList } from "ahooks";
import dayjs from "dayjs";
import { useLocalStore, useObserver } from "mobx-react";
import { CSSProperties, useEffect, useRef } from "react";
import { useHistory } from "react-router";
import { addList, getAllList } from "./Apis";
import { constructClass } from "./common";
import { ListInfo, useMainStore } from "./Data";

const theme = getTheme();
const { palette } = theme;

function ListCell({
  item,
  onClick,
  state,
  className
}: {
  item: ListInfo;
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
 * 主页 显示个人信息和列表
 * 路径/
 */
export function MainPlane() {
  const mainstore = useMainStore();
  const store = useLocalStore(() => ({
    nowEditingList: ""
  }));
  const list = useDynamicList([]);
  function refresh() {
    getAllList().then((v) => {
      list.resetList(v);
    });
  }
  useEffect(refresh, []);
  if (mainstore.nowListID != null) {
    mainstore.leaveList();
  }
  return useObserver(() => (
    <div
      style={{
        display: mainstore.nowListID == null ? "block" : "none",
        width: "100%",
        padding: "15px"
      }}
    >
      <div className={mergeStyles(theme.fonts.xxLarge, { textAlign: "left" })}>
        任务列表
      </div>
      <Stack tokens={{ childrenGap: 20 }} style={{ marginTop: 30 }}>
        <List
          // style={{ maxHeight: "80vh" }}
          items={list.list}
          onRenderCell={(v, idx) => (
            <ListCell
              state="未完成"
              className={mergeStyles({
                marginTop: 20
              })}
              key={idx}
              onClick={() => mainstore.enterList(v.id)}
              item={v}
            ></ListCell>
          )}
        />
        <Stack
          horizontal
          tokens={{ childrenGap: 10 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ width: 24 }} />
          <Stack.Item grow>
            <TextField
              type="text"
              value={store.nowEditingList}
              onChange={(e, newvalue) => {
                store.nowEditingList = newvalue;
              }}
            />
          </Stack.Item>

          {/* <Button primary={false}>CESHI</Button> */}
          <PrimaryButton
            onClick={() => {
              addList(
                constructClass(ListInfo, {
                  name: store.nowEditingList
                })
              ).then(() => {
                store.nowEditingList = "";
                refresh();
              });
            }}
          >
            添加
          </PrimaryButton>
        </Stack>
      </Stack>
    </div>
  ));
}
