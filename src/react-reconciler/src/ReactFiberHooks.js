import ReactSharedInternals from "shared/ReactSharedInternals";

import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    queue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
function dispatchReducerAction(fiber, queue, action) {
   const update = {
    action,
    next: null,
  };
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root, fiber);
}
const HooksDispatcherOnMountInDEV = {
  useReducer: mountReducer
};
function mountReducer(reducer, initialArg) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue));
  return [hook.memoizedState, dispatch];
}
export function renderWithHooks(current, workInProgress, Component, props) {
  currentlyRenderingFiber = workInProgress;
  if (current !== null && current.memoizedState !== null) {
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;//对象
  }
  const children = Component(props);
  currentlyRenderingFiber = null;
  return children;
}