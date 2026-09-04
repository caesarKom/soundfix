module.exports = {
  root: true,
  extends: '@react-native',

  parserOptions: {
    babelOptions: {
      configFile: require.resolve('./babel.config.js'),
    },
  },

  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'react-native/no-inline-styles': 0,
  },
};
