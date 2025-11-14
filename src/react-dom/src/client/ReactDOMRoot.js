import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/ReactFiberReconciler';
import { listenToAllSupportedEvents } from "react-dom-bindings/src/events/DOMPluginEventSystem";

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
  // children = { $$typeof: Symbol(react.element), type: ... } // 示例注释，表示children通常是React Element
  const root = this._internalRoot; // root = FiberRootNode { containerInfo: div#root, current: FiberNode } // 示例注释
  root.containerInfo.innerHTML = "";
  updateContainer(children, root);
};

export function createRoot(container) { // div#root
  const root = createContainer(container);
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(root);
}