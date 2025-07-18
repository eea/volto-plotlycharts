const path = require('path');

module.exports = function (api) {
  api.cache(true);
  const presets = ['razzle'];
  const plugins = [
    [
      'react-intl',
      {
        messagesDir: './build/messages/',
      },
    ],
    [
      'transform-imports',
      {
        '@plone/volto/helpers': {
          transform: (importName) =>
            `@plone/volto/helpers/${importName}`,
          preventFullImport: true,
        },
        'date-fns': {
          transform: (importName) => `date-fns/${importName}`,
          preventFullImport: true,
        },
        lodash: {
          transform: (importName) => `lodash/${importName}`,
          preventFullImport: true,
        },
      },
    ],
    'transform-class-properties',
    [
      'babel-plugin-root-import',
      {
        rootPathSuffix: 'src',
      },
    ],
  ];
  const env = {
    test: {
      plugins: [
        'istanbul',
        [
          'babel-plugin-root-import',
          {
            rootPathSuffix: 'src',
          },
        ],
      ],
    },
  };

  if (process.env.NODE_ENV !== 'development') {
    plugins.push([
      'transform-imports',
      {
        '../../theme.config
: {
          transform: (importName) => {
            const p = path.resolve(
              `./theme/themes/eea/theme.config`,
            );
            return p;
          },
          preventFullImport: true,
        },
      },
      'eea-volto-plotlycharts-theme-config',
    ]);
  }

  return {
    presets,
    plugins,
    env,
  };
};
