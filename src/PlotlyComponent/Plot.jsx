import React, { forwardRef } from 'react';
import loadable from '@loadable/component';
import { useHistory } from 'react-router-dom';

const PlotlyComponent = loadable(() =>
  import('@eeacms/volto-plotlycharts/lib/react-plotly'),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const config = { editable: false, displayModeBar: false, responsive: true };

const animationsMS = {
  tree: 1000,
};

const Plot = forwardRef(({ data, layout, onInitialized }, ref) => {
  const history = useHistory();

  const handleChartClick = async (trace, layout) => {
    const { customLink, clickmode, meta = [] } = layout;

    if (customLink && clickmode !== 'none') {
      const {
        id,
        label,
        parent,
        data = {},
        curveNumber = 0,
        pointIndex = 0,
      } = trace?.points[0] || {};

      const { type, parents = [], y = [], x = [] } = data;

      // Wait for animation to finish
      await sleep(animationsMS[type] || 0);

      const shouldRedirect = type
        ? type !== 'treemap'
          ? true
          : parents.indexOf(id) === -1
        : false;

      const shouldComposeLinks = meta.length > 0;

      if (type === 'bar' && shouldComposeLinks) {
        if (customLink === 'allLinks') {
          const yIsLabels = y.indexOf(label) > -1;
          const labels = yIsLabels
            ? y.filter((label) => label === 0 || label)
            : x.filter((label) => label === 0 || label);

          const noOfLabels = labels.length;
          const correspondingLinkPosition =
            noOfLabels * curveNumber + pointIndex;
          const correspondingLink = meta[correspondingLinkPosition];
          history.push(correspondingLink);
        } else if (customLink === 'fullLinks') {
          const correspondingLinkPosition = pointIndex;
          const correspondingLink = meta[correspondingLinkPosition];
          history.push(correspondingLink);
        }
      } else if (shouldRedirect) {
        const link = customLink
          .replace('{value}', id || label)
          .replace('{parent}', parent);
        history.push(link);
      }
    }
  };

  const handleChartHover = (e, layout) => {
    if (layout.customLink && layout.clickmode !== 'none') {
      e.event.target.style.opacity = 0.8;
      e.event.target.style.transition = 'opacity 0.1s ease-in-out';
      e.event.target.style.cursor = 'pointer';
    }
  };

  const handleChartUnhover = (e, layout) => {
    if (layout.customLink && layout.clickmode !== 'none') {
      e.event.target.style.opacity = 1;
      e.event.target.style.cursor = 'default';
    }
  };

  return (
    <PlotlyComponent
      data={data}
      layout={layout}
      onInitialized={(...args) => {
        if (ref) {
          ref.current = args[1];
        }
        if (onInitialized) {
          onInitialized(...args);
        }
      }}
      config={config}
      onClick={(trace) => handleChartClick(trace, layout)}
      onHover={(trace) => handleChartHover(trace, layout)}
      onUnhover={(trace) => handleChartUnhover(trace, layout)}
      style={{
        width: '100%',
        height: '100%',
        // position: 'relative',
        // display: 'block',
        // minHeight:
        //   !layout.height || layout.height < 10 ? '450px' : `${layout.height}px`,
      }}
      useResizeHandler
    />
  );
});

export default Plot;
