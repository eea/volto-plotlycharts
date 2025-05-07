import React, { useEffect, useMemo } from 'react';
import { isUndefined } from 'lodash';
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
    }))((props) => {
      const dispatch = useDispatch();
      const config = useMemo(() => getConfig(props), [props]);
      const { vis_url } = config;
      const { pendingVisualizations, failedVisualizations, data } =
        props.data_visualizations;

      const isPending = pendingVisualizations?.[vis_url] ?? false;
      const isFailed = failedVisualizations?.[vis_url] ?? false;
      const content = data?.[vis_url];

      const readyToDispatch =
        !!vis_url && isUndefined(content) && !isPending && !isFailed;

      const blockData = useMemo(() => {
        return {
          ...props.data,
          ...(content || {}),
        };
      }, [props.data, content]);

      useEffect(() => {
        if (readyToDispatch) {
          dispatch(getVisualization(vis_url));
        }
      }, [dispatch, readyToDispatch, vis_url]);

      return (
        <WrappedComponent
          {...props}
          data={blockData}
          loadingVisualization={
            !!vis_url && (isPending || isUndefined(content))
          }
          failedVisualization={isFailed}
        />
      );
    });
  };
}

export default connectBlockToVisualization;
