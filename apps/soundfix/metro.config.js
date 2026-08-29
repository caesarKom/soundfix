const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), {}),
  { input: './global.css', inlineRem: 16 },
);

