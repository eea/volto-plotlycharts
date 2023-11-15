/*
 * The most basic connected block chart
 */

import React from 'react';
import ConnectedChart, { ChartSkeleton } from './ConnectedChart';

import { VisibilitySensor } from '@eeacms/volto-datablocks/components';

function ConnectedChartWrapper(props) {
  return (
    <>
      <VisibilitySensor className="connected-chart" Placeholder={ChartSkeleton}>
        <ConnectedChart {...props} />
      </VisibilitySensor>
    </>
  );
}

export default ConnectedChartWrapper;
