import {
    HostRoot, HostComponent, HostText, IndeterminateComponent,
    FunctionComponent, ContextProvider
} from "./ReactWorkTags";
import { processUpdateQueue, cloneUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";
import { NoLanes } from './ReactFiberLane';
import { pushProvider } from './ReactFiberNewContext';

function reconcileChildren(current, workInProgress, nextChildren) {
    if (current === null) {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}
function updateHostRoot(current, workInProgress, renderLanes) {
    const nextProps = workInProgress.pendingProps;
    cloneUpdateQueue(current, workInProgress);
    processUpdateQueue(workInProgress, nextProps, renderLanes)
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
function updateHostComponent(current, workInProgress) {
    const { type } = workInProgress;
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps);
    if (isDirectTextChild) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
function mountIndeterminateComponent(_current, workInProgress, Component) {
    const props = workInProgress.pendingProps;
    const value = renderWithHooks(null, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, value);
    return workInProgress.child;
}
function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
    const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, renderLanes);
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
export function beginWork(current, workInProgress, renderLanes) {
    workInProgress.lanes = NoLanes;
    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderLanes);
        }
        case FunctionComponent: {
            const Component = workInProgress.type;
            const resolvedProps = workInProgress.pendingProps;
            return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);
        }
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
        case HostComponent:
            return updateHostComponent(current, workInProgress, renderLanes);
        case HostText:
            return null;
        case ContextProvider:
            return updateContextProvider(current, workInProgress, renderLanes);
        default:
            return null;
    }
}

function updateContextProvider(current, workInProgress, renderLanes) {
    const providerType = workInProgress.type;
    const context = providerType._context;
    const newProps = workInProgress.pendingProps;
    const newValue = newProps.value;
    pushProvider(context, newValue);
    const newChildren = newProps.children;
    reconcileChildren(current, workInProgress, newChildren, renderLanes);
    return workInProgress.child;
}