/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToContainer } from 'react-chart-editor/lib';
import Field from 'react-chart-editor/lib/components/fields/Field';

import { ColorPicker } from '../widgets';

export class UnconnectedColorPicker extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      colorComponentVisibility: false,
    };
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  handleVisibilityChange(isVisible) {
    const newColorComponentVisibility = isVisible;
    this.setState({
      colorComponentVisibility: newColorComponentVisibility,
    });
  }

  render() {
    const empty = !this.props.fullValue && this.props.handleEmpty;

    if (empty) {
      return (
        <Field {...this.props}>
          <div className="js-test-info">
            This color is computed from other parts of the figure but you can{' '}
            <a
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.props.updatePlot(this.props.defaultColor);
                }
              }}
              onClick={() => {
                this.props.updatePlot(this.props.defaultColor);
              }}
              role="button"
              tabIndex={0} // Makes the element focusable
            >
              override it
            </a>
            .
          </div>
        </Field>
      );
    }

    return (
      <Field {...this.props}>
        {this.props.handleEmpty && (
          <div className="js-test-info" style={{ marginBottom: '0.5rem' }}>
            This color can be computed from other parts of the figure by{' '}
            <a
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.props.updatePlot(this.props.defaultColor);
                }
              }}
              onClick={() => {
                this.props.updatePlot(null);
              }}
              role="button"
              tabIndex={0} // Makes the element focusable
            >
              clearing it
            </a>
            .
          </div>
        )}
        <ColorPicker
          selectedColor={this.props.fullValue}
          onColorChange={this.props.updatePlot}
          onVisibilityChange={(isVisible) =>
            this.handleVisibilityChange(isVisible)
          }
        />
      </Field>
    );
  }
}

UnconnectedColorPicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  handleEmpty: PropTypes.bool,
  defaultColor: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorPicker.displayName = 'UnconnectedColorPicker';

export default connectToContainer(UnconnectedColorPicker);
