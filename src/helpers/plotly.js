import { isArray, isString } from 'lodash';

export function getProviderData(value) {
  const chartData = value.chartData?.data;
  if (!chartData) {
    return [{ message: 'No chart data found' }, null, null];
  }
  const keys = ['x', 'y', 'z', 'values', 'labels'];
  const occurences = {};
  const data = {};
  chartData.forEach((trace) => {
    keys.forEach((key) => {
      const sources = trace[`${key}src`];
      // Check if the trace has a key and if it's an array
      if (!trace[key] || !isArray(trace[key])) {
        return;
      }
      // Check if sources is defined and if it's a string
      if (isString(sources)) {
        occurences[sources] = (occurences[key] || 0) + 1;
        data[sources] = [...trace[key]];
        return;
      }
      // Check if sources is defined and if it's an array
      if (isArray(sources)) {
        sources.forEach((source, index) => {
          occurences[source] = (occurences[source] || 0) + 1;
          if (sources.length > 1) {
            data[source] = [...trace[key][index]];
            return;
          }
          data[source] = [...trace[key]];
        });
        return;
      }
      // If sources is not defined, define the data
      for (const handledKey in data) {
        if (
          trace[key].every((value, index) => {
            return value === data[handledKey][index];
          })
        ) {
          trace[`${key}src`] = handledKey;
          return;
        }
      }
      let legendTitle = trace.legendgroup || trace.legendgrouptitle?.text;
      legendTitle = legendTitle ? `${legendTitle.split(' ').join('_')}_` : '';
      const name =
        key === 'y'
          ? `${legendTitle}${trace.name.split(' ').join('_')}`
          : `${legendTitle}${key}`;
      occurences[name] = (occurences[name] || 0) + 1;
      if (key === 'y' && trace.name) {
        data[name] = [...trace[key]];
        trace[`${key}src`] = name;
        return;
      }
      data[`${name}${occurences[name]}`] = [...trace[key]];
      trace[`${key}src`] = `${name}${occurences[name]}`;
    });
  });
  return [null, data, value];
}
