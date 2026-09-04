import loadable from '@loadable/component';

const PlotlyComponent = loadable(() => import('./PlotlyComponent'), {
  ssr: false,
});

export default PlotlyComponent;
