import MapJaxScript from './MapJaxScript';

export default function applyConfig(config) {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '*',
      ignore: ['/login', '/**/login'],
      component: MapJaxScript,
    },
  ];

  return config;
}
