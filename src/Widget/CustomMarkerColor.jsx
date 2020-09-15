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
import { Dropdown } from 'semantic-ui-react';

import { biseColorscale } from './config';
const defaultColorscale = biseColorscale;

/**
 * React color picker component.
 *
 * @param {object} props
 * @param {string[]} props.selectedColorscale The color set from which the user
 * can choose.
 * @param {string} props.color Currently selected color.
 * @param {function} props.onChange Handler function for when the selected color
 * changes.
 */
const ColorPicker = ({ selectedColorscale, color, onChange, ...rest }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  /**
   * Returns black or white according to the given background color. Inspired
   * from https://stackoverflow.com/a/1855903/258462.
   * @returns {string} The color that should be used as foreground on the given
   * background.
   * @todo Make this work with colors other than the format #RRGGBB.
   */
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

  const cc = React.useMemo(() => {
    return contrastColor(color);
  }, [color, contrastColor]);

  return (
    <Dropdown
      {...rest}
      open={dropdownOpen}
      onClose={() => {
        setDropdownOpen(false);
      }}
      direction="left"
      trigger={
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          style={{
            backgroundColor: `${color}`,
            color: cc,
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

/**
 * React color picker field component. Just an enhanced ColorPicker with a label
 * before it.
 *
 * @param {bject} props
 * @param {string} props.name The string to put in the label.
 * @param {string} props.color Currently selected color.
 * @param {function} props.onChange Handler function for when the selected color
 * changes.
 * @param {string[]} props.colorscale The color set from which the user can
 * choose.
 */
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
          1 <= color && color <= colorscale.length
            ? colorscale[color - 1]
            : colorscale[Math.floor(Math.random() * colorscale.length)]
        }
        selectedColorscale={colorscale}
        onChange={onChange}
      />
    </div>
  );
};

/**
 * @description The three container property paths relevant to bar charts with
 * categorical coloured axis are:
 *  - `marker.colorscale` - the color scale, an array of colors (currently only
 *    \# followed by 6 hex digits are supported)
 *  - `meta.manualcolor`: association between every unique value in the
 *    categoricalaxis and a color index representing a color in the
 *    marker.colorscale,
 *  - `marker.categoricalaxis`: can be `'x'` or `'y'` or `null` (initially it is
 *    `null`)
 *
 * *Related to color indices:* `-1` invalid array index, `0` valid array index,
 * so `0` means invalid color index in any given colorscale.
 * @todo handle indices using special functions that transform e.g. `0` in `1`
 * and `8` in `7`.
 */
class UnconnectedMarkerColor extends Component {
  constructor(props, context) {
    super(props, context);

    let type = null;
    if (props.container.marker.categoricalaxis) {
      type = 'manual';
    } else if (
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
        manual: type === 'manual' ? props.fullValue : null,
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

    this.applyType(type);
  }

  /**
   * Also accepts usual fields, not just the custom ones.
   */
  updateCategoricalsInData = (obj) => {
    this.context.updateContainer(obj);
    this.updateCategoricalsInVisual();
  };

  /**
   * Based on data of the current trace which contains custom fields.
   */
  updateCategoricalsInVisual = () => {
    const isManual = this.props.container.marker.categoricalaxis;
    if (!isManual) {
      delete this.props.container.marker.color;
      return;
    }

    const data = this.props.container[
      this.props.container.marker.categoricalaxis
    ].map(
      (item) =>
        this.props.container.marker.colorscale[
          this.props.container.meta.manualcolor[item] - 1
        ],
    );

    this.context.updateContainer({
      'marker.color': data,
    });
  };

  setType(type) {
    if (this.state.type !== type) {
      this.setState({ type });
      this.props.updatePlot(this.state.value[type]);
      this.applyType(type);
    }
  }

  applyType(type) {
    switch (type) {
      case 'constant':
        this.updateCategoricalsInData({
          'marker.colorsrc': null,
          'marker.colorscale': null,
          'marker.showscale': null,
          'marker.categoricalaxis': null,
          'meta.manualcolor': null,
        });
        this.setState({ colorscale: null });
        break;

      case 'manual':
        this.updateCategoricalsInData({
          'marker.colorscale':
            this.props.container?.marker?.colorscale || defaultColorscale,
          'meta.manualcolor': this.props.container?.meta?.manualcolor || {},
          'marker.categoricalaxis':
            this.props.container?.marker?.categoricalaxis || 'x',
        });
        this.rebuildColorPickers();
        break;

      case 'variable':
        this.updateCategoricalsInData({
          'marker.color': null,
          'marker.colorsrc': null,
          'marker.colorscale': null,
          'marker.categoricalaxis': null,
          'meta.manualcolor': null,
        });
        break;

      default:
        console.error('Unknown marker color type', type);
    }
  }

  setColor(inputValue) {
    const { type } = this.state;

    if (type === 'manual') {
      console.error(
        'When type is set to "manual", setColor should not be called.',
      );
      return;
    }

    this.setState(
      type === 'constant'
        ? { value: { constant: inputValue } }
        : { value: { variable: inputValue } },
    );
    this.props.updatePlot(inputValue);
  }

  setColorScale(inputValue) {
    console.log('setColorScale called for type', this.state.type);
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

  /**
   *  When the selected categorical axis is changed.
   */
  handleAxisChange = (opt) => {
    this.updateCategoricalsInData({
      'marker.categoricalaxis': opt,
      'marker.colorscale': defaultColorscale,
      // 'meta.manualcolor': ,
    });
    this.rebuildColorPickers();
  };

  factoryHandleColorPickerChange = (val, cs) => {
    let val2 = val;

    return (newColor) => {
      this.updateCategoricalsInData({
        'meta.manualcolor': {
          ...(this.props.container?.meta?.manualcolor || {}),
          [val2]: cs.indexOf(newColor.hex) + 1,
        },
      });
      this.rebuildColorPickers();
    };
  };

  handleColorscaleChange = (cs) => {
    this.updateCategoricalsInData({
      'marker.colorscale': cs,
    });
    this.rebuildColorPickers();
  };

  /**
   * Requires categorical axis and categorical colorscale defined.
   */
  rebuildColorPickers = () => {
    // console.log('rebuildColorPickers', this.props.container.type);
    if (this.props.container.type !== 'bar') {
      this.updateCategoricalsInData({
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

    // the colorscale array
    const cs = this.props.container.marker?.colorscale;

    // if a color scale is not yet set
    if (!cs) {
      return;
    }

    // for each unique value
    l.uniq(data).forEach((x, i) => {
      // if the current unique value from the axis has a color
      if (
        this.props.container.meta.manualcolor[x] &&
        this.props.container.meta.manualcolor[x] > 0
      ) {
        colors[x] = this.props.container.meta.manualcolor[x];
        return;
      }

      // if not, use an increasing integer
      if (i < cs.length) {
        colors[x] = i + 1;
        return;
      }

      // if the increasing integer is not valid, set a random valid index
      const rnd = Math.floor(Math.random() * cs.length) + 1;
      colors[x] = rnd;
    });

    this.updateCategoricalsInData({
      'meta.manualcolor': colors,
    });
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
        {this.props.container?.marker?.categoricalaxis && (
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
