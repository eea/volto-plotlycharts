import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { useHistory } from 'react-router-dom';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const config = { editable: false, displayModeBar: false, responsive: true };

const animationsMS = {
  tree: 1000,
};

const Plot = forwardRef((props, ref) => {
  const history = useHistory();
  const { data, layout, autoscale, onInitialized } = props;
  const plotly = props.plotlyMinLib?.default || props.plotlyMinLib;
  const plotlyComponentFactory =
    props.plotlyComponentFactory?.default || props.plotlyComponentFactory;
  const graphDiv = useRef(null);
  const originalPrintLayout = useRef(null);

  const PlotlyComponent = useMemo(() => {
    return plotlyComponentFactory(plotly);
  }, [plotlyComponentFactory, plotly]);

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
      } else if (type === 'sunburst' && shouldComposeLinks) {
        const correspondingLinkIndex = data.ids?.indexOf(id);
        const correspondingLink = meta[correspondingLinkIndex];
        if (correspondingLink) {
          window.open(correspondingLink, '_blank');
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

  const setGraphDiv = (value) => {
    graphDiv.current = value;

    if (typeof ref === 'function') {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const resizePlot = () => {
      if (!graphDiv.current || !plotly?.Plots?.resize) return;

      try {
        plotly.Plots.resize(graphDiv.current);
      } catch {
        // Plotly can throw if the graph is being unmounted during print cleanup.
      }
    };

    const relayoutPlot = (layoutUpdate) => {
      if (!graphDiv.current || !plotly?.relayout) return false;

      try {
        const result = plotly.relayout(graphDiv.current, layoutUpdate);
        result?.catch?.(() => {});
        return true;
      } catch {
        return false;
      }
    };

    const getWidth = (element) =>
      Math.floor(element?.getBoundingClientRect?.().width || 0);

    const getPrintWidth = () => {
      const chart = graphDiv.current?.closest?.(
        '.embed-visualization, .plotly-component',
      );
      const content = graphDiv.current?.closest?.(
        '#page-document, .content-area',
      );
      const widths = [
        getWidth(chart),
        getWidth(content),
        getWidth(graphDiv.current?.parentElement),
      ].filter((width) => width > 0);

      return widths.length ? Math.min(...widths) : 0;
    };

    const fitPlotToPrintWidth = () => {
      const targetWidth = getPrintWidth();
      const currentWidth =
        graphDiv.current?._fullLayout?.width || layout?.width || 0;

      if (!targetWidth || !currentWidth || currentWidth <= targetWidth) {
        resizePlot();
        return;
      }

      if (!originalPrintLayout.current) {
        originalPrintLayout.current = {
          width: graphDiv.current?._fullLayout?.width || layout?.width,
          height: graphDiv.current?._fullLayout?.height || layout?.height,
        };
      }

      if (!relayoutPlot({ width: targetWidth })) {
        resizePlot();
      }
    };

    const restorePlotWidth = () => {
      if (!originalPrintLayout.current) {
        resizePlot();
        return;
      }

      const { width, height } = originalPrintLayout.current;
      originalPrintLayout.current = null;

      const layoutUpdate = {
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      };

      if (!Object.keys(layoutUpdate).length || !relayoutPlot(layoutUpdate)) {
        resizePlot();
      }
    };

    const handleBeforePrint = () => {
      fitPlotToPrintWidth();
      const nextFrame = window.requestAnimationFrame
        ? (callback) => window.requestAnimationFrame(callback)
        : (callback) => window.setTimeout(callback, 0);
      nextFrame(fitPlotToPrintWidth);
      window.setTimeout(fitPlotToPrintWidth, 100);
    };

    const printMediaQuery = window.matchMedia?.('print');
    const handlePrintMediaChange = (event) => {
      if (event.matches) {
        handleBeforePrint();
      } else {
        restorePlotWidth();
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', restorePlotWidth);
    printMediaQuery?.addEventListener?.('change', handlePrintMediaChange);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', restorePlotWidth);
      printMediaQuery?.removeEventListener?.('change', handlePrintMediaChange);
    };
  }, [layout?.height, layout?.width, plotly]);

  return (
    <PlotlyComponent
      data={data}
      layout={{
        ...layout,
        ...(autoscale ? { autosize: false } : {}),
      }}
      onInitialized={(...args) => {
        setGraphDiv(args[1]);
        if (onInitialized) {
          onInitialized(...args);
        }
      }}
      config={{ ...config, responsive: !autoscale }}
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
      useResizeHandler={!autoscale}
    />
  );
});

export default injectLazyLibs(['plotlyMinLib', 'plotlyComponentFactory'])(Plot);
