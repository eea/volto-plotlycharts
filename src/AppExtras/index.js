import Jupyter from './Jupyter';

export default function applyConfig(config) {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '*',
      ignore: ['/login', '/**/login'],
      exclude: ['/login', '/**/login'], //deprecated since Volto-17
      component: Jupyter,
    },
  ];

  return config;
}
