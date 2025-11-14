

import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue.js"
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop.js"
import { createFiberRoot } from "./ReactFiberRoot";
export function createContainer(containerInfo) {
    return createFiberRoot(containerInfo);
}

export function updateContainer(element, container) {
    //获取当前的fiber 根
    const current = container.current;
    //创建更新

    const update = createUpdate();


    update.payload = { element };
    //入队
    const root = enqueueUpdate(current, update);

    scheduleUpdateOnFiber(root);
}