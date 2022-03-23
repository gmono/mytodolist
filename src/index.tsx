import { useLocalStore, useObserver } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { assert, delay, json } from "ts-pystyle";
import { value, validate, TypeDef, TypeOf } from "ts-metatype";

import { binding, pack } from "react-binding-value";
import { MainContainer } from "./Data";
import App from "./App";

const rootElement = document.getElementById("root");
render(
  <MainContainer>
    <App />
  </MainContainer>,
  rootElement
);
