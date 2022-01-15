/* eslint no-undef: "off" */

module.exports = function (api) {
  api.cache(true);

  return {
    exclude: ['node_modules/core-js/**'],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: '>= 1%, not dead, not ie 11',
          modules: false,
          useBuiltIns: 'usage',
          corejs: '3.19',
          ignoreBrowserslistConfig: true,
          debug: false,
        },
      ],
    ],
    plugins: [],
  };
};
