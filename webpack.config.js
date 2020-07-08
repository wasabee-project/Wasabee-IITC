const path = require("path");
const outputPath = path.join(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    static: "./src/code/static.js",
    init: "./src/code/init.js"
  },
  output: {
    path: outputPath,
    filename: "[name]-bundle.js"
  },
  resolve: {
    modules: ["node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.(png|gif)$/,
        use: "url-loader"
      },
      {
        test: /\.css$/,
        use: ["to-string-loader", "css-loader"]
      },
      {
        test: /\.html$/,
        use: ["to-string-loader", "html-loader"]
      }
    ]
  }
};
