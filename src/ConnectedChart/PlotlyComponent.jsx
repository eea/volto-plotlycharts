import React from 'react';
import loadable from '@loadable/component';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

const PlotlyComponent = ({ chartRef, data, layout, history }) => {
  const handleChartClick = (trace, layout, history) => {
    const { customLink, clickmode, meta = [] } = layout;

    if (customLink && clickmode !== 'none') {
      const { id, label, parent, data = {}, curveNumber = 0, pointIndex = 0 } =
        trace?.points[0] || {};

      const { type, parents = [], y = [], x = [] } = data;
      const shouldRedirect = type
        ? type !== 'treemap'
          ? true
          : parents.indexOf(id) === -1
          ? true
          : false
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
    <LoadablePlotly
      onInitialized={(_, chartEl) => {
        chartRef.current = chartEl;
      }}
      useResizeHandler
      {...{ data, layout }}
      frames={[]}
      config={{
        displayModeBar: false,
        editable: false,
        responsive: true,
      }}
      onClick={(trace) => handleChartClick(trace, layout, history)}
      onHover={(trace) => handleChartHover(trace, layout)}
      onUnhover={(trace) => handleChartUnhover(trace, layout)}
      style={{
        position: 'relative',
        display: 'block',
        ...(!layout.height ? { minHeight: '450px' } : {}),
      }}
    />
  );
};

export default PlotlyComponent;
