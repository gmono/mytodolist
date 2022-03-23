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
import dayjs from "dayjs";
import { useLocalStore, useObserver } from "mobx-react";
import { useRef } from "react";
import { useHistory } from "react-router";
import { useMainStore } from "./Data";

const theme = getTheme();
const { palette } = theme;
/**
 * 主页 显示个人信息和列表
 * 路径/
 */
export function MainPlane() {
  const inputref = useRef<HTMLInputElement>();
  const mainstore = useMainStore();
  const store = useLocalStore(() => ({
    nowEditingList: ""
  }));
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
          items={mainstore.lists.toArray()}
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
              mainstore.addList(store.nowEditingList);
              store.nowEditingList = "";
            }}
          >
            添加
          </PrimaryButton>
        </Stack>
      </Stack>
    </div>
  ));
}
