import Operation from "../code/operation";

const crypto = require('crypto');

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});


test("Operation constructor example test", () => {
    var op = new Operation("__JARVIS__", "Uninstall ADA", true);
    expect(op.ID).toBeDefined();
});