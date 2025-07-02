// "EventTarget" is a built-in browser API that allows objects to handle events and dispatch them

class GlobalEventEmitter extends EventTarget {}

const globalEventEmitter = new GlobalEventEmitter();

export default globalEventEmitter;
