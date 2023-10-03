import React, { useEffect, useState, useRef } from 'react';
import { compose } from 'redux';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { toPublicURL } from '@plone/volto/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import { useHistory } from 'react-router-dom';
import {
  Download,
  Sources,
  FigureNote,
  MoreInfo,
  Enlarge,
} from '@eeacms/volto-plotlycharts/Utils';
import PlotlyComponent from './PlotlyComponent';

function ConnectedChart(props) {
  const [firstLoad, setFirstLoad] = useState(true);
  const chartRef = useRef(null);
  const history = useHistory();

  const {
    loadingVisualizationData,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    visualization,
    visualization_data,
  } = props;

  const {
    data_provenance,
    figure_note,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = visualization_data || {};

  const {
    hover_format_xy,
    use_live_data = true,
    with_sources = false,
    with_notes = false,
    download_button,
    with_more_info = false,
  } = props.data || {};

  const loadingProviderData =
    loadingVisualizationData || (hasProviderUrl && props.loadingProviderData);

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
      l: 80,
      r: 80,
      b: 80,
      t: 100,
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

  if (!Object.keys(chartData).length) {
    return <div>No valid data.</div>;
  }

  //props.data.title doesn't come in contentType mode and is the same as props.location.pathname
  const pathElements = props.location.pathname.split('/');
  const titleVis = pathElements[pathElements.length - 1];

  return (
    <div className="visualization-wrapper">
      <div className={cx('visualization', { autosize: layout.autosize })}>
        <PlotlyComponent {...{ chartRef, data, layout, history }} />
      </div>
      <div className="visualization-info-container">
        <div className="visualization-info">
          {with_notes && <FigureNote notes={figure_note} />}
          {with_sources && (
            <Sources
              sources={data_provenance?.data || props.data.chartSources}
            />
          )}
          {with_more_info && <MoreInfo contentTypeLink={props.data?.vis_url} />}
        </div>
        <div className="visualization-info">
          <Enlarge>
            {/* For Enlarge we overwrite the custom size setting in order to enlarge it */}
            <PlotlyComponent
              {...{
                chartRef,
                data,
                layout: {
                  ...layout,
                  autosize: true,
                  height: null,
                  width: null,
                },
                history,
              }}
            />
          </Enlarge>
          {(download_button === undefined || download_button) && (
            <Download
              chartRef={chartRef}
              title={titleVis}
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
