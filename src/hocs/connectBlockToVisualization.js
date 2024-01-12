import React, { useEffect, useMemo } from 'react';
import { isUndefined } from 'lodash';
import { withRouter } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import { getVisualization } from '@eeacms/volto-plotlycharts/actions';

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

        const isPending = vis_url
          ? props.data_visualizations?.pendingVisualizations?.[vis_url] ?? false
          : false;

        const isFailed = vis_url
          ? props.data_visualizations?.failedVisualizations?.[vis_url] ?? false
          : false;

        const visualization = vis_url
          ? props.data_visualizations?.data?.[vis_url]
          : null;

        const readyToDispatch =
          vis_url && isUndefined(visualization) && !isPending && !isFailed;

        useEffect(() => {
          if (readyToDispatch) {
            dispatch(getVisualization(vis_url));
          }
        }, [dispatch, readyToDispatch, vis_url]);

        return (
          <WrappedComponent
            {...props}
            visualization={visualization}
            loadingVisualization={isPending || isUndefined(visualization)}
            hasVisUrl={!!vis_url}
          />
        );
      }),
    );
  };
}

export default connectBlockToVisualization;
