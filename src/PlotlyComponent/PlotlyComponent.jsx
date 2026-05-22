// import { constants } from '@eeacms/react-chart-editor';
import { VisibilitySensor } from '@eeacms/volto-datablocks/components';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { Toolbar } from '@eeacms/volto-plotlycharts/Utils';
import {
  getMetadataFlags,
  processMetadataArrays,
} from '@eeacms/volto-plotlycharts/Utils/utils';
import {
  deleteGeneratedFigureMetadataBlock,
  getFigureMetadata,
  getFigurePosition,
  insertFigureMetadataBeforeBlock,
} from '@eeacms/volto-plotlycharts/helpers';
import {
  updateDataSources,
  updateTrace,
} from '@eeacms/volto-plotlycharts/helpers/plotly';
import { applyFilters } from '@eeacms/volto-plotlycharts/helpers/transforms';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import cx from 'classnames';
import debounce from 'lodash/debounce';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { FormField } from 'semantic-ui-react';
import Placeholder from './Placeholder';
import Plot from './Plot';

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

// Only null/undefined/blank strings are empty. `0` and `false` are real data.
function isEmptyValue(value) {
  return isNil(value) || (typeof value === 'string' && value.trim() === '');
}

function UnconnectedPlotlyComponent(props) {
  const intl = useIntl();
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
    screen,
    isPrint,
    selfProvided,
    onInsertBlock,
    onChangeFormData,
    onSelectBlock,
    onDeleteBlock,
    blocksConfig,
  } = props;
  const {
    height,
    vis_url,
    with_metadata_section = true,
    llm_summary,
  } = props.data;
  const [initialized, setInitialized] = useState(false);
  const [filtersState, setFiltersState] = useState([]);
  const [autoscaleHeight, setAutoscaleHeight] = useState(null);
  const [autoscaleWidth, setAutoscaleWidth] = useState(null);
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

  const filteredDataSources = useMemo(
    () => applyFilters(dataSources, filters),
    [dataSources, filters],
  );

  const data = useMemo(() => {
    return (value.data || []).reduce((acc, trace) => {
      const updatedTrace = updateDataSources(
        updateTrace(trace),
        filteredDataSources,
        constants.TRACE_SRC_ATTRIBUTES,
      );

      acc.push(updatedTrace);
      return acc;
    }, []);
  }, [value.data, filteredDataSources, constants.TRACE_SRC_ATTRIBUTES]);

  const layout = useMemo(() => {
    const baseLayout = updateDataSources(
      value.layout || {},
      filteredDataSources,
      constants.LAYOUT_SRC_ATTRIBUTES,
    );

    // When in mobile/print mode, remove fixed width to allow responsive behavior
    if (mobile) {
      const { width, ...layoutWithoutWidth } = baseLayout;
      return {
        ...layoutWithoutWidth,
        autosize: true,
      };
    }

    return baseLayout;
  }, [
    value.layout,
    filteredDataSources,
    constants.LAYOUT_SRC_ATTRIBUTES,
    mobile,
  ]);

  const defaultHeight = useMemo(() => {
    return height || layout._height || layout.height || 450;
  }, [height, layout._height, layout.height]);

  const toolbarData = useMemo(() => {
    return {
      ...props.data,
      ...(props.data.visualization
        ? {
            visualization: {
              ...props.data.visualization,
              data,
              layout,
              dataSources: filteredDataSources,
              columns: value.columns?.map((column) => column.key) || [],
            },
          }
        : {}),
    };
  }, [props.data, data, layout, filteredDataSources, value.columns]);

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

  // Trigger resize event
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [initialized, height, variation]);

  // Set mobile state based on print mode or screen width
  useEffect(() => {
    if (isPrint) {
      // Force mobile layout for print preview
      setMobile(true);
      return;
    }

    // When not printing, determine mobile based on viewport width
    // Use screen.page.width from Redux (updated on resize) or fallback to window.innerWidth
    // Important: Don't use container.offsetWidth as it's constrained by max-width CSS
    const viewportWidth = screen?.page?.width || window.innerWidth;
    const shouldBeMobile = viewportWidth < 768;

    setMobile(shouldBeMobile);
  }, [isPrint, screen]);

  // Trigger Plotly resize when mobile state changes
  useEffect(() => {
    if (!initialized) return;
    window.dispatchEvent(new Event('resize'));
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

  // Insert metadata section
  useEffect(() => {
    if (mode !== 'edit') return;
    if (!with_metadata_section) {
      deleteGeneratedFigureMetadataBlock({
        properties,
        block,
        onDeleteBlock,
        onSelectBlock,
      });
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

      insertFigureMetadataBeforeBlock({
        properties,
        block,
        metadataSection,
        blocksConfig,
        intl,
        onChangeFormData,
        onInsertBlock,
      });
    }
  }, [
    block,
    blocksConfig,
    intl,
    metadata,
    properties,
    mode,
    vis_url,
    with_metadata_section,
    loadingVisualization,
    onChangeFormData,
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

function prepareEmbedData(
  dataSources,
  traces,
  provider_metadata,
  core_metadata,
) {
  const array = [];
  const srcKeys = traces.reduce((acc, trace) => {
    Object.keys(trace).forEach((key) => {
      if (key.endsWith('src')) {
        if (!acc.includes(trace[key])) {
          acc.push(trace[key]);
        }
      }
    });
    return acc;
  }, []);
  Object.entries(dataSources).forEach(([key, items]) => {
    if (!srcKeys.includes(key)) return;
    items.forEach((item, index) => {
      if (!array[index]) array[index] = {};
      array[index][key] = item;
    });
  });

  const readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];
  const metadataFlags = getMetadataFlags(core_metadata);
  const metadataArrays = processMetadataArrays(core_metadata, metadataFlags);

  return { array, readme, metadataArrays };
}

// Column-major rendering: one line per column, values comma-joined in their
// original row order so positional meaning is preserved. Blank cells become "-",
// fully-empty columns are dropped. Generic — also used for metadata tables.
function Table({ rows, title }) {
  if (!isArray(rows) || rows.length === 0) return null;

  // Union of keys across all rows, preserving first-appearance order.
  const keys = rows.reduce((acc, row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!acc.includes(key)) acc.push(key);
    });
    return acc;
  }, []);

  const columns = keys
    .map((key) => {
      const values = rows.map((row) =>
        isEmptyValue(row?.[key]) ? '-' : String(row[key]),
      );
      // Drop columns that carry no data at all.
      if (values.every((value) => value === '-')) return null;
      return { key, text: values.join(', ') };
    })
    .filter(Boolean);

  // No renderable column -> render nothing, including the heading. This keeps
  // the heading and its content as a single visibility decision.
  if (columns.length === 0) return null;

  return (
    <>
      {title && <p>{title}:</p>}
      <ul className="embed-data-table embed-data-list">
        {columns.map((column) => (
          <li key={column.key}>
            {column.key}: {column.text}
          </li>
        ))}
      </ul>
    </>
  );
}

