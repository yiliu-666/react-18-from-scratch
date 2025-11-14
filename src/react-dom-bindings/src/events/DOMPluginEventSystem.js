import { allNativeEvents } from "./EventRegistry";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { addEventCaptureListener, addEventBubbleListener } from "./EventListener";

SimpleEventPlugin.registerEvents();

export function listenToAllSupportedEvents(rootContainerElement) {
    allNativeEvents.forEach((domEventName) => {
        listenToNativeEvent(domEventName, true, rootContainerElement);
        listenToNativeEvent(domEventName, false, rootContainerElement);
    });
}

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
        addEventCaptureListener(targetContainer, domEventName, listener);  //本质上就是对原生的一个简单封装
        //root.addEventListener('click', listener, true);
    } else {
        addEventBubbleListener(targetContainer, domEventName, listener);
        //root.addEventListener('click', listener, false);
    }
}