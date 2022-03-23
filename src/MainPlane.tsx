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
import { useEffect, useRef } from "react";
import { useHistory } from "react-router";
import { addList, getAllList } from "./Apis";
import { constructClass } from "./common";
import { ListInfo, useMainStore } from "./Data";

const theme = getTheme();
const { palette } = theme;
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
      <Stack tokens={{ childrenGap: 20 }}>
        <List
          items={list.list}
          onRenderCell={(v, idx) => (
            <div key={idx} onClick={() => mainstore.enterList(v.id)}>
              <div>{v.name}</div>
              <div>{dayjs(v.pushTime).format()}</div>
            </div>
          )}
        />
        <Stack horizontal tokens={{ childrenGap: 10 }}>
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
