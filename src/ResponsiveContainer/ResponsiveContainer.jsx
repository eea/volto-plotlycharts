/*
 * Port of (MIT licensed)
 * https://github.com/recharts/recharts/blob/master/src/component/ResponsiveContainer.tsx
 * to JSX
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';
import { isString, debounce } from 'lodash';
import { Placeholder } from 'semantic-ui-react';

import Loadable from 'react-loadable';
const LoadablePlot = Loadable({
  loader: () => import('react-plotly.js'),
  loading() {
    return <div>Loading chart...</div>;
  },
});

// interface Props {
//   aspect?: number;
//   width?: string | number;
//   height?: string | number;
//   minWidth?: string | number;
//   minHeight?: string | number;
//   maxHeight?: number;
//   children: ReactElement;
//   debounce?: number;
//   id?: string | number;
//   className?: string | number;
// }
//
// interface State {
//   containerWidth: number;
//   containerHeight: number;
// }

const isPercent = value =>
  isString(value) && value.indexOf('%') === value.length - 1;

function asNumber(value) {
  if (isString(value)) return value.toInteger();
  return value;
}

class ResponsiveContainer extends Component {
  static defaultProps = {
    width: '100%',
    height: '100%',
    debounce: 0,
    visible: false,
  };

  // private handleResize: () => void;
  // private mounted: boolean;
  // private container: HTMLDivElement;

  constructor(props) {
    super(props);

    this.state = {
      containerWidth: -1,
      containerHeight: -1,
    };

    this.handleResize =
      props.debounce > 0
        ? debounce(this.updateDimensionsImmediate, props.debounce)
        : this.updateDimensionsImmediate;
  }

  /* eslint-disable  react/no-did-mount-set-state */
  componentDidMount() {
    this.mounted = true;

    const size = this.getContainerSize();

    if (size) {
      this.setState(size);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getContainerSize() {
    if (!this.container) {
      return null;
    }

    return {
      containerWidth: this.container.clientWidth,
      containerHeight: this.container.clientHeight,
    };
  }

  updateDimensionsImmediate = () => {
    if (!this.mounted) {
      return;
    }

    const newSize = this.getContainerSize();

    if (newSize) {
      const {
        containerWidth: oldWidth,
        containerHeight: oldHeight,
      } = this.state;
      const { containerWidth, containerHeight } = newSize;

      if (containerWidth !== oldWidth || containerHeight !== oldHeight) {
        this.setState({ containerWidth, containerHeight });
      }
    }
  };

  renderChart(props) {
    const { containerWidth, containerHeight } = this.state;

    // if (containerWidth < 0 || containerHeight < 0) {
    //   return null;
    // }

    const {
      aspect,
      width,
      height,
      // minWidth,
      // minHeight,
      maxHeight,
      // children,
      data,
      layout,
      frames,
      chartConfig,
    } = this.props;

    // console.warn(
    //   isPercent(width) || isPercent(height),
    //   `The width(%s) and height(%s) are both fixed numbers,
    //    maybe you don't need to use a ResponsiveContainer.`,
    //   width,
    //   height,
    // );

    // console.warn(
    //   !aspect || aspect > 0,
    //   'The aspect(%s) must be greater than zero.',
    //   aspect,
    // );

    let calculatedWidth = isPercent(width) ? containerWidth : asNumber(width);
    let calculatedHeight = isPercent(height)
      ? containerHeight
      : asNumber(height);

    if (aspect && aspect > 0) {
      // Preserve the desired aspect ratio
      if (calculatedWidth) {
        // Will default to using width for aspect ratio
        calculatedHeight = calculatedWidth / aspect;
      } else if (calculatedHeight) {
        // But we should also take height into consideration
        calculatedWidth = calculatedHeight * aspect;
      }

      // if maxHeight is set, overwrite if calculatedHeight is greater than maxHeight
      if (maxHeight && calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight;
      }
    }

    // console.warn(
    //   calculatedWidth > 0 || calculatedHeight > 0,
    //   `The width(%s) and height(%s) of chart should be greater than 0,
    //    please check the style of container, or the props width(%s) and height(%s),
    //    or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the
    //    height and width.`,
    //   calculatedWidth,
    //   calculatedHeight,
    //   width,
    //   height,
    //   minWidth,
    //   minHeight,
    //   aspect,
    // );

    // console.log('calculated width', calculatedWidth);

    // return React.cloneElement(children, {
    //   width: calculatedWidth,
    //   height: calculatedHeight,
    // });
    // plotData.layout.width = calculatedWidth;
    // plotData.layout.height = calculatedHeight;
    //   <Placeholder>
    //   <Placeholder.Image rectangular />
    // </Placeholder>
    // return <div>alalalalalala =>>>>>>>>>.{JSON.stringify(data)}</div>
    // console.log('plot data', data);
    // console.log('layout', data);
    return __CLIENT__ ? (
      <LoadablePlot
        {...chartConfig}
        data={data}
        layout={{
          ...layout,
          // height: calculatedHeight,
          width: calculatedWidth,
        }}
        frames={frames}
        config={{ displayModeBar: false }}
      />
    ) : (
      <Placeholder>
        <Placeholder.Image rectangular />
      </Placeholder>
    );
  }

  render() {
    const {
      minWidth,
      minHeight,
      width,
      height,
      maxHeight,
      id,
      className,
    } = this.props;
    const style = { width, height, minWidth, minHeight, maxHeight };

    return (
      <div
        id={`${id}`}
        className={classNames('recharts-responsive-container', className)}
        style={style}
        ref={node => {
          this.container = node;
        }}
      >
        {this.renderChart(this.props)}
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={this.handleResize}
        />
      </div>
    );
  }
}

export default ResponsiveContainer;
