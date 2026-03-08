// Learn more https://docs.expo.io/guides/customizing-metro
// Make sure to extend the default config from @expo/metro-config
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
