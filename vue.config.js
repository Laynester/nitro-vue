const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    configureWebpack: config => {
        // remove the existing ForkTsCheckerWebpackPlugin
        config.plugins = config.plugins.filter(
          p => !(p instanceof ForkTsCheckerWebpackPlugin),
        );
      },
    chainWebpack: config => {
        config.module
          .rule('vue')
          .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
              options.hotReload = false;
              return options;
            });
      }
};