function EmbedData(props) {
  const { provider_metadata, block } = props; // reactChartEditorLib,
  const visualization = props.data?.visualization || {};
  const { dataSources = {}, layout, data: traces = [] } = visualization;

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
    traces,
    provider_metadata,
    core_metadata,
  );
  const { array, readme, metadataArrays } = embedData;

  const subtitle = stripHtml(layout?.title?.subtitle?.text || '');
  const llmSummary = stripHtml(props.data?.llm_summary || '');

  return (
    <div
      className="figure-info"
      data-for-chart-id={block}
      style={{ display: 'none' }}
    >
      {!!layout?.title?.text && (
        <p className="chart-title">
          Visualization title: {stripHtml(layout.title.text)}
        </p>
      )}
      {!!subtitle && subtitle !== layout?.yaxis?.title?.text && (
        <p className="chart-sub-title">
          {layout?.yaxis?.title?.text
            ? 'Subtitle: '
            : 'Secondary label (shown as chart subtitle; may also serve as the y-axis title): '}
          {subtitle}
        </p>
      )}
      {!!llmSummary && <p className="llm-summary">Summary: {llmSummary}</p>}
      {!!layout?.xaxis?.title?.text && (
        <p className="x-axis-label">
          X axis title: {stripHtml(layout.xaxis.title.text)}
        </p>
      )}
      {!!layout?.yaxis?.title?.text && (
        <p className="y-axis-label">
          Y axis title: {stripHtml(layout.yaxis.title.text)}
        </p>
      )}

      <p className="data-reading-note">
        In each data section below, every line is one column: its values are
        listed in row order and align by position across columns — the Nth value
        in every column belongs to the same record. "-" means no value.
      </p>

      <Table title="Data" rows={array} />

      <Table
        title="Data Provenance"
        rows={metadataArrays.data_provenance_array}
      />
      <Table
        title="Other Organisations"
        rows={metadataArrays.other_organisation_array}
      />
      <Table
        title="Temporal Coverage"
        rows={metadataArrays.temporal_coverage_array}
      />
      <Table
        title="Geographical Coverage"
        rows={metadataArrays.geo_coverage_array}
      />
      <Table title="Publisher" rows={metadataArrays.publisher_array} />

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
