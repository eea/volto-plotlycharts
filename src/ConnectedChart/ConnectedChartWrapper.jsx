/*
 * The most basic connected block chart
 */

import React from 'react';
import ConnectedChart from './ConnectedChart';

import { Placeholder } from '@eeacms/volto-datablocks/components';

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function ConnectedChartWrapper(props) {
  return (
    <>
      <Placeholder
        getDOMElement={(val) => {
          return val?.el;
        }}
        className="connected-chart"
        partialVisibility={true}
        offset={{ top: -50, bottom: -50 }}
        delayedCall={true}
      >
        {() => <ConnectedChart {...props} />}
      </Placeholder>
    </>
  );
}

export default ConnectedChartWrapper;
