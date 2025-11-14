import assign from "shared/assign.js";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

export const UpdateState = 0;



export function initializeUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}
export function createUpdate() {
  const update = { tag: UpdateState };
  return update;
}

/**
 *   这里的算法逻辑是如何的呢？？  
 * @param {*} fiber 
 * @param {*} update 
 * @returns 
 */
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    //第一次挂更新，因为更新队列就只有一个节点， 所以update.next =update
    update.next = update;
  } else {
    // 第二次挂更新，因为更新队列已经有一个节点了，所以update.next = pending.next
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.shared.pending = update;
  return markUpdateLaneFromFiberToRoot(fiber);  // ！！！！！ // 2. 从这个fiber往上，把“有更新”的信息标记到整棵树（lanes），并返回根root

}




function getStateFromUpdate(update, prevState) {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update;
      const partialState = payload;
      return assign({}, prevState, partialState);
    }
    default:
      return prevState;
  }
}
export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;
  const pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate;
    while (update) {
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    workInProgress.memoizedState = newState;
  }
}
