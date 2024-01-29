import Jupyter from './Jupyter';

export default function applyConfig(config) {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '*',
      exclude: ['/login', '/**/login'],
      component: Jupyter,
    },
  ];

  return config;
}
