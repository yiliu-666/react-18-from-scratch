import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { HostComponent, HostRoot, HostText, FunctionComponent, ContextProvider } from "./ReactWorkTags";
import { Ref, NoFlags, Update } from "./ReactFiberFlags";
import { NoLanes, mergeLanes } from './ReactFiberLane';

function markRef(workInProgress) {
  workInProgress.flags |= Ref;
}

function bubbleProperties(completedWork) {
  let newChildLanes = NoLanes;
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  while (child !== null) {
    newChildLanes = mergeLanes(newChildLanes, mergeLanes(child.lanes, child.childLanes));
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.childLanes = newChildLanes;
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
function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}
function updateHostComponent(current, workInProgress, type, newProps) {
  const oldProps = current.memoizedProps;
  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}
export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent: {
      const { type } = workInProgress;
      //
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(current, workInProgress, type, newProps);
        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        const instance = createInstance(type, newProps, workInProgress);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
        finalizeInitialChildren(instance, type, newProps);
        if (workInProgress.ref !== null) {
          markRef(workInProgress);
        }
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case FunctionComponent:
      bubbleProperties(workInProgress);
      break;
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostText: {
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText);
      bubbleProperties(workInProgress);
      break;
    }
    case ContextProvider: {
      bubbleProperties(workInProgress);
      break;
    }
    default:
      break;
  }
}