const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;

const defaultConfig = getDefaultConfig(projectRoot);

const config = {


  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = withNativeWind(
  mergeConfig(defaultConfig, config),
  { input: './global.css', inlineRem: 16 },
);
