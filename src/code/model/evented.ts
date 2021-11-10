/*
  light es6 version of L.Evented
  current design to fail safe is:
   - events array is increaing only, removed listeners are replaced by a null function
   - loop are prevented by removing listeners during its call
   - try/catch
*/

function doNothing() {}

export default class Evented {
  _events: {
    [event: string]: {
      fct: (data: unknown) => void;
      context: unknown;
    }[];
  };

  constructor() {
    this._events = {};
  }

  on(event: string, func: (data: unknown) => void, context?: unknown) {
    if (!(event in this._events)) this._events[event] = [];
    this._events[event].push({ fct: func, context: context });
    return this;
  }

  off(event: string, func: (data: unknown) => void, context?: unknown) {
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

  fire(event: string, data?: unknown) {
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
