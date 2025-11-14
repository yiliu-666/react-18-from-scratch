import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement, FiberNode, createFiberFromText } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags"
import isArray from "shared/isArray";
import { HostText } from "./ReactWorkTags";

/**
 * shouldTrackSideEffects  是否追踪副作用
 * 
 * 思想： 使用一个外部函数 (createChildReconciler) 接收配置参数 (shouldTrackSideEffects)
 * ，然后返回一个内部函数 (reconcileChildFibers)。

用途： 避免在核心函数内部传递和检查配置（如 if (isMounting) { ... }）。
相反，您创建两个独立的、预配置好的函数：mountChildFibers (配置为 false) 和 reconcileChildFibers (配置为 true)。
 * 
 */
function createChildReconciler(shouldTrackSideEffects) {
    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }
    function placeSingleChild(newFiber) {
        if (shouldTrackSideEffects) newFiber.flags |= Placement;
        return newFiber;
    }
    function reconcileSingleTextNode(returnFiber, currentFirstChild, content) {
        const created = new FiberNode(HostText, { content }, null);
        created.return = returnFiber;
        return created;
    }
    function createChild(returnFiber, newChild) {
        if ((typeof newChild === "string" && newChild !== "") || typeof newChild === "number") {
            const created = createFiberFromText(`${newChild}`);
            created.return = returnFiber;
            return created;
        }

        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    const created = createFiberFromElement(newChild);
                    created.return = returnFiber;
                    return created;
                }
                default:
                    break;
            }
        }
        return null;
    }
    function placeChild(newFiber, newIndex) {
        newFiber.index = newIndex;
        if (shouldTrackSideEffects) newFiber.flags |= Placement;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        let resultingFirstChild = null;
        let previousNewFiber = null;
        let newIdx = 0;
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = createChild(returnFiber, newChildren[newIdx]);
            if (newFiber === null) {
                continue;
            }
            placeChild(newFiber, newIdx);
            if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
        return resultingFirstChild;
    }
    /**
     * placeSingleChild 负责给这个 child fiber 打上“要不要插入”的 flag（Placement）
     * @param {*} returnFiber 
     * @param {*} currentFirstChild 
     * @param {*} newChild 
     * @returns 
     */
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
        if (typeof newChild === "object" && newChild !== null) {  //需要注意的是null也是一个object类型
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
                }
                default:
                    break;
            }
            if (isArray(newChild)) {
                return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
            }
        }
        if (typeof newChild === "string") {
            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, newChild));
        }
        return null;
    }
    return reconcileChildFibers;
}
export const reconcileChildFibers = createChildReconciler(true);
export const mountChildFibers = createChildReconciler(false);