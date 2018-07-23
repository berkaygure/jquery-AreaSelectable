const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: {
    bundle: __dirname + "/src/areaSelectable.js"
  },
  devtool: "source-map",
  output: {
    path: __dirname + "/dist",
    filename: "areaSelectable.min.js"
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  }
};
