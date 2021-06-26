/*
  light es6 version of L.Evented
  current design to fail safe is:
   - events array is increaing only, removed listeners are replaced by a null function
   - loop are prevented by removing listeners during its call
   - try/catch
*/

function doNothing() {}

export default class Evented {
  constructor() {
    this._events = {};
  }

  on(event, func, context) {
    if (!(event in this._events)) this._events[event] = [];
    this._events[event].push({ fct: func, context: context });
    return this;
  }

  off(event, func, context) {
    const listeners = this._events[event].slice();
    if (listeners) {
      for (const listener of listeners) {
        if (listener.fct === func && listener.context === context) {
          listener.fct = doNothing;
          delete listener.context;
        }
      }
    }
    return this;
  }

  fire(event, data) {
    const listeners = this._events[event].slice();
    if (listeners) {
      for (const listener of listeners) {
        const fct = listener.fct;
        listener.fct = doNothing;
        try {
          fct.call(listener.context, data);
        } catch (e) {
          console.error(e);
        }
        listener.fct = fct;
      }
    }
    return this;
  }
}
