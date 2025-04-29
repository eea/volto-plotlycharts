import { useMemo, useRef, useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { mapKeys, isArray, uniqBy, sortBy, isNil } from 'lodash';
import cx from 'classnames';
import { FormField } from 'semantic-ui-react';
import { constants } from 'react-chart-editor';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { flattenToAppURL } from '@plone/volto/helpers';
import { VisibilitySensor } from '@eeacms/volto-datablocks/components';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import {
  getFigurePosition,
  getFigureMetadata,
} from '@eeacms/volto-plotlycharts/helpers';
import {
  updateTrace,
  updateDataSources,
} from '@eeacms/volto-plotlycharts/helpers/plotly';
import { Toolbar } from '@eeacms/volto-plotlycharts/Utils';
import Plot from './Plot';
import Placeholder from './Placeholder';

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

function UnconnectedPlotlyComponent(props) {
  const container = useRef();
  const el = useRef();
  const Select = props.reactSelect.default;
  const {
    block,
    metadata,
    mode,
    properties,
    provider_data,
    provider_metadata,
    screen,
    selfProvided,
    onInsertBlock,
    onSelectBlock,
    onDeleteBlock,
  } = props;
  const { height, vis_url, with_metadata_section = true } = props.data;
  const [initialized, setInitialized] = useState(false);
  const [filtersState, setFiltersState] = useState([]);
  const [mobile, setMobile] = useState(false);

  const loadingVisualization =
    !props.failedVisualization && props.loadingVisualization;
  const loadingProviderData =
    isNil(provider_data) &&
    !props.failedProviderData &&
    props.loadingProviderData;

  const variation = props.data.visualization?.variation || 'filters_on_top';

  const filters = useMemo(
    () =>
      (props.data.visualization?.filters || []).map((filter, index) => ({
        ...filter,
        data: filter.defaultValue
          ? { label: filter.defaultValue, value: filter.defaultValue }
          : null,
        ...(filtersState[index] || {}),
      })),
    [filtersState, props.data.visualization?.filters],
  );

  const value = useMemo(
    () => props.data.visualization || {},
    [props.data.visualization],
  );

  const dataSources = useMemo(
    () =>
      selfProvided
        ? { ...(value.dataSources || {}), ...(provider_data || {}) }
        : { ...(provider_data || {}), ...(value.dataSources || {}) },
    [provider_data, value.dataSources, selfProvided],
  );

  const data = useMemo(() => {
    return (value.data || []).reduce((acc, trace) => {
      const updatedTrace = updateDataSources(
        updateTrace(trace),
        dataSources,
        constants.TRACE_SRC_ATTRIBUTES,
      );

      filters.forEach((filter) => {
        if (!updatedTrace.transforms) {
          updatedTrace.transforms = [];
        }
        updatedTrace.transforms.push({
          type: 'filter',
          target: dataSources[filter.field],
          targetsrc: filter.field,
          meta: {
            columnNames: {
              target: filter.field,
            },
          },
          value: filter.data.value,
        });
      });

      acc.push(updatedTrace);
      return acc;
    }, []);
  }, [value.data, dataSources, filters]);

  const layout = useMemo(() => {
    return updateDataSources(
      value.layout || {},
      dataSources,
      constants.LAYOUT_SRC_ATTRIBUTES,
    );
  }, [value.layout, dataSources]);

  const toolbarData = useMemo(() => {
    return {
      ...props.data,
      ...(props.data.visualization
        ? {
            visualization: {
              ...props.data.visualization,
              data,
              layout,
              dataSources,
            },
          }
        : {}),
    };
  }, [props.data, data, layout, dataSources]);

  function onInitialized(...args) {
    if (props.onInitialized) {
      props.onInitialized(...args);
    }
    setInitialized(true);
  }

  // Trigger resize event
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [initialized, height, mobile, variation]);

  // Set mobile state
  useEffect(() => {
    if (!container.current) {
      return;
    }
    const width = container.current.offsetWidth;

    if (width < 768 && !mobile) {
      setMobile(true);
    } else if (width >= 768 && mobile) {
      setMobile(false);
    }
  }, [screen, mobile]);

  // Insert metadata section
  useEffect(() => {
    if (mode !== 'edit') return;
    if (!with_metadata_section) {
      let metadataBlock = null;
      mapKeys(properties.blocks, (data, b) => {
        if (data?.['id'] === `figure-metadata-${block}`) {
          metadataBlock = b;
        }
      });
      if (metadataBlock) {
        onDeleteBlock(metadataBlock);
        onSelectBlock(block);
      }
      return;
    }
    if (vis_url && !loadingVisualization) {
      const position = getFigurePosition(metadata || properties, block);
      const metadataSection = getFigureMetadata(
        block,
        props.data.properties,
        position,
      );
      if (!metadataSection) return;

      onInsertBlock(block, metadataSection);
    }
  }, [
    block,
    metadata,
    properties,
    mode,
    vis_url,
    with_metadata_section,
    loadingVisualization,
    onInsertBlock,
    onDeleteBlock,
    onSelectBlock,
    props.data.properties,
  ]);

  if (props.data.visualization?.error) {
    return (
      <p dangerouslySetInnerHTML={{ __html: props.data.visualization.error }} />
    );
  }

  return (
    <div
      ref={container}
      className={cx('plotly-component', {
        [variation]: filters.length > 0 && variation,
        mobile,
      })}
    >
      {(loadingVisualization || loadingProviderData || !initialized) && (
        <Placeholder />
      )}
      {initialized && filters.length > 0 && (
        <div className="visualization-filters">
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
                  value={filter.data}
                  onChange={(data) => {
                    setFiltersState((filters) => {
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
      {!loadingProviderData && (
        <div
          className="visualization"
          style={
            initialized
              ? {
                  '--svg-container-height': `${
                    height || el.current?._fullLayout?.height
                  }px`,
                }
              : {}
          }
        >
          <Plot
            ref={el}
            data={data}
            layout={layout}
            onInitialized={onInitialized}
          />
        </div>
      )}
      {initialized && (
        <Toolbar
          chartData={{
            data,
            layout,
            height,
          }}
          filters={filters}
          data={toolbarData}
          provider_metadata={provider_metadata}
          enlargeContent={<Plot data={data} layout={layout} />}
        />
      )}
    </div>
  );
}

const ConnectedPlotlyComponent = compose(
  connectBlockToVisualization(function getConfig(props) {
    const url = flattenToAppURL(props.data?.vis_url);
    const viz = props.data.visualization;
    const properties = props.data.properties || {};
    const currentUrl = viz && flattenToAppURL(properties['@id']);
    const shouldFetchViz = !viz?.error && !!url && (!viz || currentUrl !== url);
    return {
      vis_url: shouldFetchViz ? url : null,
    };
  }),
  connectToProviderData(function getConfig(props) {
    return {
      provider_url: props.data.visualization?.provider_url,
    };
  }),
  connect((state, props) => ({
    screen: state.screen,
    selfProvided:
      props.data.visualization?.provider_url === props.data.properties?.['@id'],
  })),
  injectLazyLibs(['reactSelect']),
)(UnconnectedPlotlyComponent);

export default function PlotlyComponent(props) {
  return (
    <VisibilitySensor Placeholder={Placeholder}>
      <ConnectedPlotlyComponent {...props} />
    </VisibilitySensor>
  );
}
