import ColorscalePicker, {
  Colorscale,
  COLOR_PICKER_CONSTANTS,
} from 'react-colorscales';
import { Info } from 'react-chart-editor/lib/components';
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import config from '@plone/volto/registry';
import { Icon } from '@plone/volto/components';

import CustomColorPicker from '../CustomColorPicker';

import addIcon from '@plone/volto/icons/add.svg';
import editingIcon from '@plone/volto/icons/editing.svg';
import deleteIcon from '@plone/volto/icons/delete.svg';
import closeIcon from '@plone/volto/icons/clear.svg';

// CAREFUL: needs to be the same value as $colorscalepicker-width in _colorscalepicker.scss
const colorscalepickerContainerWidth = 240;

class Scale extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedColorscaleType: props.initialCategory || 'sequential',
      showColorscalePicker: false,
      showCustomizeColor: false,
    };

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  onClick() {
    this.setState({
      showColorscalePicker: !this.state.showColorscalePicker,
    });
  }

  onChange(selectedColorscaleType) {
    this.setState({ selectedColorscaleType });
  }

  handleColorChange(color, index) {
    var newColorscale = [...(this.props.selected || [])];
    newColorscale[index] = color;

    if (this.props.handleChange) {
      this.props.handleChange(this.props.attr, newColorscale);
    }
  }

  handleDeleteColor(index) {
    var newColorscale = [
      ...this.props.selected.slice(0, index),
      ...this.props.selected.slice(index + 1),
    ];

    if (this.props.handleChange) {
      this.props.handleChange(this.props.attr, newColorscale);
    }
  }

  handleAddColor() {
    var newColorscale = [...this.props.selected, 'black'];

    if (this.props.handleChange) {
      this.props.handleChange(this.props.attr, newColorscale);
    }
  }

  render() {
    const { onColorscaleChange, selected, disableCategorySwitch } = this.props;
    const {
      selectedColorscaleType,
      showColorscalePicker,
      showCustomizeColor,
    } = this.state;
    const description =
      COLOR_PICKER_CONSTANTS.COLORSCALE_DESCRIPTIONS[selectedColorscaleType];
    const colorscaleOptions = COLOR_PICKER_CONSTANTS.COLORSCALE_TYPES.filter(
      (type) => type !== 'custom',
    ).map((type) => ({
      label: type + ' scales',
      value: type,
    }));
    const _ = this.context.localize;

    return (
      <div className="customPickerContainer">
        <div
          className="customPickerContainer__clickable"
          style={{ display: 'flex', alignItems: 'flex-start' }}
        >
          <Colorscale colorscale={selected} onClick={this.onClick} />
          <Icon
            className="color-customize-icon"
            name={showCustomizeColor ? closeIcon : editingIcon}
            size="21px"
            onClick={() =>
              this.setState({
                showCustomizeColor: !this.state.showCustomizeColor,
              })
            }
            style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
          />
        </div>
        {showCustomizeColor && (
          <React.Fragment>
            {selected?.length > 0 &&
              selected.map((item, index) => (
                <div
                  style={{ position: 'relative', margin: '5px 0' }}
                  key={index}
                >
                  <CustomColorPicker
                    selectedColor={item}
                    onColorChange={(color) =>
                      this.handleColorChange(color, index)
                    }
                  />
                  {selected.length > 2 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon
                        onClick={() => this.handleDeleteColor(index)}
                        name={deleteIcon}
                        size="24px"
                      />
                    </div>
                  )}
                </div>
              ))}
            <div className="color-buttons-container">
              <button
                style={{ display: 'flex', alignItems: 'center' }}
                className="color-add-button"
                title="Add new color"
                onClick={() => this.handleAddColor()}
              >
                <Icon className="color-add-icon" name={addIcon} size="18px" />
                Add
              </button>
            </div>
          </React.Fragment>
        )}
        {showColorscalePicker ? (
          <div className="customPickerContainer__expanded-content">
            {disableCategorySwitch ? null : (
              <Dropdown
                options={colorscaleOptions}
                value={selectedColorscaleType}
                onChange={this.onChange}
                clearable={false}
                searchable={false}
                placeholder={_('Select a Colorscale Type')}
                className="customPickerContainer__category-dropdown"
              />
            )}
            {description ? (
              <div className="customPickerContainer__palettes">
                <ColorscalePicker
                  onChange={onColorscaleChange}
                  colorscale={selected}
                  width={colorscalepickerContainerWidth}
                  colorscaleType={this.state.selectedColorscaleType}
                  onColorscaleTypeChange={this.onColorscaleTypeChange}
                  disableSwatchControls
                  scaleLength={7}
                  voltoColors={config.settings.plotlyCustomColors}
                />
                <Info className="customPickerContainer__info">
                  {description}
                </Info>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

Scale.propTypes = {
  onColorscaleChange: PropTypes.func,
  selected: PropTypes.array,
  label: PropTypes.string,
  initialCategory: PropTypes.string,
  disableCategorySwitch: PropTypes.bool,
};

Scale.contextTypes = {
  localize: PropTypes.func,
};

export default Scale;
