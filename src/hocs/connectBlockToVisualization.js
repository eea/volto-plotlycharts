import React, { useEffect } from 'react';
import { withRouter } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import { getChartDataFromVisualization } from '../actions';

/**
 * connectBlockToVisualization.
 *
 * @param {} WrappedComponent
 */
export function connectBlockToVisualization(WrappedComponent, config = {}) {
  return connect((state) => ({
    data_visualizations: state.data_visualizations,
  }))(
    withRouter((props) => {
      const dispatch = useDispatch();

      const { vis_url = null, chartData = null } = props.data || {};

      const isPending = vis_url
        ? props.data_visualizations?.pendingVisualizations?.[vis_url]
        : false;

      const isFailed = vis_url
        ? props.data_visualizations?.failedVisualizations?.[vis_url]
        : false;

      const visualization_data = vis_url
        ? props.data_visualizations?.data?.[vis_url]
        : null;

      const readyToDispatch =
        vis_url && !visualization_data && !isPending && !isFailed;

      useEffect(() => {
        if (readyToDispatch && !chartData) {
          dispatch(getChartDataFromVisualization(vis_url));
        }
      });

      return (
        <WrappedComponent
          {...props}
          visualization_data={visualization_data}
          loadingVisualizationData={isPending}
        />
      );
    }),
  );
}

export default connectBlockToVisualization;
