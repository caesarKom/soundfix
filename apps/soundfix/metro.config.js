const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');


const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resetCache: true,
};

module.exports = withNativeWind(
  mergeConfig(defaultConfig, config),
  { input: './global.css', inlineRem: 16 },
);

