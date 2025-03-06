import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { compose } from 'redux';
import { isNil, pick, sortBy } from 'lodash';
import DefaultPlotlyEditor, { constants } from 'react-chart-editor';
import plotly from 'plotly.js/dist/plotly';

import { Api } from '@plone/volto/helpers';

import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import {
  updateTrace,
  updateContainerDataSources,
} from '@eeacms/volto-plotlycharts/helpers/plotly';

import { TemplateSelector } from './widgets';
import DefaultEditor from './DefaultEditor';

import chartHelp from './chartHelp.json';

const config = { editable: false };

const PlotlyEditor = forwardRef((props, ref) => {
  const editor = useRef();
  const {
    actions,
    children,
    isTheme,
    isTemplate,
    location,
    provider_data,
    value,
    loadingProviderData: connectorLoading,
    onChangeValue,
    onApply,
    onClose,
  } = props;
  const [initialized, setInitialized] = useState(false);
  const [themes, setThemes] = useState([...(props.themes || [])]);
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const connectorLoaded = !isNil(provider_data) && !connectorLoading;

  useImperativeHandle(ref, () => ({
    editor() {
      return editor.current;
    },
  }));

  const dataSources = useMemo(
    () => ({ ...(provider_data || {}), ...(value.dataSources || {}) }),
    [provider_data, value.dataSources],
  );

  const dataSourceOptions = useMemo(
    () =>
      Object.keys(dataSources).map((name) => ({
        value: name,
        label: name,
      })),
    [dataSources],
  );

  const data = useMemo(() => {
    return (value.chartData.data || []).reduce((acc, trace) => {
      const updatedTrace = updateContainerDataSources(
        {
          ...updateTrace(trace),
        },
        dataSources,
        constants.TRACE_SRC_ATTRIBUTES,
      );

      acc.push(updatedTrace);
      return acc;
    }, []);
  }, [value.chartData.data, dataSources]);

  const layout = useMemo(() => {
    return updateContainerDataSources(
      value.chartData.layout || {},
      dataSources,
      constants.LAYOUT_SRC_ATTRIBUTES,
    );
  }, [value.chartData.layout, dataSources]);

  const ctx = useMemo(
    () => ({
      actions,
      value: {
        ...value,
        chartData: {
          ...(value.chartData || {}),
          data,
          layout,
        },
      },
      themes,
      connectorLoaded,
      connectorLoading,
      onChangeValue,
    }),
    [
      actions,
      value,
      data,
      layout,
      themes,
      connectorLoaded,
      connectorLoading,
      onChangeValue,
    ],
  );

  async function onInitialized(...args) {
    const { data, layout, frames } = args[0];

    onChangeValue({
      ...value,
      chartData: {
        data,
        layout,
        frames,
      },
    });

    if (props.onInitialized) {
      props.onInitialized(...args);
    }

    setInitialized(true);
  }

  useEffect(() => {
    // Load templates and themes
    if (!isTheme && !isTemplate) {
      const api = new Api();
      api.get('/@plotly_settings').then((res) => {
        const data = {};
        res.templates.forEach((template, index) => {
          const type = template.type?.value || 'unknown';
          if (!data[type]) {
            data[type] = [];
          }
          data[type].push({
            ...template,
            index,
          });
        });
        Object.keys(data).forEach((key) => {
          data[key] = sortBy(data[key], ['label', 'index']);
        });
        setGroupedTemplates(data);
        setThemes(res.themes);
      });
    }
  }, [isTheme, isTemplate]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    // Set the first theme as default
    if ((!layout.template || !layout.template.id) && themes.length) {
      const theme = themes[0];
      editor.current.onUpdate({
        type: constants.EDITOR_ACTIONS.UPDATE_LAYOUT,
        payload: {
          update: {
            template: pick(theme, ['id', 'data', 'layout']),
          },
        },
      });
    }
  }, [initialized, themes, layout.template]);

  console.log(plotly.makeTemplate({ data, layout }));

  return (
    <DefaultPlotlyEditor
      ref={editor}
      plotly={plotly}
      data={data}
      layout={layout}
      frames={value.chartData.frames || []}
      config={config}
      dataSources={dataSources}
      dataSourcesSubset={value.dataSources}
      dataSourceOptions={dataSourceOptions}
      onUpdate={(data, layout, frames) => {
        onChangeValue({
          ...value,
          chartData: {
            data,
            layout,
            frames,
          },
        });
      }}
      onUpdateDataSources={(dataSources) => {
        onChangeValue({
          ...value,
          dataSources,
        });
      }}
      onInitialized={onInitialized}
      ctx={ctx}
      divId="gd"
      slots={{
        ...(initialized &&
        !isTheme &&
        !isTemplate &&
        !value.chartData.data?.length
          ? {
              'grid-and-plot': (
                <TemplateSelector
                  loadDataSources={editor.current.loadDataSources}
                  groupedTemplates={groupedTemplates}
                  value={value}
                  dataSourceOptions={dataSourceOptions}
                  onChangeValue={onChangeValue}
                />
              ),
            }
          : {}),
      }}
      fontOptions={[
        {
          label: 'Roboto, Sans Serif',
          value: 'Roboto, sans-serif',
        },
        { label: 'Serif', value: 'serif' },
        { label: 'Monospaced', value: 'monospace' },
      ]}
      makeDefaultTrace={() => ({ orientation: 'v', type: 'bar' })}
      chartHelp={chartHelp}
      useResizeHandler
      advancedTraceTypeSelector
      showFieldTooltips
    >
      <DefaultEditor
        isTheme={isTheme}
        isTemplate={isTemplate}
        location={location}
        onApply={onApply}
        onClose={onClose}
      >
        {children}
      </DefaultEditor>
    </DefaultPlotlyEditor>
  );
});

export default compose(
  connectToProviderData((props) => ({
    provider_url: props.value.provider_url,
  })),
)(PlotlyEditor);
