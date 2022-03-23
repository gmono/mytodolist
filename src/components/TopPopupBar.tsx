/**
 * 顶部弹出层
 */

import React, { CSSProperties } from "react";
interface ContainerProps extends React.HTMLAttributes<"div"> {}
/**
 * 一个封闭容器 允许里面的绝对定位相对自己定位 属于复合容器
 * @param param0
 */
export function Container({ style, children, ...rest }: ContainerProps) {
  return (
    <div style={{ ...style, contain: "layout" }}>
      <div
        style={{ position: "relative", width: "100%", height: "100%" }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 顶部弹出栏
 * @param param0
 */
export function TopPopupBar({ isShow, children, onClick }) {
  const css = {
    display: isShow ? "block" : "none",
    // position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    background: "red"
  } as CSSProperties;
  return (
    <Container style={css} onClick={onClick}>
      {children}
    </Container>
  );
}
