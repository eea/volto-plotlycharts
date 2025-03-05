import React, { useState, useRef, useEffect, useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  map,
  mapKeys,
  mapValues,
  keys,
  isArray,
  cloneDeep,
  uniqBy,
  sortBy,
  toNumber,
} from 'lodash';
import cx from 'classnames';
import {
  Dimmer,
  Loader,
  Image,
  Grid,
  GridRow,
  GridColumn,
  FormField,
} from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { toPublicURL, flattenToAppURL } from '@plone/volto/helpers';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
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
import {
  getDataSources,
  getFigureMetadata,
} from '@eeacms/volto-plotlycharts/helpers';
import { Download } from '@eeacms/volto-plotlycharts/Utils';
import PlotlyComponent from './PlotlyComponent';

import '@eeacms/volto-embed/Toolbar/styles.less';

function getChartLayout({ defaultLayout = {}, layout = {} }) {
  return {
    ...defaultLayout,
    ...layout,
  };
}

function getChartData({ data = [], dataSources }) {
  const newData = dataSources
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

function getFilterOptions(rows, rowsOrder = null) {
  if (!isArray(rows)) return [];
  return sortBy(
    uniqBy(
      rows.map((value, index) => ({
        label: value,
        value,
        order: rowsOrder ? rowsOrder[index] : 1,
      })),
      'value',
    ),
    ['order', 'label'],
  );
}

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

function ConnectedChart(props) {
  const history = useHistory();
  const visEl = useRef(null);
  const chartRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [chart, setChart] = useState({});
  const [filters, setFilters] = useState(() =>
    (props.viz.filters || []).map((filter) => ({
      ...filter,
      data: filter.defaultValue
        ? { label: filter.defaultValue, value: filter.defaultValue }
        : null,
    })),
  );

  const {
    screen,
    viz,
    hasProviderUrl,
    provider_data,
    provider_metadata,
    loadingVisualization,
  } = props;

  const {
    hover_format_xy,
    height,
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

  const variation = viz.variation || 'filters_on_top';

  const visualization_id = viz['@id'] || props.data?.vis_url;

  const loadingProviderData = hasProviderUrl && props.loadingProviderData;

  const Select = props.reactSelect.default;

  const dataSources = useMemo(
    () =>
      getDataSources({
        provider_data,
        data_source: viz?.data_source,
      }),
    [provider_data, viz],
  );

  const filteredDataSources = useMemo(() => {
    if (!filters || filters.length === 0) return dataSources;
    const okIndexes = [];
    const filteredDataSources = cloneDeep(dataSources);
    const firstKey = keys(filteredDataSources)[0];
    (filteredDataSources[firstKey] || []).forEach((_, index) => {
      let ok = true;
      filters.forEach((filter) => {
        if (
          filter.data?.value &&
          filteredDataSources[filter.field] &&
          filteredDataSources[filter.field][index] !== filter.data.value
        ) {
          ok = false;
        }
      });
      if (ok) {
        okIndexes.push(index);
      }
    });
    return mapValues(filteredDataSources, (values) =>
      values.filter((_, index) => okIndexes.includes(index)),
    );
  }, [dataSources, filters]);

  useEffect(() => {
    setChart((chart) => {
      return {
        ...chart,
        layout: getChartLayout({
          hover_format_xy,
          defaultLayout: {
            ...(height ? { height: toNumber(height) || 0 } : {}),
          },
          layout: viz?.chartData?.layout,
        }),
        data: getChartData({
          data: viz?.chartData?.data,
          dataSources: filteredDataSources,
        }),
        frames: viz?.chartData?.frames || [],
      };
    });
  }, [viz, provider_data, hover_format_xy, height, filteredDataSources]);

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

  useEffect(() => {
    const mode = props.mode;
    const visUrl = props.data?.vis_url;
    const with_metadata_section = props.data?.with_metadata_section ?? true;
    if (mode !== 'edit') return;
    if (!with_metadata_section) {
      let metadataBlock = null;
      mapKeys(props.properties.blocks, (data, block) => {
        if (data?.['id'] === `figure-metadata-${props.block}`) {
          metadataBlock = block;
        }
      });
      if (metadataBlock) {
        props.onDeleteBlock(metadataBlock);
        props.onSelectBlock(props.block);
      }
      return;
    }
    if (visUrl && !loadingVisualization) {
      const metadataSection = getFigureMetadata(props.block, viz);
      if (!metadataSection) return;

      props.onInsertBlock(props.block, metadataSection);
    }
    /* eslint-disable-next-line */
  }, [
    props.data.vis_url,
    props.data.with_metadata_section,
    loadingVisualization,
  ]);

  if (loadingVisualization || loadingProviderData) {
    return <ChartSkeleton />;
  }

  if (viz?.error) {
    return <p dangerouslySetInnerHTML={{ __html: viz.error }} />;
  }

  if (!chart) {
    return null;
  }

  if (!Object.keys(chart).length) {
    return (
      <p>
        No valid data for this{' '}
        <a rel="noopener" href={visualization_id} target="_blank">
          Chart (Interactive)
        </a>
        .
      </p>
    );
  }

  return (
    <>
      <div className="embed-visualization">
        {!initialized && <ChartSkeleton />}
        <Grid
          className="visualization-wrapper"
          reversed={variation === 'filters_on_right' && 'computer'}
        >
          <GridRow>
            {filters?.length > 0 && (
              <GridColumn
                computer={variation !== 'filters_on_top' ? 4 : 12}
                mobile={12}
              >
                {initialized && (
                  <div className={cx('visualization-filters', variation)}>
                    {filters.map((filter, index) => {
                      const options = getFilterOptions(
                        dataSources[filter.field],
                        dataSources['filtersOrder'],
                      );
                      return (
                        <FormField key={filter.field || index}>
                          <label>{filter.label}</label>
                          <Select
                            options={options}
                            value={filter.data || filter.defaultData}
                            onChange={(data) => {
                              setFilters((filters) => {
                                const newFilters = [...filters];
                                newFilters[index] = {
                                  ...newFilters[index],
                                  data,
                                };
                                return newFilters;
                              });
                            }}
                          />
                        </FormField>
                      );
                    })}
                  </div>
                )}
              </GridColumn>
            )}
            <GridColumn
              computer={
                filters?.length > 0 && variation !== 'filters_on_top' ? 8 : 12
              }
              mobile={12}
            >
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
                        sources={
                          data_provenance?.data || props.data?.chartSources
                        }
                      />
                    )}
                    {with_more_info && <MoreInfo href={visualization_id} />}
                  </div>
                  <div className="right-col">
                    {download_button && (
                      <Download
                        chartRef={chartRef}
                        chart={{
                          chartData: chart,
                          data_source: viz?.data_source,
                        }}
                        title={title}
                        provider_data={provider_data}
                        provider_metadata={provider_metadata}
                        filters={filters}
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
            </GridColumn>
          </GridRow>
        </Grid>
      </div>
    </>
  );
}

export default compose(
  injectLazyLibs(['reactSelect']),
  connectBlockToVisualization((props) => {
    const url = flattenToAppURL(props.data?.vis_url);
    const currentUrl = props.data.visualization
      ? flattenToAppURL(props.data.visualization['@id'])
      : null;

    const shouldFetchVisualization =
      !props.data.visualization?.error &&
      url &&
      (!props.data.visualization || currentUrl !== url);
    return {
      vis_url: shouldFetchVisualization ? url : null,
    };
  }),
  connect((state, props) => {
    const viz = props.visualization || props.data?.visualization || {};
    return {
      screen: state.screen,
      viz,
    };
  }),
  connectToProviderData((props) => {
    return {
      provider_url: props.viz.provider_url,
    };
  }),
)(ConnectedChart);
