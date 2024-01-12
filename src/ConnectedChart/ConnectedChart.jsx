import React, { useState, useRef, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { map } from 'lodash';
import cx from 'classnames';
import { Dimmer, Loader, Image } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { toPublicURL, flattenToAppURL } from '@plone/volto/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import {
  Enlarge,
  FigureNote,
  Sources,
  MoreInfo,
  Share,
} from '@eeacms/volto-embed/Toolbar';
import { getDataSources } from '@eeacms/volto-plotlycharts/helpers';
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
  return props.visualization || props.data?.visualization || {};
}

function getChartLayout({ hover_format_xy, layout = {} }) {
  return {
    ...layout,
    dragmode: false,
    font: {
      family: config.settings.chartLayoutFontFamily || "'Roboto', sans-serif",
      ...(layout.font || {}),
    },
    margin: {
      l: 80,
      r: 80,
      b: 80,
      t: 100,
      ...(layout.margin || {}),
    },
    // Overwrite xaxis
    ...(!!layout.xaxis && {
      xaxis: {
        ...layout.xaxis,
        hoverformat:
          hover_format_xy ||
          layout.xaxis.hoverformat ||
          layout.xaxis.tickformat ||
          '',
      },
    }),
    // Overwrite yaxis
    ...(!!layout.yaxis && {
      yaxis: {
        ...layout.yaxis,
        hoverformat:
          hover_format_xy ||
          layout.xaxis.hoverformat ||
          layout.xaxis.tickformat ||
          '',
      },
    }),
  };
}

function getChartData({ data = [], dataSources, use_live_data }) {
  const newData =
    dataSources && use_live_data
      ? updateChartDataFromProvider(data, dataSources)
      : data;

  return map(newData, (trace) => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: config.settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
    ...(trace.type === 'scatterpolar' &&
      trace.connectgaps &&
      trace.mode === 'lines' && {
        r: [...trace.r, trace.r[0]],
        theta: [...trace.theta, trace.theta[0]],
      }),
  }));
}

function ConnectedChart(props) {
  const history = useHistory();
  const visEl = useRef(null);
  const chartRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [chart, setChart] = useState({});

  const {
    screen,
    viz,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    loadingVisualization,
    use_live_data,
  } = props;

  const {
    hover_format_xy,
    with_sources = true,
    with_notes = true,
    with_more_info = true,
    download_button = true,
    with_enlarge = true,
    with_share = true,
  } = props.data || {};

  const {
    title,
    data_provenance,
    figure_note,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = viz;

  const visualization_id = viz['@id'] || props.data?.vis_url;

  const loadingProviderData = hasProviderUrl && props.loadingProviderData;

  useEffect(() => {
    setChart((chart) => {
      return {
        ...chart,
        layout: getChartLayout({
          hover_format_xy,
          layout: viz?.chartData?.layout,
        }),
        data: getChartData({
          data: viz?.chartData?.data,
          dataSources: getDataSources({
            provider_data,
            json_data: viz?.json_data,
          }),
          use_live_data,
        }),
        frames: viz?.chartData?.frames || [],
      };
    });
  }, [viz, provider_data, use_live_data, hover_format_xy]);

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

  if (!chart) {
    return null;
  }

  if (!Object.keys(chart).length) {
    return <div>No valid data.</div>;
  }

  return (
    <>
      {!initialized && <ChartSkeleton />}
      <div className="visualization-wrapper">
        <div
          className={cx('visualization', {
            autosize: chart.layout.autosize,
          })}
          ref={visEl}
        >
          <PlotlyComponent
            {...chart}
            chartRef={chartRef}
            history={history}
            setInitialized={setInitialized}
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
                    chartRef={chartRef}
                    history={history}
                    {...{
                      ...chart,
                      layout: {
                        ...chart.layout,
                        autosize: true,
                        height: null,
                        width: null,
                      },
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
  connectBlockToVisualization((props) => {
    const url = flattenToAppURL(props.data?.vis_url);
    const currentUrl = props.viz?.['@id'] || null;

    return {
      vis_url: url && (!props.viz || currentUrl !== url) ? url : null,
    };
  }),
  connect((state, props) => {
    const viz = getVisualization(props);
    const use_live_data =
      props.data?.use_live_data ?? viz?.use_live_data ?? true;
    return {
      screen: state.screen,
      viz,
      use_live_data,
    };
  }),
  connectToProviderData((props) => {
    const use_live_data = props.use_live_data ?? true;
    if (!use_live_data) return {};
    return {
      provider_url: props.viz.provider_url,
    };
  }),
)(ConnectedChart);
