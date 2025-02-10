import { connectToContainer } from 'react-chart-editor/lib';
import ColorPicker from './ColorPicker';

const HoverColor = connectToContainer(ColorPicker, {
  modifyPlotProps: (props, context, plotProps) => {
    plotProps.isVisible = Boolean(context.fullLayout.hovermode);
    return plotProps;
  },
});

export default HoverColor;
