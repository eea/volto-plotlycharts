import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { compose } from 'redux';
import { useLocation } from 'react-router-dom';
import { cloneDeep, isEqual, isNil, sortBy, debounce } from 'lodash';
import DefaultPlotlyEditor, { constants } from 'react-chart-editor';
import plotly from 'plotly.js/dist/plotly-with-meta';

import { Api } from '@plone/volto/helpers';

import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import {
  updateTrace,
  updateDataSources,
} from '@eeacms/volto-plotlycharts/helpers/plotly';

import { TemplateSelector } from './widgets';
import DefaultEditor from './DefaultEditor';

import chartHelp from './chartHelp.json';

const config = { editable: false, displayModeBar: false, responsive: true };

const withValue = (WrappedComponent) => {
  return forwardRef((props, ref) => {
    const [value, onChangeValue] = useState(
      cloneDeep(props.initialValue || props.value),
    );

    return (
      <WrappedComponent
        {...props}
        ref={ref}
        value={value}
        onChangeValue={onChangeValue}
      />
    );
  });
};

const UnconnectedPlotlyEditor = forwardRef((props, ref) => {
  const update = useRef({});
  const flags = useRef({});
  const editor = useRef();
  const {
    value,
    actions,
    children,
    isTheme,
    isTemplate,
    provider_data,
    loadingProviderData: connectorLoading,
    onApply,
    onClose,
    onChangeValue,
  } = props;
  const location = useLocation();
  const [, forceRender] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [themes, setThemes] = useState([...(props.themes || [])]);
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const connectorLoaded = !isNil(provider_data) && !connectorLoading;

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
    return (value.data || []).reduce((acc, trace) => {
      const updatedTrace = updateDataSources(
        updateTrace(trace),
        dataSources,
        constants.TRACE_SRC_ATTRIBUTES,
      );

      acc.push(updatedTrace);
      return acc;
    }, []);
  }, [value.data, dataSources]);

  const layout = useMemo(() => {
    return updateDataSources(
      value.layout || {},
      dataSources,
      constants.LAYOUT_SRC_ATTRIBUTES,
    );
  }, [value.layout, dataSources]);

  const ctx = useMemo(
    () => ({
      actions,
      editor() {
        return editor.current;
      },
      location,
      themes,
      value: {
        ...value,
        data,
        layout,
      },
      connectorLoaded,
      connectorLoading,
      onChangeValue,
    }),
    [
      actions,
      location,
      themes,
      value,
      data,
      layout,
      connectorLoaded,
      connectorLoading,
      onChangeValue,
    ],
  );

  const onUpdate = debounce(() => {
    if (Object.keys(update).length > 0) {
      onChangeValue({
        ...value,
        ...update.current,
      });
      update.current = {};
    }
  }, 40);

  function onInitialized(...args) {
    if (props.onInitialized) {
      props.onInitialized(...args);
    }
    setInitialized(true);
  }

  useImperativeHandle(ref, () => ({
    editor() {
      return editor.current;
    },
  }));

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
    if (!initialized || flags.current.themeSynced || !themes.length) {
      return;
    }

    function updateTemplate(template) {
      editor.current.onUpdate({
        type: constants.EDITOR_ACTIONS.UPDATE_LAYOUT,
        payload: {
          update: {
            template,
          },
        },
      });
      flags.current.themeSynced = true;
    }

    // Set the first theme as default
    if (!layout.template && window.location.pathname.endsWith('/add')) {
      updateTemplate(themes[0]);
    }
    // Sync the theme
    if (layout.template?.id) {
      const theme = themes.find((t) => t.id === layout.template.id);
      if (theme && !isEqual(theme, layout.template)) {
        updateTemplate(theme);
      }
    }
  }, [initialized, themes, layout.template]);

  return (
    <DefaultPlotlyEditor
      ref={editor}
      plotly={plotly}
      data={data}
      layout={layout}
      frames={value.frames || []}
      config={config}
      columns={value.columns || []}
      dataSources={dataSources}
      dataSourcesSubset={value.dataSources}
      dataSourceOptions={dataSourceOptions}
      onUpdate={(data, layout) => {
        update.current = {
          ...update.current,
          data,
          layout,
        };
        onUpdate();
      }}
      onUpdateDataSources={(dataSources, columns) => {
        update.current = {
          ...update.current,
          dataSources,
          columns,
        };
        onUpdate();
      }}
      onInitialized={onInitialized}
      forceRender={() => forceRender({})}
      ctx={ctx}
      divId="gd"
      slots={{
        ...(initialized && !isTheme && !isTemplate && !value.data?.length
          ? {
              'grid-and-plot': (
                <TemplateSelector
                  loadDataSources={editor.current.loadDataSources}
                  groupedTemplates={groupedTemplates}
                  value={value}
                  dataSources={dataSources}
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
        onApply={() => onApply(value)}
        onClose={onClose}
      >
        {children}
      </DefaultEditor>
    </DefaultPlotlyEditor>
  );
});

const ConnectedPlotlyEditor = compose(
  withValue,
  connectToProviderData((props) => ({
    provider_url: props.value.provider_url,
  })),
)(UnconnectedPlotlyEditor);

const PlotlyEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(
    cloneDeep(props.initialValue || props.value),
  );

  return (
    <ConnectedPlotlyEditor
      {...props}
      ref={ref}
      value={value}
      onChangeValue={setValue}
    />
  );
});

export default PlotlyEditor;
