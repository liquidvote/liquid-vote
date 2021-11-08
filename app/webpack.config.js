const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { resolveTsAliases } = require("resolve-ts-aliases");

const isProd = process.env.NODE_ENV === "production";

console.log({
  e: process.env.NODE_ENV,
  __dirname,
});

const config = {
  mode: isProd ? "production" : "none",
  entry: {
    index: "./src/index.tsx",
  },
  devtool: isProd ? "source-map" : "inline-source-map",
  output: {
    path: `${__dirname}/dist`,
    publicPath: "/",
    filename: "[name].[contenthash].js",
    chunkFilename: "[id].chunk.[chunkhash].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: resolveTsAliases(__dirname + "/tsconfig.json"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack", "file-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      templateParameters: {
        env: process.env.NODE_ENV,
      },
      favicon: "src/assets/favicon.ico",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

if (isProd) {
  config.optimization = {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()],
  };
} else {
  config.devServer = {
    https: process.env.NODE_ENV === "development" ? false : true,
    port: 8080,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: {
      disableDotRule: true,
    },
  };
}

module.exports = config;
