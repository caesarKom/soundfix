module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'import',
    'prettier',
  ],

  rules: {
    'prettier/prettier': 'warn',
    'react-native/no-inline-styles': 'off',
  },
};
