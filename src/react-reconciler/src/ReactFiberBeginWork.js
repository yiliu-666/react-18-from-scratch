import { HostRoot, HostComponent, HostText, IndeterminateComponent, FunctionComponent } from './ReactWorkTags';


import { processUpdateQueue } from './ReactFiberClassUpdateQueue';


import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber';
import { shouldSetTextContent } from "../../react-dom-bindings/src/client/ReactDOMHostConfig";
import { renderWithHooks } from "./ReactFiberHooks";
/**
 * 
 * @param {*} current 
 * @param {*} workInProgress 
 * @param {*} nextChildren 
 */
function reconcileChildren(current, workInProgress, nextChildren) {
    //判断是否是有老fiber
    if (current === null) {
        //这样的话直接挂载到新的节点下
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else {
        //老的fiber的子链表与 新的子虚拟dom进行比较  dom-diff(所以 dom-diff是使用虚拟DOM)
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}



function updateHostRoot(current, workInProgress) {
    //核心目的： 处理并消耗 (consume) 存储在 HostRootFiber 更新队列中的所有更新，并计算出该 Fiber 节点的新状态。
    processUpdateQueue(workInProgress);// 是想要把更新队列里面的所有更新放入memoizedState中,

    const nextState = workInProgress.memoizedState;

    const nextChildren = nextState.element;

    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;

}

function updateHostComponent(current, workInProgress) {
    const { type } = workInProgress;
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;

    const isDirectTextChild = shouldSetTextContent(type, nextChildren);
    if (isDirectTextChild) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;

}

function mountIndeterminateComponent(current, workInProgress, Component) {
    const props = workInProgress.pendingProps;
    const value = renderWithHooks(null, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(current, workInProgress, value);
    return workInProgress.child;
}
function updateFunctionComponent(current, workInProgress, Component, nextProps) {
    const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps);
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

export function beginWork(current, workInProgress) {
    switch (workInProgress.tag) {
        case IndeterminateComponent:
            return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
        case FunctionComponent: {
            const Component = workInProgress.type;
            const resolvedProps = workInProgress.pendingProps;
            return updateFunctionComponent(current, workInProgress, Component, resolvedProps);
        }
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
        case HostText:
            return null;
        default:
            return null;
    }
}
