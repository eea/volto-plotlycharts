import React, { forwardRef } from 'react';
import { cloneDeep, merge } from 'lodash';

const sanitizeVisualization = (WrappedComponent) =>
  forwardRef((props, ref) => {
    const [value, setValue] = React.useState({ ...sanitize() });

    function sanitize(value) {
      const v = cloneDeep(value || props.initialValue || props.value);
      if (!v) return {};
      const provider_url = props.provider_url || v.provider_url;
      return {
        data: v.chartData?.data || v.data || [],
        layout: v.chartData?.layout || v.layout || {},
        // frames: v.chartData?.frames || v.frames || [],
        dataSources: merge(v.data_source, v.dataSources),
        ...(provider_url ? { provider_url } : {}),
        ...(v.variation ? { variation: v.variation } : {}),
        ...(v.filters ? { filters: v.filters } : {}),
        ...(v.id ? { id: v.id } : {}),
        ...(v.type ? { type: v.type } : {}),
        ...(v.label ? { label: v.label } : {}),
      };
    }

    return (
      <WrappedComponent
        {...props}
        ref={ref}
        value={value}
        onChangeValue={(value) => {
          setValue(value);
        }}
      />
    );
  });

export default sanitizeVisualization;
