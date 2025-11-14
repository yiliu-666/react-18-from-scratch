import { InterminateComponent, HostText, HostRoot, HostComponent } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";
export function FiberNode(tag, pendingProps, key) {

    this.tag = tag;
    this.key = key;
    this.type = null;

    this.stateNode = null;


    this.return = null;
    this.child = null;
    this.sibling = null;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;

    this.memoizedState = null;

    this.updateQueue = null;
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.alternate = null;

}


export function createFiber(tag, pendingProps, key) {
    return new FiberNode(tag, pendingProps, key);
}



export function createHostRootFiber() {
    return createFiber(HostRoot, null, null);  //HostRoot标签就是原生的根
}
/**
 * 创建工作单元
 * @param {FiberNode} current 当前fiber节点
 * @param {any} pendingProps 新的props

 */
export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        workInProgress = createFiber(current.tag, pendingProps, current.key);
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        workInProgress.pendingProps = pendingProps;
        workInProgress.type = current.type;
        workInProgress.flags = NoFlags;
        workInProgress.subtreeFlags = NoFlags;

    }
    workInProgress.child = current.child;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    return workInProgress;
}

/**
 * 根据虚拟DOM创建fiber节点
 * @param {} element 
 */
export function createFiberFromElement(element) {
    const { type, key, props } = element; // 从 React Element 中解构出关键属性
    const pendingProps = props;
    // 调用核心创建函数
    return createFiberFromTypeAndProps(type, key, pendingProps);
}

function createFiberFromTypeAndProps(type, key, pendingProps) {
    let tag = InterminateComponent; // 默认标签：待定组件 (用于函数组件或类组件初次渲染时，类型还未确定)
    // 调用底层的 createFiber 函数，它会创建一个基础的 Fiber 对象
    if (typeof type === "string") {
        tag = HostComponent;
    }
    const fiber = createFiber(tag, pendingProps, key);
    // 额外设置 type 属性，用于后续组件类型检查和渲染
    fiber.type = type;
    return fiber;
}

export function createFiberFromText(content) {
    return createFiber(HostText, content, null);
}

// export function createFiberFromTypeAndProps(type, key, pendingProps) {
//     let fiberTag = IndeterminateComponent;
//     if (typeof type === "string") {
//         fiberTag = HostComponent;
//     }
//     const fiber = createFiber(fiberTag, pendingProps, key);
//     fiber.type = type;
//     return fiber;
// }
// export function createFiberFromElement(element) {
//     const { type } = element;
//     const { key } = element;
//     const pendingProps = element.props;
//     const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
//     return fiber;
// }

// export function createFiberFromText(content) {
//     const fiber = createFiber(HostText, content, null);
//     return fiber;
// }