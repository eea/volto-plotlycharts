import Field from 'react-chart-editor/lib/components/fields/Field';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connectToContainer } from 'react-chart-editor/lib';
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks';
import MultiColorPicker from 'react-chart-editor/lib/components/fields/MultiColorPicker';
import ColorscalePicker from 'react-chart-editor/lib/components/fields/ColorscalePicker';
import Numeric from 'react-chart-editor/lib/components/fields/Numeric';
import Radio from 'react-chart-editor/lib/components/fields/Radio';
import Info from 'react-chart-editor/lib/components/fields/Info';
import DataSelector from 'react-chart-editor/lib/components/fields/DataSelector';
import VisibilitySelect from 'react-chart-editor/lib/components/fields/VisibilitySelect';
import { MULTI_VALUED, COLORS } from 'react-chart-editor/lib/lib/constants';
import ColorscalePickerWidget from 'react-chart-editor/lib/components/widgets/ColorscalePicker';
import { CirclePicker } from 'react-color';
import l from 'lodash';
import { Dropdown, Button } from 'semantic-ui-react';

import { biseColorscale } from './config';
const defaultColorscale = biseColorscale;

const ColorPicker = ({ selectedColorscale, color, onChange, ...rest }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // inspired from https://stackoverflow.com/a/1855903/258462
  const contrastColor = React.useCallback((color) => {
    // color = color.replace(/ /g, '').replace('#', '').split(',').map(Number);
    color = color.replace('#', '').split('');

    let rr = color[0] + color[1];
    let gg = color[2] + color[3];
    let bb = color[4] + color[5];

    rr = parseInt(rr, 16);
    gg = parseInt(gg, 16);
    bb = parseInt(bb, 16);

    const l = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;

    let d;
    if (l > 0.5) {
      d = 0; // bright colors - black font
    } else {
      d = 255; // dark colors - white font
    }
    return `rgb(${d}, ${d}, ${d})`;
  }, []);

  // console.log('COLOR PROP', color);
  return (
    <Dropdown
      {...rest}
      open={dropdownOpen}
      onClose={() => {
        setDropdownOpen(false);
      }}
      direction="left"
      // onMouseDown={(ev) => {
      //   ev.preventDefault();
      //   ev.stopPropagation();
      // }}
      trigger={
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          style={{
            backgroundColor: `${color}`,
            color: contrastColor(color),
            fontFamily: 'monospace',
          }}
        >
          {color}
        </button>
      }
    >
      <Dropdown.Menu>
        {__CLIENT__ && (
          <CirclePicker
            color={color}
            onChange={onChange}
            colors={selectedColorscale}
          />
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const ColorPickerField = ({ name, color, colorscale, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        marginTop: '0.1rem',
      }}
    >
      <label
        style={{
          alignSelf: 'center',
        }}
      >
        {name}
      </label>
      <div style={{ flexGrow: 1 }}></div>
      <ColorPicker
        style={{
          textAlign: 'right',
          marginRight: '1rem',
          flexShrink: 0,
        }}
        color={
          color < colorscale.length
            ? colorscale[color]
            : colorscale[Math.floor(Math.random() * colorscale.length)]
        }
        selectedColorscale={colorscale}
        onChange={onChange}
      />
    </div>
  );
};

/**
 * The three container property paths relevant to bar charts with categorical coloured axis are:
 *  - `marker.colorscale` - the color scale, an array of colors (currently only #
 * followed by 6 hex digits are supported)
 *  - `meta.manualcolor`: association between every unique value in the categoricalaxis and a color index representing a color in the marker.colorscale,
 *  - `marker.categoricalaxis`: can be x or y or null (initially it is null)
 */
class UnconnectedMarkerColor extends Component {
  constructor(props, context) {
    super(props, context);

    let type = null;
    if (
      !props.container.marker ||
      (props.container.marker && !props.container.marker.colorsrc)
    ) {
      type = 'constant';
    } else if (
      props.container.marker &&
      Array.isArray(props.container.marker.color) &&
      props.fullContainer.marker &&
      Array.isArray(props.fullContainer.marker.color)
    ) {
      type = 'variable';
    }

    this.state = {
      type,
      value: {
        constant: type === 'constant' ? props.fullValue : COLORS.mutedBlue,
        variable: type === 'variable' ? props.fullValue : null,
      },
      selectedConstantColorOption:
        type === 'constant' && props.multiValued ? 'multiple' : 'single',
    };

    this.setType = this.setType.bind(this);
    this.setColor = this.setColor.bind(this);
    this.setColorScale = this.setColorScale.bind(this);
    this.onConstantColorOptionChange = this.onConstantColorOptionChange.bind(
      this,
    );
  }

  setType(type) {
    if (this.state.type !== type) {
      this.setState({ type });
      this.props.updatePlot(this.state.value[type]);
      if (type === 'constant') {
        this.context.updateContainer({
          'marker.colorsrc': null,
          'marker.colorscale': null,
          'marker.showscale': null,
          'marker.categoricalaxis': null,
          'meta.manualcolor': null,
        });
        this.setState({ colorscale: null });
      } else if (type === 'manual') {
        this.context.updateContainer({
          'marker.colorscale': defaultColorscale,
          'meta.manualcolor': {},
          'marker.categoricalaxis': 'x',
        });
        // debugger;
        this.rebuildColorPickers();
      } else {
        this.context.updateContainer({
          'marker.color': null,
          'marker.colorsrc': null,
          'marker.colorscale': null,
          'marker.categoricalaxis': null,
          'meta.manualcolor': null,
        });
      }
    }
  }

  setColor(inputValue) {
    const { type } = this.state;

    this.setState(
      type === 'constant'
        ? { value: { constant: inputValue } }
        : { value: { variable: inputValue } },
    );
    this.props.updatePlot(inputValue);
  }

  setColorScale(inputValue) {
    this.setState({ colorscale: inputValue });
    this.context.updateContainer({ 'marker.colorscale': inputValue });
  }

  isMultiValued() {
    return (
      this.props.multiValued ||
      (Array.isArray(this.props.fullValue) &&
        this.props.fullValue.includes(MULTI_VALUED)) ||
      (this.props.container.marker &&
        this.props.container.marker.colorscale &&
        this.props.container.marker.colorscale === MULTI_VALUED) ||
      (this.props.container.marker &&
        this.props.container.marker.colorsrc &&
        this.props.container.marker.colorsrc === MULTI_VALUED) ||
      (this.props.container.marker &&
        this.props.container.marker.color &&
        Array.isArray(this.props.container.marker.color) &&
        this.props.container.marker.color.includes(MULTI_VALUED))
    );
  }

  onConstantColorOptionChange(value) {
    this.setState({
      selectedConstantColorOption: value,
    });
  }

  renderConstantControls() {
    const _ = this.context.localize;
    return (
      <MultiColorPicker
        attr="marker.color"
        multiColorMessage={_(
          'Each trace will be colored according to the selected colorscale.',
        )}
        singleColorMessage={_(
          'All traces will be colored in the the same color.',
        )}
        setColor={this.setColor}
        setColorScale={this.setColorScale}
        onConstantColorOptionChange={this.onConstantColorOptionChange}
        parentSelectedConstantColorOption={
          this.state.selectedConstantColorOption
        }
      />
    );
  }

  // when the selected categorical axis is changed
  handleAxisChange = (opt) => {
    this.context.updateContainer({
      'marker.colorscale': defaultColorscale,
      // 'meta.manualcolor': ,
      'marker.categoricalaxis': opt,
    });
    this.rebuildColorPickers();
  };

  factoryHandleColorPickerChange = (val, cs) => {
    let val2 = val;
    console.log('val2', val2);
    console.log('guess: lazy loading');
    return (newColor) => {
      // console.log('container 1.5', this.props.container.meta.manualcolor);

      // let idx = -1;
      // for (let i = 0; i < cs.length; ++i) {
      //   if (cs[i] === newColor.hex) {
      //     idx = i;
      //     break;
      //   }
      // }

      // console.log('idx', idx);

      console.log('obj', {
        ...(this.props.container?.meta?.manualcolor || {}),
        [val2]: cs.indexOf(newColor.hex),
      });

      this.context.updateContainer({
        'meta.manualcolor': {
          ...(this.props.container?.meta?.manualcolor || {}),
          [val2]: cs.indexOf(newColor.hex),
        },
      });
      console.log('container 2', this.props.container.meta.manualcolor);
      this.rebuildColorPickers();
    };
  };

  handleColorscaleChange = (cs) => {
    this.context.updateContainer({
      'marker.colorscale': cs,
      // 'meta.manualcolor': {
      //   ...(this.props.container?.meta?.manualcolor || {}),
      //   [val]: cs.indexOf(newColor.hex),
      // },
    });

    this.rebuildColorPickers();
  };

  /**
   * Requires categorical axis and categorical colorscale defined.
   * @todo also run this when this.props.container changes
   */
  rebuildColorPickers = () => {
    console.log('rebuildColorPickers', this.props.container.type);
    if (this.props.container.type !== 'bar') {
      this.context.updateContainer({
        'marker.colorscale': null,
        'meta.manualcolor': null,
        'marker.categoricalaxis': null,
      });
      return;
    }

    const colors = {};

    const data = this.props.container[
      this.props.container.marker.categoricalaxis
    ];

    l.uniq(data).forEach((x, i) => {
      const cs = this.props.container.marker?.colorscale;

      // if the current unique value from the axis has a color
      if (this.props.container.meta.manualcolor[x]) {
        colors[x] = cs[x];
        return;
      }

      // is this case taking place or this code is dead?
      if (!cs) {
        return;
      }

      if (i < cs.length) {
        colors[x] = i;
        return;
      }

      const rnd = Math.floor(Math.random() * cs.length);
      colors[x] = rnd;
    });

    // console.log('colors', colors);

    this.context.updateContainer({
      'meta.manualcolor': colors,
    });
    console.log('manualcolor', colors);
  };

  renderManualControls() {
    const _ = this.context.localize;

    const options = [
      { label: _('X Axis'), value: 'x' },
      { label: _('Y axis'), value: 'y' },
    ];

    const categoricalColorscale = this.props.container?.marker?.colorscale;

    return (
      <>
        <RadioBlocks
          options={options}
          activeOption={this.props.container?.marker?.categoricalaxis || null}
          onOptionChange={this.handleAxisChange}
        />
        {this.props.container.marker.categoricalaxis && (
          <>
            <ColorscalePickerWidget
              selected={categoricalColorscale}
              onColorscaleChange={this.handleColorscaleChange.bind(this)}
            />
            {Object.entries(this.props.container?.meta?.manualcolor || {}).map(
              ([val, color], i) => {
                return (
                  <ColorPickerField
                    key={i}
                    name={val}
                    color={color}
                    colorscale={categoricalColorscale}
                    onChange={(newColor) => {
                      this.factoryHandleColorPickerChange(
                        val,
                        categoricalColorscale,
                      ).bind(this)(newColor);
                    }}
                  />
                );
              },
            )}
          </>
        )}
      </>
    );
  }

  renderVariableControls() {
    const multiValued =
      this.props.container &&
      this.props.container.marker &&
      ((this.props.container.marker.colorscale &&
        this.props.container.marker.colorscale === MULTI_VALUED) ||
        (this.props.container.marker.colorsrc &&
          this.props.container.marker.colorsrc === MULTI_VALUED));
    return (
      <Field multiValued={multiValued}>
        <DataSelector suppressMultiValuedMessage attr="marker.color" />
        {this.props.container.marker &&
        this.props.container.marker.colorscale === MULTI_VALUED ? null : (
          <ColorscalePicker
            suppressMultiValuedMessage
            attr="marker.colorscale"
            updatePlot={this.setColorScale}
            colorscale={this.state.colorscale}
          />
        )}
      </Field>
    );
  }

  render() {
    const { attr } = this.props;
    const { localize: _, container } = this.context;

    console.log('marker.colorscale', container);
    // debugger;
    // TO DO: https://github.com/plotly/react-chart-editor/issues/654
    const noSplitsPresent =
      container &&
      (!container.transforms ||
        !container.transforms.filter((t) => t.type === 'groupby').length);

    if (noSplitsPresent) {
      const { type } = this.state;
      const options = [
        { label: _('Manual'), value: 'manual' },
        { label: _('Constant'), value: 'constant' },
        { label: _('Variable'), value: 'variable' },
      ];

      // TODO: the minimum width is too big, there should be a margin to the
      // right of Variable that should be like the other fields with 100% width
      return (
        <>
          <Field {...this.props} attr={attr}>
            <Field multiValued={this.isMultiValued() && !this.state.type}>
              <RadioBlocks
                options={options}
                activeOption={type}
                onOptionChange={this.setType}
              />

              {!type ? null : (
                <Info>
                  {type === 'constant'
                    ? _('All points in a trace are colored in the same color.')
                    : type === 'variable'
                    ? _('Each point in a trace is colored according to data.')
                    : _(
                        'Each point in a trace is colored according to the selected axis and the below manually set colors.',
                      )}
                </Info>
              )}
            </Field>

            {type === 'manual' && this.renderManualControls()}
            {type === 'constant' && this.renderConstantControls()}
            {type === 'variable' && this.renderVariableControls()}
          </Field>
          {type === 'constant' ? null : (
            <>
              <Radio
                label={_('Colorscale Direction')}
                attr="marker.reversescale"
                options={[
                  { label: _('Normal'), value: false },
                  { label: _('Reversed'), value: true },
                ]}
              />
              <Radio
                label={_('Color Bar')}
                attr="marker.showscale"
                options={[
                  { label: _('Show'), value: true },
                  { label: _('Hide'), value: false },
                ]}
              />
              <VisibilitySelect
                label={_('Colorscale Range')}
                attr="marker.cauto"
                options={[
                  { label: _('Auto'), value: true },
                  { label: _('Custom'), value: false },
                ]}
                showOn={false}
                defaultOpt={true}
              >
                <Numeric label={_('Min')} attr="marker.cmin" />
                <Numeric label={_('Max')} attr="marker.cmax" />
              </VisibilitySelect>
            </>
          )}
        </>
      );
    }

    return (
      <Field {...this.props} attr={attr}>
        {this.renderConstantControls()}
      </Field>
    );
  }
}

UnconnectedMarkerColor.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedMarkerColor.contextTypes = {
  localize: PropTypes.func,
  updateContainer: PropTypes.func,
  traceIndexes: PropTypes.array,
  container: PropTypes.object,
};

UnconnectedMarkerColor.displayName = 'UnconnectedMarkerColor';

export default connectToContainer(UnconnectedMarkerColor);
