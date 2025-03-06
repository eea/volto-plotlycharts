import { isArray, isEqual, isString } from 'lodash';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {
  constants,
  getAdjustedSrcAttr,
  getAttrsPath,
  getColumnNames,
  getSrcAttr,
  maybeTransposeData,
} from 'react-chart-editor/lib';

export function getPlotlyDataSources({ data, layout, originalDataSources }) {
  const dataSources = {
    ...originalDataSources,
  };
  const update = {
    layout: {},
    traces: [],
  };
  const unsyncedAttrs = [];

  const attrs = [
    ...data.reduce((acc, trace, index) => {
      Object.entries(
        getAttrsPath(trace, constants.TRACE_SRC_ATTRIBUTES),
      ).forEach(([attr, value]) => {
        acc.push({
          attr,
          value,
          index,
          trace: true,
        });
      });
      return acc;
    }, []),
    ...Object.entries(
      getAttrsPath(layout, constants.LAYOUT_SRC_ATTRIBUTES),
    ).reduce((acc, [attr, value]) => {
      acc.push({
        attr,
        value,
        layout: true,
      });
      return acc;
    }, []),
  ];

  attrs.forEach((_attr) => {
    const { attr, value, trace, layout, index } = _attr;
    const container = trace ? data[index] : layout;
    const srcAttr = getSrcAttr(container, attr);
    const attrData = maybeTransposeData(value, srcAttr.key, container.type);
    if (isArray(srcAttr.value)) {
      srcAttr.value.forEach((key, index) => {
        dataSources[key] = attrData[index];
      });
    }
    if (isString(srcAttr.value) && srcAttr.value) {
      dataSources[srcAttr.value] = attrData;
    }
    if (!srcAttr.value) {
      unsyncedAttrs.push(_attr);
    }
  });

  unsyncedAttrs.forEach((_attr) => {
    const { attr, value, trace, layout, index } = _attr;

    function updateAttr(attr, value) {
      if (layout && attr.includes('meta.columnNames')) {
        return;
      }
      if (trace && !update.traces[index]) {
        update.traces[index] = {};
      }
      if (trace) {
        update.traces[index][attr] = value;
      }
      if (layout) {
        update.layout[attr] = value;
      }
    }

    const container = trace ? data[index] : layout;
    const srcAttr = getSrcAttr(container, attr);
    srcAttr.value = [];

    const inDataSources = (arr) => {
      let key = null;
      const found = Object.keys(dataSources).some((k) => {
        if (isEqual(arr, dataSources[k])) {
          key = k;
          return true;
        }
        return false;
      });
      return [found, key];
    };

    const generateKey = () => {
      let k = 1;
      while (`${attr}_${k}` in dataSources) {
        k++;
      }
      return `${attr}_${k}`;
    };

    let attrData = maybeTransposeData(value, srcAttr.key, container.type);

    updateAttr(attr, attrData);

    attrData =
      isArray(attrData) && isArray(attrData[0]) ? attrData : [attrData];

    attrData.forEach((d) => {
      if (!d) {
        return;
      }
      const [found, key] = inDataSources(d);
      if (found) {
        srcAttr.value.push(key);
      } else {
        const k = generateKey();
        dataSources[k] = d;
        srcAttr.value.push(k);
      }
    });

    srcAttr.value = getAdjustedSrcAttr(srcAttr).value;
    updateAttr(srcAttr.key, srcAttr.value);
    updateAttr(
      `meta.columnNames.${attr}`,
      srcAttr.value
        ? getColumnNames(
            typeof srcAttr.value === 'string' ? [srcAttr.value] : srcAttr.value,
            Object.keys(dataSources).map((name) => ({
              value: name,
              label: name,
            })),
          )
        : null,
    );
  });

  return [dataSources, update];
}

export function updateTrace(trace) {
  return {
    ...trace,
    ...(trace.type === 'scatterpolar' &&
      trace.connectgaps &&
      trace.mode === 'lines' && {
        r: [...trace.r, trace.r[0]],
        theta: [...trace.theta, trace.theta[0]],
      }),
  };
}

export function updateContainerDataSources(
  container,
  dataSources,
  srcAttributes,
) {
  const newContainer = { ...container };
  Object.entries(getAttrsPath(container, srcAttributes)).forEach(([attr]) => {
    const srcAttr = getSrcAttr(container, attr);
    if (!srcAttr.value) {
      return;
    }
    let data;
    if (Array.isArray(srcAttr.value)) {
      data = srcAttr.value
        .filter((v) => Array.isArray(dataSources[v]))
        .map((v) => dataSources[v]);
    } else {
      data = dataSources[srcAttr.value] || null;
    }
    nestedProperty(newContainer, attr).set(
      maybeTransposeData(data, srcAttr.key, container.type),
    );
  });

  return newContainer;
}
