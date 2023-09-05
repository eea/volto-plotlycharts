import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import cx from 'classnames';
import loadable from '@loadable/component';
import config from '@plone/volto/registry';
import { toPublicURL } from '@plone/volto/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import { useHistory } from 'react-router-dom';

import { Download, Sources } from '@eeacms/volto-plotlycharts/Utils';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

/*
 * ConnectedChart
 */
function ConnectedChart(props) {
  const [firstLoad, setFirstLoad] = useState(true);
  const {
    loadingVisualizationData,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    visualization,
    visualization_data,
  } = props;
  const { hover_format_xy } = props.data || {};
  const {
    data_provenance,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = visualization_data || {};
  const use_live_data = props.data?.use_live_data ?? true;
  const with_sources = props.data?.with_sources ?? false;
  const loadingProviderData =
    loadingVisualizationData || (hasProviderUrl && props.loadingProviderData);
  const history = useHistory();

  const chartData =
    visualization?.chartData || visualization_data?.chartData || {};

  const layout = {
    ...(chartData.layout || {}),
    dragmode: false,
    font: {
      ...(chartData.layout?.font || {}),
      family: config.settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
    margin: {
      l: 80, // default: 80
      r: 80, // default: 80
      b: 80, // default: 80
      t: 100, // default: 100
      ...(chartData.layout?.margin || {}),
    },
  };

  // Overwrite xaxis
  if (layout.xaxis) {
    layout.xaxis = {
      ...layout.xaxis,
      hoverformat:
        hover_format_xy ||
        layout.xaxis.hoverformat ||
        layout.xaxis.tickformat ||
        '',
    };
  }

  // Overwrite yaxis
  if (layout.yaxis) {
    layout.yaxis = {
      ...layout.yaxis,
      hoverformat:
        hover_format_xy ||
        layout.xaxis.hoverformat ||
        layout.xaxis.tickformat ||
        '',
    };
  }

  let data =
    provider_data && use_live_data
      ? updateChartDataFromProvider(chartData.data || [], provider_data)
      : chartData.data || [];

  data = data.map((trace) => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: config.settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  useEffect(() => {
    if (firstLoad && !loadingVisualizationData && !loadingProviderData) {
      setFirstLoad(false);
    }
  }, [firstLoad, loadingVisualizationData, loadingProviderData]);

  if (firstLoad && (loadingVisualizationData || loadingProviderData)) {
    return <div>Loading chart...</div>;
  }

  return !Object.keys(chartData).length ? (
    <div>No valid data.</div>
  ) : (
    <div className="visualization-wrapper">
      <div className={cx('visualization', { autosize: layout.autosize })}>
        <LoadablePlotly
          useResizeHandler
          data={data}
          layout={layout}
          frames={[]}
          config={{
            displayModeBar: false,
            editable: false,
            responsive: true,
          }}
          onClick={(trace) => {
            const { customLink, clickmode, meta = [] } = layout;
            // Ex: catalogue?size=n_10_n&filters[0][field]={parent}&filters[0][values][0]={value}&filters[0][type]=any
            // will not redirect on clicking a parent of point (treemap has a zoom feature and usually parents don't have
            // the same significance as children, with relation to filter types)
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
                    : x.filter((label) => label === 0 || label); //trimming
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
                const link = layout.customLink
                  .replace('{value}', id || label)
                  .replace('{parent}', parent);
                history.push(link);
              }
            }
          }}
          onHover={(e) => {
            if (layout.customLink && layout.clickmode !== 'none') {
              e.event.target.style.opacity = 0.8;
              e.event.target.style.transition = 'opacity 0.1s ease-in-out';
              e.event.target.style.cursor = 'pointer';
            }
          }}
          onUnhover={(e) => {
            if (layout.customLink && layout.clickmode !== 'none') {
              e.event.target.style.opacity = 1;
              e.event.target.style.cursor = 'default';
            }
          }}
          style={{
            position: 'relative',
            display: 'block',
            ...(!layout.height ? { minHeight: '450px' } : {}),
          }}
        />
      </div>
      <div className="visualization-info">
        {with_sources && (
          <Sources sources={data_provenance?.data || props.data.chartSources} />
        )}
        {props.data?.download_button && (
          <Download
            data={{ data_query: props.data.data_query }}
            title={
              props.data?.vis_url ||
              props.data?.provider_url ||
              props.data?.title
            }
            provider_data={provider_data}
            provider_metadata={provider_metadata}
            url_source={toPublicURL(props?.location?.pathname)}
            core_metadata={{
              data_provenance: data_provenance?.data,
              other_organisations: other_organisations,
              temporal_coverage: temporal_coverage?.temporal,
              publisher: publisher,
              geo_coverage: geo_coverage?.geolocation,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default compose(
  connectBlockToVisualization((props) => ({
    vis_url: props.data?.vis_url || null,
    use_live_data: props.data?.use_live_data ?? true,
  })),
  connectToProviderData((props) => {
    const use_live_data = props.data?.use_live_data ?? true;
    if (!use_live_data) return {};
    return {
      provider_url:
        props.visualization?.provider_url ||
        props.visualization_data?.provider_url ||
        props.data?.provider_url,
    };
  }),
)(ConnectedChart);
