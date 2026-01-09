import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { NoTimestamp, createLaneMap, NoLanes } from 'react-reconciler/src/ReactFiberLane';

function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;
 this.expirationTimes = createLaneMap(NoTimestamp);
 this.expiredLanes = NoLanes;
}

export function createFiberRoot(containerInfo) {
  const root = new FiberRootNode(containerInfo);
  const uninitializedFiber = createHostRootFiber();
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);
  return root;
} 