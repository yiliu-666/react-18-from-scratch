import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { SyntheticMouseEvent } from "../SyntheticEvent";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";

function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
  const reactName = topLevelEventsToReactNames.get(domEventName);
  let SyntheticEventCtor;
  switch (domEventName) {
    case "click":
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      break;
  }
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase);
  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(reactName, domEventName, targetInst, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
      event,
      listeners,
    });
  }
}
export { registerSimpleEvents as registerEvents, extractEvents };