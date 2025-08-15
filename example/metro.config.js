const path = require('path');
const { getDefaultConfig } = require('expo/metro-config'); // or "metro-config" if bare RN
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const threePackagePath = path.resolve(__dirname, 'node_modules', 'three');

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

config.resolver.extraNodeModules = {
  three: threePackagePath,
};

config.resolver.disableHierarchicalLookup = true;
config.resolver.resolveRequest =  (context, moduleName, platform) => {
  if (moduleName.startsWith('three/addons/')) {
    return {
      filePath: path.resolve(threePackagePath, 'examples/jsm/' + moduleName.replace('three/addons/', '') + '.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'three' || moduleName === 'three/webgpu') { 
    return {
      filePath: path.resolve(threePackagePath, 'build/three.webgpu.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'three/tsl') { 
    return {
      filePath: path.resolve(threePackagePath, 'build/three.tsl.js'),
      type: 'sourceFile',
    };
  }
  // Let Metro handle other modules
  return context.resolveRequest(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.resolver.assetExts.push('glb', 'gltf', 'jpg', 'bin', 'hdr');

module.exports = withNativeWind(config, { input: './global.css' });
