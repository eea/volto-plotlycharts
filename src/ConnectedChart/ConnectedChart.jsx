import React, { useState, useRef, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { toPublicURL } from '@plone/volto/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import { useHistory } from 'react-router-dom';
import {
  Enlarge,
  FigureNote,
  Sources,
  MoreInfo,
  Share,
} from '@eeacms/volto-embed/Toolbar';
import { Download } from '@eeacms/volto-plotlycharts/Utils';
import PlotlyComponent from './PlotlyComponent';

import '@eeacms/volto-embed/Toolbar/styles.less';

function ConnectedChart(props) {
  const [initialized, setInitialized] = useState(false);
  const [mobile, setMobile] = useState(false);
  const visEl = useRef(null);
  const chartRef = useRef(null);
  const history = useHistory();

  const {
    screen,
    loadingVisualizationData,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    visualization,
    visualization_data,
  } = props;

  const {
    title,
    data_provenance,
    figure_note,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = visualization_data || props.content || {};

  const {
    hover_format_xy,
    use_live_data = true,
    with_sources = true,
    with_notes = true,
    with_more_info = true,
    download_button = true,
    with_enlarge = true,
    with_share = true,
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
    if (visEl.current) {
      const visWidth = visEl.current.parentElement.offsetWidth;

      if (visWidth < 600 && !mobile) {
        setMobile(true);
      } else if (visWidth >= 600 && mobile) {
        setMobile(false);
      }
    }
  }, [screen, mobile, initialized]);

  if (loadingVisualizationData || loadingProviderData) {
    return <div>Loading chart...</div>;
  }

  if (!Object.keys(chartData).length) {
    return <div>No valid data.</div>;
  }

  return (
    <div className={cx('visualization-wrapper', { mobile })}>
      <div
        className={cx('visualization', { autosize: layout.autosize })}
        ref={visEl}
      >
        <PlotlyComponent
          {...{ chartRef, data, layout, history, setInitialized }}
        />
      </div>
      {initialized && (
        <div className="visualization-toolbar">
          <div className="left-col">
            {with_notes && <FigureNote notes={figure_note || []} />}
            {with_sources && (
              <Sources
                sources={data_provenance?.data || props.data?.chartSources}
              />
            )}
            {with_more_info && (
              <MoreInfo
                href={visualization_data?.['@id'] || props.content?.['@id']}
              />
            )}
          </div>
          <div className="right-col">
            {download_button && (
              <Download
                chartRef={chartRef}
                title={title}
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
            {with_share && (
              <Share
                href={visualization_data?.['@id'] || props.content?.['@id']}
              />
            )}
            {with_enlarge && (
              <Enlarge>
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
            )}
          </div>
        </div>
      )}
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
  connect((state) => ({
    screen: state.screen,
  })),
)(ConnectedChart);
