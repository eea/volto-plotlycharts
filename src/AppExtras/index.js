import Jupyter from './Jupyter';

export default function applyConfig(config) {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '*',
      ignore: ['/login', '/**/login'],
      component: Jupyter,
    },
  ];

  return config;
}
