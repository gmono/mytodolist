import "./styles.css";
import { useLocalStore, useObserver } from "mobx-react";
import {
  createContext,
  CSSProperties,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { assert, delay, json } from "ts-pystyle";
import { value, validate, TypeDef, TypeOf } from "ts-metatype";

import { binding, pack } from "react-binding-value";
import { useDynamicList, useInterval } from "ahooks";
import { useTimer } from "react-use-precision-timer";
// import { EventEmitter, Listener } from "events";
import {
  MemoryRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch
} from "react-router";
import { BrowserRouter, HashRouter } from "react-router-dom";
/**
 * 导入各种数据和库
 */
import { TaskItem, useMainStore } from "./Data";

import { MainPlane } from "./MainPlane";
import { ItemsPalne } from "./ItemsPalne";
import styles from "styled-components";

import img from "./assets/ok.gif";

//导入fluentui
// import { PrimaryButton, Button } from "@fluentui/react";

/**
 * 侧边栏
 * @param props 属性
 */
function SidePlane(props: {
  show: boolean;
  style?: CSSProperties;
  children?: any;
}) {
  const css = {
    display: props.show ? "block" : "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%"
  } as CSSProperties;
  return (
    <div style={props.style ? { ...css, ...props.style } : css}>
      {props.children}
    </div>
  );
}

/**
 * 侧边栏
 */
function SideBar() {
  const mainstore = useMainStore();
  const css = {
    width: "100%",
    height: 80,
    textAlign: "center"
  } as CSSProperties;
  const Div = styles.div({
    width: "100%",
    height: 80,
    textAlign: "center",
    lineHeight: "80px",
    verticalAlign: "middle",
    cursor: "pointer",
    "&:hover": {
      background: "red"
    }
  });
  const 头像 = styles.div({
    width: 50,
    height: 50,
    verticalAlign: "middle",
    lineHeight: "80px",
    cursor: "pointer",
    "&:hover": {
      boxShadow: "black 0 0 5px 0"
    }
  });
  return (
    <div
      style={{
        height: "100%",
        width: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid black",
        placeSelf: "stretch"
      }}
    >
      <头像 style={css} onClick={() => mainstore.sideBarHide()}>
        头像
      </头像>
      <hr />
      <Div style={css}>splite</Div>
      <Div style={css}>列表</Div>
      <Div style={css}>统计</Div>
    </div>
  );
}
/**
 * 页面
 */
export default function App() {
  let mainstore = useMainStore();
  //更改属性
  /**
   * 全局数据容器
   */
  let store = useLocalStore(() => ({
    nowExe: -1,
    get isShowPlane() {
      return store.nowExe != -1;
    },
    allTime: 0.1 * 60 * 1000,
    restTime: 0,
    state: "waiting",
    taskitems: [] as TaskItem[],

    /**
     * 完成一个任务
     * @param idx 要完成的任务的索引
     */
    taskDone(idx: number) {
      assert(idx < store.taskitems.length, "不存在这个item");
      assert(store.taskitems[idx].done == false, "不要重复完成任务");
      store.taskitems[idx].done = true;
    },
    nowEditingList: "",
    nowEditingItem: ""
    //
  }));
  //method区域

  return useObserver(() => (
    <div
      className="App"
      style={{
        display: "flex",
        alignItems: "stretch",
        height: "100vh"
        // overflow: "hidden"
      }}
    >
      {mainstore.nowListID == null ? <MainPlane /> : <ItemsPalne />}
      {/* 侧边栏 用来显示用户头像和工具栏 */}
      {/* <SideBar /> */}
    </div>
  ));
}
