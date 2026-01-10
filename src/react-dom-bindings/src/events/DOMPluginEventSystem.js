import { allNativeEvents } from "./EventRegistry";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { addEventCaptureListener, addEventBubbleListener } from "./EventListener";
import getEventTarget from "./getEventTarget";
import getListener from "./getListener";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";

SimpleEventPlugin.registerEvents();
const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
//createRoot时，监听支持的原生事件。
export function listenToAllSupportedEvents(rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
        rootContainerElement[listeningMarker] = true;
        allNativeEvents.forEach((domEventName) => {
            listenToNativeEvent(domEventName, true, rootContainerElement);
            listenToNativeEvent(domEventName, false, rootContainerElement);
        });
    }
}
//实际执行
export function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    let eventSystemFlags = 0; // 冒泡 = 0 捕获 = 4
    if (isCapturePhaseListener) {
        eventSystemFlags |= IS_CAPTURE_PHASE;
    }
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}
function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
    if (isCapturePhaseListener) {
        addEventCaptureListener(targetContainer, domEventName, listener);
    } else {
        addEventBubbleListener(targetContainer, domEventName, listener);
    }
}
export function dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
) {
    dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer);
}

function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    const nativeEventTarget = getEventTarget(nativeEvent);
    const dispatchQueue = [];
    extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer
    );
    processDispatchQueue(dispatchQueue, eventSystemFlags);
}
//决定是正序（冒泡）还是倒序（捕获）执行回调
export function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    for (let i = 0; i < dispatchQueue.length; i++) {
        const { event, listeners } = dispatchQueue[i];
        processDispatchQueueItemsInOrder(event, listeners, inCapturePhase); //  event system doesn't use pooling.
    }
}
function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
    if (inCapturePhase) {
        for (let i = dispatchListeners.length - 1; i >= 0; i--) {
            const { currentTarget, listener } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return;
            }
            executeDispatch(event, listener, currentTarget);
        }
    } else {
        for (let i = 0; i < dispatchListeners.length; i++) {
            const { currentTarget, listener } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return;
            }
            executeDispatch(event, listener, currentTarget);
        }
    }
}
function executeDispatch(event, listener, currentTarget) {
    event.currentTarget = currentTarget;
    listener(event);
    event.currentTarget = null;
}
//收集所有要执行的 listener
function extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
) {
    SimpleEventPlugin.extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer
    );
}

export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase) {
    const captureName = reactName + "Capture";
    const reactEventName = inCapturePhase ? captureName : reactName;
    const listeners = [];
    let instance = targetFiber;
    while (instance !== null) {
        const { stateNode, tag } = instance;
        if (tag === HostComponent && stateNode !== null) {
            if (reactEventName !== null) {
                const listener = getListener(instance, reactEventName);
                if (listener !== null && listener !== undefined) {
                    listeners.push(createDispatchListener(instance, listener, stateNode));
                }
            }
        }
        instance = instance.return;
    }

    return listeners;
}
function createDispatchListener(instance, listener, currentTarget) {
    return {
        instance,
        listener,
        currentTarget,
    };
}
