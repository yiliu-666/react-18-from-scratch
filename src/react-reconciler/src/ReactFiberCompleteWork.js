import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
} from "../../react-dom-bindings/src/client/ReactDOMHostConfig";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";
// import logger, { indent } from "shared/logger";
function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.subtreeFlags |= subtreeFlags;
}

function appendAllChildren(parent, workInProgress) {
  // 我们只有创建的顶级fiber，但需要递归其子节点来查找所有终端节点
  let node = workInProgress.child;
  while (node !== null) {
    // 如果是原生节点，直接添加到父节点上
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
      // 再看看第一个节节点是不是原生节点
    } else if (node.child !== null) {
      // node.child.return = node
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    // 如果没有弟弟就找父亲的弟弟
    while (node.sibling === null) {
      // 如果找到了根节点或者回到了原节点结束
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    // node.sibling.return = node.return
    // 下一个弟弟节点
    node = node.sibling;
  }
}

export function completeWork(current, workInProgress) {

  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent: {
      const { type } = workInProgress;
      const instance = createInstance(type, newProps, workInProgress);// 这里不会一
      // 次性把所有 props 都 set 上去（有些走后面 finalize）
      appendAllChildren(instance, workInProgress);//hello 和 span标签是在这里添加的！
    
      workInProgress.stateNode = instance;
      finalizeInitialChildren(instance, type, newProps);//给 DOM 节点设置 className、style、事件监听等。
      bubbleProperties(workInProgress);//把所有子树上的 flags / subtreeFlags 合并到当前 Fiber 上。
      break;
    }
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostText: {
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText);
      bubbleProperties(workInProgress);
      break;
    }
    default:
      break;
  }
}