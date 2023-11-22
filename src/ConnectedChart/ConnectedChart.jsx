import React, { useState, useRef, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Dimmer, Loader, Image } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { toPublicURL, flattenToAppURL } from '@plone/volto/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import { useHistory } from 'react-router-dom';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
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

export function ChartSkeleton() {
  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      <Dimmer active inverted>
        <Loader size="mini">Loading chart...</Loader>
      </Dimmer>

      <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
    </div>
  );
}

function getVisualization(props) {
  const { isBlock, content } = props;
  if (!isBlock) {
    return {
      ...pickMetadata(content),
      ...(content.visualization || {}),
    };
  }
  return props.visualization || props.data.visualization;
}

function ConnectedChart(props) {
  const [initialized, setInitialized] = useState(false);
  const [mobile, setMobile] = useState(false);
  const visEl = useRef(null);
  const chartRef = useRef(null);
  const history = useHistory();

  const {
    screen,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    loadingVisualization,
  } = props;

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

  const visualization = getVisualization(props);

  const {
    title,
    data_provenance,
    figure_note,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = visualization;

  const visualization_id = visualization['@id'] || props.data?.vis_url;

  const loadingProviderData = hasProviderUrl && props.loadingProviderData;

  const chartData = visualization?.chartData || {};

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

  if (loadingVisualization || loadingProviderData) {
    return <ChartSkeleton />;
  }

  if (!Object.keys(chartData).length) {
    return <div>No valid data.</div>;
  }

  return (
    <>
      {!initialized && <ChartSkeleton />}
      <div className="visualization-wrapper">
        <div
          className={cx('visualization', { autosize: layout.autosize })}
          ref={visEl}
        >
          <PlotlyComponent
            {...{ chartRef, data, layout, history, setInitialized }}
          />
        </div>
        {initialized && (
          <div className={cx('visualization-toolbar', { mobile })}>
            <div className="left-col">
              {with_notes && <FigureNote notes={figure_note || []} />}
              {with_sources && (
                <Sources
                  sources={data_provenance?.data || props.data?.chartSources}
                />
              )}
              {with_more_info && <MoreInfo href={visualization_id} />}
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
              {with_share && <Share href={visualization_id} />}
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
    </>
  );
}

export default compose(
  connect((state, props) => ({
    screen: state.screen,
    isBlock: !!props.data?.['@type'],
  })),
  connectBlockToVisualization((props) => {
    const isBlock = !!props.data?.['@type'];
    const url = flattenToAppURL(props.data?.vis_url);
    const currentUrl = props.data.visualization
      ? flattenToAppURL(props.data.visualization['@id'])
      : null;
    return {
      vis_url:
        isBlock && url && (!props.data.visualization || currentUrl !== url)
          ? url
          : null,
      use_live_data: props.data?.use_live_data ?? true,
    };
  }),
  connectToProviderData((props) => {
    const use_live_data = props.data?.use_live_data ?? true;
    if (!use_live_data) return {};
    return {
      provider_url: getVisualization(props).provider_url,
    };
  }),
)(ConnectedChart);
