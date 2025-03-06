import React, { Component } from 'react';
import { cloneDeep, merge, pick } from 'lodash';

const sanitizeVisualization = (WrappedComponent) =>
  class extends Component {
    constructor(props) {
      super(props);
      this.sanitize = this.sanitize.bind(this);
      this.state = {
        ...this.sanitize(),
      };
    }

    sanitize(value) {
      const v = cloneDeep(value || this.props.value);
      if (!v) return {};
      const provider_url = this.props.provider_url || v.provider_url;
      return {
        chartData: pick(v.chartData, ['data', 'layout', 'frames']),
        dataSources: merge(v.data_source, v.dataSources),
        ...(provider_url ? { provider_url } : {}),
        ...(v.variation ? { variation: v.variation } : {}),
        ...(v.filters ? { filters: v.filters } : {}),
        ...(v.id ? { id: v.id } : {}),
        ...(v.type ? { type: v.type } : {}),
        ...(v.label ? { label: v.label } : {}),
      };
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          value={this.state}
          onChangeValue={(value) => {
            this.setState(value);
          }}
        />
      );
    }
  };

// const sanitizeVisualization = (WrappedComponent) => (props) => {
//   const [value, setValue] = React.useState({ ...sanitize() });

//   function sanitize(value) {
//     const v = cloneDeep(value || props.value);
//     if (!v) return {};
//     const provider_url = props.provider_url || v.provider_url;
//     return {
//       chartData: pick(v.chartData, ['data', 'layout', 'frames']),
//       dataSources: merge(v.data_source, v.dataSources),
//       ...(provider_url ? { provider_url } : {}),
//       ...(v.variation ? { variation: v.variation } : {}),
//       ...(v.filters ? { filters: v.filters } : {}),
//       ...(v.id ? { id: v.id } : {}),
//       ...(v.type ? { type: v.type } : {}),
//       ...(v.label ? { label: v.label } : {}),
//     };
//   }

//   return (
//     <WrappedComponent
//       {...props}
//       value={value}
//       onChangeValue={(value) => {
//         setValue(value);
//       }}
//     />
//   );
// };

export default sanitizeVisualization;
