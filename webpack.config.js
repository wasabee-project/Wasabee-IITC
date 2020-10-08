const path = require("path");
const outputPath = path.join(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    static: "./src/code/static.js",
    init: "./src/code/init.js",
  },
  output: {
    path: outputPath,
    filename: "[name]-bundle.js",
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
<<<<<<< HEAD
        use: [
          "to-string-loader",
          {
            loader: "css-loader",
            options: { esModule: false },
          },
        ],
=======
        use: ["style-loader", "css-loader"],
>>>>>>> master
      },
      {
        test: /\.html$/,
        use: ["to-string-loader", "html-loader"],
      },
    ],
  },
};
