import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { MutationMask, NoFlags } from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "./ReactFiberCommitWork";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";
let workInProgress = null;
export function scheduleUpdateOnFiber(root) {//  后面这里还会有一个lane参数
  //这会把根标记为“有工作”，并调用 ensureRootIsScheduled(root) 去安排一次渲染任务（同步或并发）。
  ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}
function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
}
function commitRoot(root) {
  const { finishedWork } = root;
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  if (subtreeHasEffects || rootHasEffect) {
   commitMutationEffectsOnFiber(finishedWork, root);
  }
  root.current = finishedWork;
}
function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null);
  finishQueueingConcurrentUpdates();
}
function renderRootSync(root) {
  prepareFreshStack(root);
  workLoopSync();
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
/**
 * beginWork()：向下，生成或复用子 Fiber；
 * completeUnitOfWork()：向上，处理完成的 Fiber；
 * @param {*} unitOfWork 
 */
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  console.log("beginwork",unitOfWork);
  const next = beginWork(current, unitOfWork); 
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    completeUnitOfWork(unitOfWork);
    console.log(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    completeWork(current, completedWork);
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}