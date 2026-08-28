module.exports = {
  root: true,
  extends: '@react-native',

  parserOptions: {
    babelOptions: {
      configFile: require.resolve('./babel.config.js'),
    },
  },
};
