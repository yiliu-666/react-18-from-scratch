import { createHostRootFiber } from "./ReactFiber.js"
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue";



function FiberRootNode(containerInfo) {

    this.containerInfo = containerInfo;

}


export function createFiberRoot(containerInfo) {
    const root = new FiberRootNode(containerInfo);
    const uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    initializeUpdateQueue(uninitializedFiber);
    return root;
}