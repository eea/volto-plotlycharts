import React, { useEffect, useMemo } from 'react';
import { withRouter } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import {
  getVisualization,
  removeVisualization,
} from '@eeacms/volto-plotlycharts/actions';

/**
 * connectBlockToVisualization.
 *
 * @param {} WrappedComponent
 */
function connectBlockToVisualization(getConfig = () => ({})) {
  return (WrappedComponent) => {
    return connect((state) => ({
      data_visualizations: state.data_visualizations,
    }))(
      withRouter((props) => {
        const dispatch = useDispatch();
        const config = useMemo(() => getConfig(props), [props]);

        const vis_url = useMemo(() => config.vis_url, [config.vis_url]);
        const use_live_data = useMemo(() => config.use_live_data ?? true, [
          config.use_live_data,
        ]);

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
          if (visualization_data) {
            dispatch(removeVisualization(vis_url));
          }
          /* eslint-disable-next-line */
        }, [use_live_data]);

        useEffect(() => {
          if (readyToDispatch) {
            dispatch(getVisualization(vis_url, use_live_data));
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
  };
}

export default connectBlockToVisualization;
