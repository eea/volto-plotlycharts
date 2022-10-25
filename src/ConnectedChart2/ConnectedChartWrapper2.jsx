/*
 * The most basic connected block chart
 */

import React from 'react';
import ConnectedChart2 from './ConnectedChart2';

import { VisibilitySensor } from '@eeacms/volto-datablocks/components';

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function ConnectedChartWrapper2(props) {
  return (
    <>
      <VisibilitySensor className="connected-chart">
        <ConnectedChart2 {...props} />
      </VisibilitySensor>
    </>
  );
}

export default ConnectedChartWrapper2;
