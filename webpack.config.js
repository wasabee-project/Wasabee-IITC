const path = require("path");
const outputPath = path.join(__dirname, "releases");
const ESLintPlugin = require("eslint-webpack-plugin");

const { ConcatSource } = require("webpack-sources");
const Compilation = require("webpack/lib/Compilation");

const wrapPrefix = `
function wrapper(plugin_info) {
  if (typeof window.plugin !== "function") {
    window.plugin = function () {};
  }

  window.plugin.Wasabee = window.plugin.wasabee = {};
  window.plugin.wasabee.info = plugin_info.script;

  // Code injection
  function setup () {
`;
const wrapSuffix = `
    window.plugin.wasabee.init();
  };

  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) {
    window.bootPlugins = [];
  }
  window.bootPlugins.push(setup);
  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === "function") {
    setup();
  }
}

var script = document.createElement("script");
var info = {};
if (typeof GM_info !== "undefined" && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description,
  };
}

script.appendChild(
  document.createTextNode("(" + wrapper + ")(" + JSON.stringify(info) + ");")
);
(document.body || document.head || document.documentElement).appendChild(
  script
);
`;

class IITCScript {
  constructor(options) {
    this.options = options || {};
    this.header = "";
    this.header += "// ==UserScript==\n";
    const keys = [
      "id",
      "name",
      "namespace",
      "version",
      "updateURL",
      "downloadURL",
      "description",
      "author",
      "match",
      "category",
      "grant",
    ];
    const meta = {
      match: "https://intel.ingress.com/*",
      grant: "none",
      version: "",
    };
    Object.assign(meta, options.meta);
    meta.version = meta.version.replace(
      "BUILDDATE",
      new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14)
    );
    keys.forEach((key) => {
      Array.prototype.concat
        .apply([], meta[key] && [meta[key]])
        .forEach((value) => {
          if (value) this.header += `// @${key.padEnd(13)} ${value}\n`;
        });
    });
    this.header += "// ==/UserScript==\n\n";
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("Userscript", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "Userscript",
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        () => {
          compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
              compilation.updateAsset(
                file,
                new ConcatSource(
                  this.header,
                  wrapPrefix,
                  compilation.assets[file],
                  wrapSuffix
                )
              );
            });
          });
          if (this.options.withMeta) {
            compilation.chunks.forEach((chunk) => {
              chunk.files.forEach((file) => {
                if (file.match(/user.js$/))
                  compilation.emitAsset(
                    file.replace(/user.js$/, "meta.js"),
                    new ConcatSource(this.header),
                    { minimized: true }
                  );
              });
            });
          }
        }
      );
    });
  }
}

const config = {
  entry: {
    init: "./src/code/init.js",
  },
  output: {
    filename: "wasabee.user.js",
  },
  resolve: {
    modules: ["node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.(png|gif|svg)$/,
        use: "url-loader",
      },
      {
        test: /\.css$/,
        use: [
          "to-string-loader",
          {
            loader: "css-loader",
            options: { esModule: false },
          },
        ],
      },
      {
        test: /\.html$/,
        use: ["to-string-loader", "html-loader"],
      },
    ],
  },
  plugins: [new ESLintPlugin({ fix: true })],
};

module.exports = (env, argv) => {
  const pluginConfig = require("./plugin.config.json");
  const meta = pluginConfig.headers.common;
  if (argv.mode === "development" && env.scot) {
    config.output.path = path.join(outputPath, "scot");
    config.devtool = "eval-source-map";
    Object.assign(meta, pluginConfig.headers.scot);
  } else if (argv.mode === "development") {
    config.output.path = path.join(outputPath, "dev");
    config.devtool = "eval-source-map";
    Object.assign(meta, pluginConfig.headers.dev);
  } else {
    config.output.path = path.join(outputPath, "prod");
    Object.assign(meta, pluginConfig.headers.prod);
  }
  config.plugins.push(new IITCScript({ meta: meta, withMeta: true }));
  return config;
};
