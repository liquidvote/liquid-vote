const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { resolveTsAliases } = require("resolve-ts-aliases");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const WorkboxPlugin = require("workbox-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

let commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const isProd = process.env.NODE_ENV === "production";

console.log({
  e: process.env.NODE_ENV,
  __dirname,
  commitHash
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
        commitHash
      },
      favicon: "src/assets/favicon.ico",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "__COMMIT_HASH__": JSON.stringify(commitHash)
    }),
    ...(isProd
      ? [
          new CompressionPlugin(),
          new CopyPlugin({
            patterns: [
              { from: "./src/service-worker" },
            ],
          }),
          new WorkboxPlugin.GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
            importScripts: ["./firebase-messaging-sw.js"],

            maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          }),
          // new BundleAnalyzerPlugin(),
          new WebpackPwaManifest({
            name: "Liquid Vote",
            short_name: "Liquid Vote",
            description: "Where opinions are found",
            background_color: "#0b414d",
            theme_color: "#0fded5",
            crossorigin: "use-credentials", //can be null, use-credentials or anonymous
            icons: [
              {
                src: "src/assets/logo.png",
                sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
              },
              {
                src: "src/assets/logo.png",
                size: "1024x1024", // you can also use the specifications pattern
              },
              {
                src: "src/assets/logo.png",
                size: "1024x1024",
                purpose: "maskable",
              },
            ],
            start_url: "/",
          }),
        ]
      : []),
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
