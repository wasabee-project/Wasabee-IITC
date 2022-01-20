"use strict";

const sourceLanguage = require("./src/code/translations/English.json");

module.exports = {
  "wx-keys": {
    meta: {
      docs: {
        description: "Check wX calls",
        category: "Possible Errors",
        recommended: false,
      },
      schema: [],
    },
    create: function (context) {
      return {
        CallExpression: function (node) {
          const callee = node.callee;
          if (callee.type !== "Identifier") return;
          if (callee.name !== "wX") return;
          const args = node.arguments;
          if (args.length < 1 || args.length > 2) {
            context.report({
              node: node,
              message: "Invalid number of arguments for wX",
            });
          } else {
            if (args[0].type !== "Literal") return;
            const key = args[0].value;
            if (key in sourceLanguage) {
              return;
            }
            context.report({
              node: node,
              message: "Unknown wX key: {{ key }}",
              data: {
                key: args[0].raw
              },
            });
          }
        },
      };
    },
  },
};
