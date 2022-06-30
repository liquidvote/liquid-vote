const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-react-router-v6",
    "storybook-addon-apollo-client",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ];

    config.module.rules.push({
      test: /\.tsx?$/,
      use: "babel-loader",
      exclude: /node_modules/,
    });
    config.module.rules.push({
      test: /\.s[ac]ss$/i,
      use: ["style-loader", "css-loader", "sass-loader"],
    });
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack", "file-loader"],
    });
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|ico)$/,
      use: ["file-loader"],
    });

    return config;
  },
};
