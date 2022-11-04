import React from 'react';
import { compose } from 'redux';
import loadable from '@loadable/component';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connect } from 'react-redux';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';

import { getContent } from '@plone/volto/actions';

import config from '@plone/volto/registry';
import Download from './Download';
import SourcesWidget from './Sources';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

const filterItemsIds = (items, allowedIds) => {
  const newItems = items.map((item) => {
    var newItem = {};
    allowedIds.forEach((id) => {
      newItem[id] = item[id];
    });
    return newItem;
  });
  return newItems;
};

/*
 * ConnectedChart
 */
function ConnectedChart2(props) {
  const {
    hoverFormatXY,
    loadingVisualizationData,
    provider_data,
    provider_metadata,
    visualization,
    visualization_data,
    width,
    height = 450,
    id,
    //core-metadata data
    data_provenance,
    other_organisations,
    temporal_coverage,
  } = props;
  const use_live_data = props.data?.use_live_data ?? true;
  const with_sources = props?.withSources ?? false;

  const chartData =
    visualization?.chartData || visualization_data?.chartData || {};

  React.useEffect(() => {
    if (props.data?.vis_url) {
      //consider using only getContent for all viz data (see volto-eea-map)
      props.getContent(props.data?.vis_url, null, id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data.vis_url]);

  const layout = {
    ...(chartData.layout || {}),
    autosize: true,
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

  delete layout.width;
  delete layout.height;

  if (layout.xaxis) {
    layout.xaxis = {
      ...layout.xaxis,
      hoverformat:
        hoverFormatXY ||
        layout.xaxis.hoverformat ||
        layout.xaxis.tickformat ||
        '',
    };
  }
  if (layout.yaxis) {
    layout.yaxis = {
      ...layout.yaxis,
      hoverformat:
        hoverFormatXY ||
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

  if (loadingVisualizationData) {
    return <div>Loading chart...</div>;
  }
  return !Object.keys(chartData).length ? (
    <div>No valid data.</div>
  ) : (
    <>
      <div className="connected-chart-wrapper">
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
          style={{
            width: width ? width + 'px' : '100%',
            height: height + 'px',
          }}
        />
      </div>
      {props.data && props.data.download_button && (
        <Download
          data={{ data_query: props.data.data_query }}
          title={
            props.data?.vis_url || props.data?.provider_url || props.data?.title
          }
          provider_data={provider_data}
          provider_metadata={provider_metadata}
          include_core_metadata_download={
            props.data.include_core_metadata_download
          }
          core_metadata={{
            data_provenance: props.data?.include_sources_download
              ? filterItemsIds(
                  data_provenance?.data,
                  props.data?.include_sources_download,
                )
              : '',
            other_organisations: props.data?.include_other_org_download
              ? filterItemsIds(
                  other_organisations,
                  props.data?.include_other_org_download,
                )
              : '',
            temporal_coverage:
              props.data?.include_temporal_coverage_download &&
              props.data?.include_temporal_coverage_download.length > 0 &&
              temporal_coverage?.temporal &&
              temporal_coverage?.temporal?.length > 0
                ? filterItemsIds(
                    temporal_coverage?.temporal,
                    props.data?.include_temporal_coverage_download,
                  )
                : '',
          }}
        />
      )}
      {with_sources && (
        <>
          {data_provenance &&
          data_provenance.data &&
          data_provenance.data.length > 0 ? (
            <SourcesWidget data={data_provenance.data} />
          ) : (
            <p>Data provenance is not set for visualization</p>
          )}
        </>
      )}
    </>
  );
}

export default compose(
  connect(
    (state, props) => ({
      //mapped core metadata data to props. Include more if needed
      temporal_coverage:
        state.content.subrequests?.[props.id]?.data?.temporal_coverage,
      other_organisations:
        state.content.subrequests?.[props.id]?.data?.other_organisations,
      data_provenance:
        state.content.subrequests?.[props.id]?.data?.data_provenance,
    }),
    {
      getContent,
    },
  ),
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
)(ConnectedChart2);
