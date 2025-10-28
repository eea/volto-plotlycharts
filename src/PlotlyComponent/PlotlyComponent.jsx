import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { mapKeys, isArray, uniqBy, sortBy, isNil, debounce } from 'lodash';
import cx from 'classnames';
import { FormField } from 'semantic-ui-react';
// import { constants } from '@eeacms/react-chart-editor';
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
import {
  getMetadataFlags,
  processMetadataArrays,
} from '@eeacms/volto-plotlycharts/Utils/utils';

// generateCSVForDataset,
// generateOriginalCSV,

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

function stripHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function UnconnectedPlotlyComponent(props) {
  const { reactChartEditor } = props;
  const { constants } = reactChartEditor;
  const container = useRef();
  const el = useRef();
  const blockEditorEl = useRef();
  const Select = props.reactSelect.default;
  const {
    block,
    metadata,
    mode,
    properties,
    provider_data,
    provider_metadata,
    isPrint,
    selfProvided,
    onInsertBlock,
    onSelectBlock,
    onDeleteBlock,
  } = props;
  const { height, vis_url, with_metadata_section = true } = props.data;
  const [initialized, setInitialized] = useState(false);
  const [filtersState, setFiltersState] = useState([]);
  const [autoscaleHeight, setAutoscaleHeight] = useState(null);
  const [autoscaleWidth, setAutoscaleWidth] = useState(null);
  // Track measured container width for responsive behavior
  const [measuredWidth, setMeasuredWidth] = useState(null);

  const loadingVisualization =
    !props.failedVisualization && props.loadingVisualization;
  const loadingProviderData =
    isNil(provider_data) &&
    !props.failedProviderData &&
    props.loadingProviderData;

  const variation = props.data.visualization?.variation || 'filters_on_top';

  // Derive mobile state from isPrint and measured width (no separate state needed)
  // This eliminates cascading state updates and multiple useEffects
  const mobile = isPrint || (measuredWidth !== null && measuredWidth < 768);

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
          value: filter.data?.value || null,
        });
      });

      acc.push(updatedTrace);
      return acc;
    }, []);
  }, [value.data, dataSources, filters, constants.TRACE_SRC_ATTRIBUTES]);

  const layout = useMemo(() => {
    const baseLayout = updateDataSources(
      value.layout || {},
      dataSources,
      constants.LAYOUT_SRC_ATTRIBUTES,
    );

    // When in mobile/print mode, remove fixed width to allow responsive behavior
    if (mobile) {
      const { width, ...layoutWithoutWidth } = baseLayout;
      return {
        ...layoutWithoutWidth,
        autosize: true, // Ensure autosize is enabled
      };
    }

    return baseLayout;
  }, [value.layout, dataSources, constants.LAYOUT_SRC_ATTRIBUTES, mobile]);

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
              columns: value.columns?.map((column) => column.key) || [],
            },
          }
        : {}),
    };
  }, [props.data, data, layout, dataSources, value.columns]);

  const defaultHeight = useMemo(() => {
    return height || layout._height || layout.height || 450;
  }, [height, layout._height, layout.height]);

  // Define the core scale update logic as a separate function
  const updateScaleCore = useCallback(() => {
    if (!container.current || !layout.autoscale) return;

    const vizEl = container.current.querySelector('.visualization');
    if (!vizEl) return;

    const vizWrapperEl = vizEl.parentElement;

    let blockEditorWidth = 0;

    if (typeof blockEditorEl.current === 'undefined') {
      let el = container.current;

      while (el && el !== document.body) {
        if (el.classList && el.classList.contains('block-editor-group')) {
          blockEditorEl.current = el;
          break;
        }
        el = el.parentElement;
        if (el === document.body) {
          blockEditorEl.current = null;
        }
      }
    }

    if (blockEditorEl.current) {
      blockEditorWidth = blockEditorEl.current.firstChild.clientWidth;
    }

    // Get the visualization container width
    const vizWidth = vizWrapperEl.clientWidth;

    // If we have a block editor group width, use that as a constraint
    const availableWidth =
      blockEditorWidth > 0 ? Math.min(vizWidth, blockEditorWidth) : vizWidth;

    let minWidth = autoscaleWidth;
    if (!minWidth && layout?.width) {
      minWidth = layout.width;
    } else if (!minWidth) {
      minWidth = vizWidth;
    }

    if (!autoscaleWidth) {
      setAutoscaleWidth(minWidth);
    }

    // Use the available width (constrained by block-editor-group if present) for scaling
    const scale = Math.min(availableWidth / minWidth, 1);
    vizEl.style.transform = `scale(${scale})`;
    vizEl.style.transformOrigin = 'left top';
    vizEl.style.width = `${availableWidth}px`;
    vizEl.style.height = `${scale * defaultHeight}px`;

    setAutoscaleHeight(scale * defaultHeight);
  }, [defaultHeight, autoscaleWidth, layout, blockEditorEl]);

  // Create a debounced version for event handlers
  const updateScale = useMemo(
    () => debounce(() => updateScaleCore(), 150),
    [updateScaleCore],
  );

  function onInitialized(...args) {
    if (props.onInitialized) {
      props.onInitialized(...args);
    }
    updateScaleCore();
    setInitialized(true);
  }

  // Measure container width for responsive behavior
  useEffect(() => {
    if (!container.current) return;

    const measureWidth = () => {
      // Use parent container width or window width
      // Don't use container.current width as it may be constrained by maxWidth
      const parentWidth = container.current.parentElement?.offsetWidth || 0;
      const windowWidth = window.innerWidth;
      const availableWidth = parentWidth || windowWidth;
      setMeasuredWidth(availableWidth);
    };

    // Initial measurement
    measureWidth();

    // Use ResizeObserver for efficient resize detection
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measureWidth);
      resizeObserver.observe(container.current);
    } else {
      // Fallback to window resize listener for older browsers
      window.addEventListener('resize', measureWidth);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', measureWidth);
      }
    };
  }, []);

  // Notify Plotly when mobile state changes (derived from isPrint or width)
  useEffect(() => {
    if (!initialized || !el.current) return;

    // Use requestAnimationFrame to ensure DOM has updated
    const rafId = requestAnimationFrame(() => {
      // Trigger Plotly's resize handler if available
      if (el.current && typeof el.current.resizeHandler === 'function') {
        el.current.resizeHandler();
      } else {
        // Fallback: dispatch resize event only if Plotly doesn't expose resize API
        window.dispatchEvent(new Event('resize'));
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [initialized, mobile]);

  // Update scale
  useEffect(() => {
    if (!initialized) return;

    if (layout.autoscale) {
      // Call immediately without debounce for initial render
      updateScaleCore(); // Use non-debounced version for immediate execution
      window.addEventListener('resize', updateScale); // Use debounced version for event handler
    }

    return () => {
      // Clean up event listener and cancel any pending debounced calls
      window.removeEventListener('resize', updateScale);
      updateScale.cancel();
    };
  }, [initialized, layout.autoscale, updateScale, updateScaleCore]);

  // Manage metadata section in edit mode
  // Use ref to track if metadata has been initialized to prevent repeated insertions
  const metadataInitialized = useRef(false);

  useEffect(() => {
    if (mode !== 'edit') return;

    // Handle metadata section removal
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
      metadataInitialized.current = false;
      return;
    }

    // Handle metadata section insertion (only once when conditions are met)
    if (vis_url && !loadingVisualization && !metadataInitialized.current) {
      const position = getFigurePosition(metadata || properties, block);
      const metadataSection = getFigureMetadata(
        block,
        props.data.properties,
        position,
      );
      if (metadataSection) {
        onInsertBlock(block, metadataSection);
        metadataInitialized.current = true;
      }
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
      data-chart-id={block}
    >
      {initialized && filters.length > 0 && (
        <div className="visualization-filters">
          {filters.map((filter, index) => {
            const options = getFilterOptions(
              dataSources[filter.field],
              dataSources['filtersOrder'],
            );
            return (
              <FormField key={index}>
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
      <div
        className={cx('visualization-wrapper', {
          loading: loadingVisualization || loadingProviderData || !initialized,
        })}
      >
        {(loadingVisualization || loadingProviderData || !initialized) && (
          <Placeholder />
        )}
        {!loadingProviderData && (
          <div
            className={cx('visualization', { autoscale: layout.autoscale })}
            style={{
              '--svg-container-height': `${autoscaleHeight || defaultHeight}px`,
            }}
          >
            <Plot
              ref={el}
              data={data}
              layout={layout}
              autoscale={layout.autoscale}
              onInitialized={onInitialized}
            />
          </div>
        )}
      </div>
      {initialized && (
        <Toolbar
          el={el}
          chartData={{
            data,
            layout,
            height,
            minWidth: autoscaleWidth,
          }}
          filters={filters}
          data={toolbarData}
          provider_metadata={provider_metadata}
          enlargeContent={<Plot data={data} layout={layout} />}
        />
      )}

      <WithChartEditorLibEmbedData
        {...props}
        data={toolbarData}
        provider_metadata={provider_metadata}
      />
    </div>
  );
}

function prepareEmbedData(dataSources, provider_metadata, core_metadata) {
  let array = [];
  Object.entries(dataSources).forEach(([key, items]) => {
    items.forEach((item, index) => {
      if (!array[index]) array[index] = {};
      array[index][key] = item;
    });
  });

  let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];
  const metadataFlags = getMetadataFlags(core_metadata);
  const metadataArrays = processMetadataArrays(core_metadata, metadataFlags);

  return { array, readme, metadataArrays, metadataFlags };
}

function Table({ rows }) {
  const stableKeys = Object.keys(rows?.[0] || {});

  return (
    <table className="embed-data-table">
      <thead>
        <tr>
          {stableKeys.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {stableKeys.map((key) => (
              <td key={key}>{row[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmbedData(props) {
  const { provider_metadata, content, block } = props; // reactChartEditorLib,
  const visualization = props.data?.visualization || {};
  const { dataSources = {}, layout } = visualization;

  const {
    data_provenance,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = props.data?.properties || {};

  const core_metadata = {
    data_provenance: data_provenance?.data,
    other_organisations,
    temporal_coverage: temporal_coverage?.temporal,
    publisher,
    geo_coverage: geo_coverage?.geolocation,
  };

  const embedData = prepareEmbedData(
    dataSources,
    provider_metadata,
    core_metadata,
  );
  const { array, readme, metadataArrays, metadataFlags } = embedData;

  return (
    <div
      className="figure-data-table"
      data-for-chart-id={block}
      style={{ display: 'none' }}
    >
      <h3 className="page-title">{content.title}</h3>
      {!!layout?.title?.text && (
        <h4 className="chart-title">{stripHtml(layout.title.text)}</h4>
      )}
      {!!layout?.title?.subtitle?.text && (
        <h4 className="chart-sub-title">
          {stripHtml(layout.title.subtitle.text)}
        </h4>
      )}
      {!!layout?.xaxis?.title?.text && (
        <p className="x-axis-label">{stripHtml(layout.xaxis.title.text)}</p>
      )}
      {!!layout?.yaxis?.title?.text && (
        <p className="y-axis-label">{stripHtml(layout.yaxis.title.text)}</p>
      )}

      <Table rows={array} />

      {metadataFlags.hasDataProvenance && (
        <>
          <h4>Data Provenance</h4>
          <Table rows={metadataArrays.data_provenance_array} />
        </>
      )}
      {metadataFlags.hasOtherOrganisation && (
        <>
          <h4>Other Organisations</h4>
          <Table rows={metadataArrays.other_organisation_array} />
        </>
      )}
      {metadataFlags.hasTemporalCoverage && (
        <>
          <h4>Temporal Coverage</h4>
          <Table rows={metadataArrays.temporal_coverage_array} />
        </>
      )}
      {metadataFlags.hasGeoCoverage && (
        <>
          <h4>Geographical Coverage</h4>
          <Table rows={metadataArrays.geo_coverage_array} />
        </>
      )}
      {metadataFlags.hasPublisher && (
        <>
          <h4>Publisher</h4>
          <Table rows={metadataArrays.publisher_array} />
        </>
      )}

      <div>{readme}</div>
    </div>
  );
}

const WithChartEditorLibEmbedData = injectLazyLibs(['reactChartEditorLib'])(
  EmbedData,
);

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
    isPrint: state.print?.isPrint || false,
    selfProvided:
      props.data.visualization?.provider_url === props.data.properties?.['@id'],
  })),
  injectLazyLibs(['reactSelect', 'reactChartEditor']),
)(UnconnectedPlotlyComponent);

export default function PlotlyComponent(props) {
  return (
    <VisibilitySensor>
      <ConnectedPlotlyComponent {...props} />
    </VisibilitySensor>
  );
}
