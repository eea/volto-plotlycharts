import isNumeric from 'fast-isnumeric';
import { connectToContainer } from 'react-chart-editor/lib';
import { UnconnectedNumericOrDate } from 'react-chart-editor/lib/components/fields/NumericOrDate';

export const PositioningNumeric = connectToContainer(UnconnectedNumericOrDate, {
  modifyPlotProps: (props, context, plotProps) => {
    const { fullContainer, fullValue, updatePlot } = plotProps;
    if (
      fullContainer &&
      (fullContainer[props.attr[0] + 'ref'] === 'paper' ||
        fullContainer[props.attr[props.attr.length - 1] + 'ref'] === 'paper')
    ) {
      plotProps.units = '%';
      plotProps.showSlider = true;
      plotProps.max = 200;
      plotProps.min = -100;
      plotProps.step = 1;
      if (isNumeric(fullValue)) {
        plotProps.fullValue = Math.round(100 * fullValue);
      }

      plotProps.updatePlot = (v) => {
        if (isNumeric(v)) {
          updatePlot(v / 100);
        } else {
          updatePlot(v);
        }
      };
    }
  },
});
