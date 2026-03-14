module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['../..'],
          alias: {
            '@my-app/ui': '../../packages/ui/src/index.ts',
            '@my-app/features': '../../packages/features/src/index.ts',
          },
        },
      ],
    ],
  };
};