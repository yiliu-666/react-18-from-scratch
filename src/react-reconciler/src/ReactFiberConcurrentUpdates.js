import { HostRoot } from "./ReactWorkTags";
const concurrentQueues = [];
let concurrentQueuesIndex = 0;
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  // 1. 初始化当前节点
  // node = sourceFiber; // 当前 fiber
  let node = sourceFiber;

  // 2. 获取父 Fiber 节点
  // parent = sourceFiber.return; // 当前 fiber 父 fiber
  let parent = sourceFiber.return;

  // 3. 循环向上遍历 Fiber 树，直到根节点
  while (parent !== null) {
    node = parent;
    parent = parent.return; // return 属性指向父 Fiber
  } // 一直找到 parent 为 null

  // 4. 检查找到的顶级节点是否是 HostRoot
  // HostRoot 对应 ReactDOM.createRoot() 创建的 Fiber 节点
  if (node.tag === HostRoot) {
    // 5. 如果是 HostRoot，返回其 stateNode（即 FiberRootNode 实例）
    return node.stateNode;
  }

  // 6. 如果找不到有效的根，返回 null
  return null;
}

export function enqueueConcurrentHookUpdate(fiber, queue, update) {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
}
function enqueueUpdate(fiber, queue, update) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
}
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  return node.tag === HostRoot ? node.stateNode : null;
}


//冲洗（flush）阶段：把之前缓存在 concurrentQueues 的所有 (fiber, queue, update) 一次性真正挂到各自的 Hook 更新队列上。
export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;
  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueues[i++];
    const queue = concurrentQueues[i++];
    const update = concurrentQueues[i++];
    if (queue !== null && update !== null) {
      const pending = queue.pending;
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
    }
  }
}
