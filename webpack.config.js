const path = require("path");
const outputPath = path.join(__dirname, "releases");
const ESLintPlugin = require("eslint-webpack-plugin");
const childProcess = require("child_process");

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
    init: "./src/code/init.ts",
  },
  output: {
    filename: "wasabee.user.js",
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        loader: "raw-loader",
        options: { esModule: false },
      },
      {
        test: /\.css$/,
        use: [
          "to-string-loader",
          {
            loader: "css-loader",
            options: { esModule: false, url: false },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-url",
                    {
                      url: "inline",
                    },
                  ],
                  ["cssnano", { preset: "default" }],
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [new ESLintPlugin({ fix: true })],
};

function getCommitShort() {
  try {
    const commit = childProcess
      .execSync("git rev-parse --short HEAD")
      .toString()
      .trim();
    return commit;
  } catch {
    return null;
  }
}

module.exports = (env, argv) => {
  const pluginConfig = require("./plugin.config.json");
  const meta = pluginConfig.headers.common;
  const build = env.build;
  if (build in pluginConfig.headers)
    Object.assign(meta, pluginConfig.headers[build]);
  switch (build) {
    case "prod":
    case "dev":
    case "testing":
    case "scot":
      config.output.path = path.join(outputPath, build);
      break;
    case "pr":
      meta.version += env.pr;
      config.output.path = path.join(outputPath, "dev");
    default:
  }

  if (build !== "prod") {
    const commit = getCommitShort();
    if (commit) meta.version += `-${commit}`;
    config.devtool = "eval";
    config.mode = "development";
  } else {
    config.mode = "production";
  }

  config.plugins.push(new IITCScript({ meta: meta, withMeta: true }));
  return config;
};
