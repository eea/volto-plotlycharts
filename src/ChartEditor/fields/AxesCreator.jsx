/* eslint-disable jsx-a11y/anchor-is-valid */
import Dropdown from 'react-chart-editor/lib/components/fields/Dropdown';
import Info from 'react-chart-editor/lib/components/fields/Info';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { cloneDeep } from 'lodash';
import Button from '../widgets/Button';
import { PlusIcon } from 'plotly-icons';
import {
  connectToContainer,
  traceTypeToAxisType,
  axisIdToAxisName,
  getParsedTemplateString,
} from 'react-chart-editor/lib';
import { PlotlySection } from 'react-chart-editor/lib/components';
import { getAxisTitle } from '../lib';

import { defaults } from '../../helpers';

const EDITOR_ACTIONS = {
  UPDATE_TRACES: 'plotly-editor-update-traces',
  ADD_TRACE: 'plotly-editor-add-trace',
  DELETE_TRACE: 'plotly-editor-delete-trace',
  UPDATE_LAYOUT: 'plotly-editor-update-layout',
  DELETE_ANNOTATION: 'plotly-editor-delete-annotation',
  DELETE_SHAPE: 'plotly-editor-delete-shape',
  DELETE_IMAGE: 'plotly-editor-delete-image',
  DELETE_RANGESELECTOR: 'plotly-editor-delete-rangeselector',
  DELETE_TRANSFORM: 'plotly-editor-delete-transform',
  MOVE_TO: 'plotly-editor-move-to',
};

class UnconnectedAxisCreator extends Component {
  canAddAxis() {
    const currentAxisId = this.props.fullContainer[this.props.attr];
    const currentTraceIndex = this.props.fullContainer.index;
    return this.context.fullData.some(
      (d) =>
        d.index !== currentTraceIndex && d[this.props.attr] === currentAxisId,
    );
  }

  addAndUpdateAxis() {
    const { attr, updateContainer } = this.props;
    const {
      onUpdate,
      fullLayout: { _subplots: subplots },
    } = this.context;
    const lastAxisNumber =
      Number(subplots[attr][subplots[attr].length - 1].charAt(1)) || 1;

    updateContainer({
      [attr]: attr.charAt(0) + (lastAxisNumber + 1),
    });

    let side = null;
    if (attr === 'yaxis') {
      side = 'right';
    } else if (attr === 'xaxis') {
      side = 'top';
    }

    onUpdate({
      type: EDITOR_ACTIONS.UPDATE_LAYOUT,
      payload: {
        update: {
          ...Object.keys({
            ...(defaults.axis || {}),
          }).reduce((acc, key) => {
            acc[`${attr + (lastAxisNumber + 1)}.${key}`] = cloneDeep(
              defaults.axis[key],
            );
            return acc;
          }, {}),
          [`${attr + (lastAxisNumber + 1)}.showgrid`]: false,
          [`${attr + (lastAxisNumber + 1)}.showticklabels`]: false,
          [`${attr + (lastAxisNumber + 1)}.zeroline`]: false,
          [`${attr + (lastAxisNumber + 1)}.side`]: side,
          [`${attr + (lastAxisNumber + 1)}.overlaying`]: !(
            attr === 'yaxis' || attr === 'xaxis'
          )
            ? null
            : subplots[attr][subplots[attr].length - 1],
        },
      },
    });
  }

  updateAxis(update) {
    const currentAxisId = this.props.fullContainer[this.props.attr];
    const axesToBeGarbageCollected = [];

    // When we select another axis, make sure no unused axes are left
    if (
      currentAxisId !== update &&
      !this.context.fullData.some(
        (trace) =>
          trace[this.props.attr] === currentAxisId &&
          trace.index !== this.props.fullContainer.index,
      )
    ) {
      axesToBeGarbageCollected.push(currentAxisId);
    }

    this.context.onUpdate({
      type: EDITOR_ACTIONS.UPDATE_TRACES,
      payload: {
        axesToBeGarbageCollected,
        update: { [this.props.attr]: update },
        traceIndexes: [this.props.fullContainer.index],
      },
    });
  }

  render() {
    const icon = <PlusIcon />;
    const extraComponent = this.canAddAxis() ? (
      <Button
        variant="no-text"
        icon={icon}
        onClick={() => this.addAndUpdateAxis()}
      />
    ) : (
      <Button variant="no-text--disabled" icon={icon} onClick={() => {}} />
    );

    return (
      <Dropdown
        label={this.props.label}
        attr={this.props.attr}
        clearable={false}
        options={this.props.options}
        updatePlot={(u) => this.updateAxis(u)}
        extraComponent={extraComponent}
      />
    );
  }
}

UnconnectedAxisCreator.propTypes = {
  attr: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
  container: PropTypes.object,
  fullContainer: PropTypes.object,
  updateContainer: PropTypes.func,
};

UnconnectedAxisCreator.contextTypes = {
  fullLayout: PropTypes.object,
  data: PropTypes.array,
  fullData: PropTypes.array,
  onUpdate: PropTypes.func,
};

const AxisCreator = connectToContainer(UnconnectedAxisCreator);

class UnconnectedAxesCreator extends Component {
  render() {
    const axisType = traceTypeToAxisType(this.props.container.type);
    const isFirstTraceOfAxisType =
      this.context.data.filter((d) => traceTypeToAxisType(d.type) === axisType)
        .length === 1;

    if (isFirstTraceOfAxisType) {
      return null;
    }

    const { fullLayout, localize: _ } = this.context;
    const controls = [];

    function getOptions(axisType) {
      return fullLayout._subplots[axisType].map((axisId) => ({
        label: getParsedTemplateString(
          getAxisTitle(fullLayout[axisIdToAxisName(axisId)]),
          {
            meta: fullLayout.meta,
          },
        ),
        value: axisId,
      }));
    }

    if (axisType === 'cartesian') {
      ['xaxis', 'yaxis'].forEach((type, index) => {
        controls.push(
          <AxisCreator
            key={index}
            attr={type}
            label={type.charAt(0).toUpperCase() + _(' Axis')}
            options={getOptions(type)}
          />,
        );
      });
    }

    return (
      <PlotlySection name={_('Axes to Use')}>
        {controls}
        <Info>
          {_('You can style and position your axes in the ')}
          <a
            onClick={(e) => {
              this.context.setPanel('Structure', 'Subplots');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                this.context.setPanel('Structure', 'Subplots');
              }
            }}
            role="button"
            tabIndex="0"
          >
            {_('Subplots')}
          </a>
          {_(' panel.')}
        </Info>
      </PlotlySection>
    );
  }
}

UnconnectedAxesCreator.propTypes = {
  container: PropTypes.object,
  fullContainer: PropTypes.object,
};

UnconnectedAxesCreator.contextTypes = {
  data: PropTypes.array,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  localize: PropTypes.func,
  setPanel: PropTypes.func,
};

export default connectToContainer(UnconnectedAxesCreator, {
  modifyPlotProps: (props, context, plotProps) => {
    const { data } = context;
    const { fullContainer } = plotProps;

    plotProps.isVisible =
      data.length > 1 &&
      data[fullContainer.index] &&
      traceTypeToAxisType(data[fullContainer.index].type) === 'cartesian';
  },
});
