import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import {
  Dropdown,
  FontSelector,
  PlotlyFold,
  Numeric,
  TextEditor,
  PlotlySection,
  LayoutPanel,
  HovermodeDropdown,
  Flaglist,
  Radio,
  Info,
  PanelMessage,
} from 'react-chart-editor/lib/components';
import { HoverColor } from 'react-chart-editor/lib/components/fields/derived';
import DataSelector from 'react-chart-editor/lib/components/fields/DataSelector';

import {
  ColorwayPicker,
  ColorPicker,
  VisibilitySelect,
  TextInput,
} from '../fields';

const Select = loadable(() => import('react-select'));

const styles = {
  scaleContainer: {
    padding: '10px',
    fontWeight: '400 !important',
    color: 'black !important',
  },
  customDropdown: {
    backgroundColor: 'var(--color-background-inputs) !important',
    borderRadius: '5px',
    color: 'var(--color-text-active)',
    marginLeft: '10px',
    webkitAppearance: 'none',
    flex: '1',
  },
  precisionRadio: {
    padding: '10px',
  },
};

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: '#C9D4E2',
    boxShadow: 'none',
  }),
};

const StyleLayoutPanel = (props, context) => {
  const { localize: _ } = context;
  const chartData = props.value.chartData || {};
  const { data = [], layout = {} } = chartData;

  const layoutx = layout.xaxis || {};
  const layouty = layout.yaxis || {};

  const [tickFormat, setTickFormat] = useState({
    xaxis: { label: _('Default'), value: '' },
    yaxis: { label: _('Default'), value: '' },
    all: { label: _('Default'), value: '' },
  });

  const [hoverFormatAll, setHoverFormatAll] = useState({
    label: _('Default'),
    value: '',
  });

  const [textFormat, setTextFormat] = useState({
    label: _('Default'),
    value: '',
  });

  const [precisionAxis, setPrecisionAxis] = useState('all');

  const numbersFormat = [
    { label: _('Default'), value: '' },
    { label: _('No Digit'), value: ',.0f' },
    { label: _('1 Digit'), value: ',.1f' },
    { label: _('2 Digits'), value: ',.2f' },
    { label: _('3 Digits'), value: ',.3f' },
    { label: _('4 Digits'), value: ',.4f' },
    { label: _('5 Digits'), value: ',.5f' },
    { label: _('6 Digits'), value: ',.6f' },
    { label: _('7 Digits'), value: ',.7f' },
  ];
  const textFormats = [
    { label: _('Default'), value: '%{text}' },
    { label: _('No Digit'), value: '%{text:,.1s}' },
    { label: _('1 Digit'), value: '%{text:,.1f}' },
    { label: _('2 Digits'), value: '%{text:,.2f}' },
    { label: _('3 Digits'), value: '%{text:,.3f}' },
    { label: _('4 Digits'), value: '%{text:,.4f}' },
    { label: _('5 Digits'), value: '%{text:,.5f}' },
    { label: _('6 Digits'), value: '%{text:,.6f}' },
    { label: _('7 Digits'), value: '%{text:,.7f}' },
  ];

  useEffect(() => {
    const cleanFormats = numbersFormat.slice(1, numbersFormat.length);
    //state persistence of precision dropdowns
    if (data.length !== 0) {
      if (data[0].texttemplate) {
        const existingTextFormat = textFormats.find((format) =>
          data[0].texttemplate.includes(format.value),
        );
        setTextFormat(existingTextFormat);
      }
    }

    if (
      layoutx.hoverformat &&
      layouty.hoverformat &&
      layoutx.hoverformat === layouty.hoverformat
    ) {
      const existingHoverFormat = cleanFormats.find(
        (format) => format.value === layoutx.hoverformat,
      );
      setHoverFormatAll(existingHoverFormat);
    } else setHoverFormatAll(numbersFormat[0]);

    if (
      layoutx.tickformat &&
      layouty.tickformat &&
      layoutx.tickformat === layouty.tickformat
    ) {
      const existingTickFormat = cleanFormats.find(
        (format) => format.value === layoutx.tickformat,
      );
      setTickFormat({
        ...tickFormat,
        all: existingTickFormat,
      });
    } else setTickFormat({ ...tickFormat, all: numbersFormat[0] });

    if (layoutx.tickformat) {
      const xtickFormat = cleanFormats.find(
        (format) => format.value === layoutx.tickformat,
      );
      setTickFormat({
        ...tickFormat,
        xaxis: xtickFormat,
      });
    }

    if (layouty.tickformat) {
      const ytickFormat = cleanFormats.find(
        (format) => format.value === layouty.tickformat,
      );
      setTickFormat({
        ...tickFormat,
        yaxis: ytickFormat,
      });
    }
    /* eslint-disable-next-line */
  }, [props.value]);

  const handleTextFormat = (e) => {
    setTextFormat(e);

    const newData = data.map((trace) => {
      if (trace.text && !isNaN(parseFloat(trace.text[0]))) {
        return {
          ...trace,
          texttemplate: e.value,
        };
      } else return trace;
    });

    props.onChangeValue({
      ...props.value,
      data: newData,
    });
  };

  const handleTickFormatX = (format) => {
    setTickFormat({
      ...tickFormat,
      xaxis: format,
    });

    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...layout,
          xaxis: {
            ...layout.xaxis,
            tickformat: format.value,
          },
        },
      },
    });
  };

  const handleTickFormatY = (format) => {
    setTickFormat({
      ...tickFormat,
      yaxis: format,
    });
    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...layout,
          yaxis: {
            ...layout.yaxis,
            tickformat: format.value,
          },
        },
      },
    });
  };
  const handleTickFormatAll = (format) => {
    setTickFormat({
      ...tickFormat,
      all: format,
    });
    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...layout,
          xaxis: {
            ...layout.xaxis,
            tickformat: format.value,
          },
          yaxis: {
            ...layout.yaxis,
            tickformat: format.value,
          },
        },
      },
    });
  };

  const handleHoverFormatAll = (format) => {
    setHoverFormatAll(format);
    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...layout,
          xaxis: {
            ...layout.xaxis,
            hoverformat: format.value,
          },
          yaxis: {
            ...layout.yaxis,
            hoverformat: format.value,
          },
        },
      },
    });
  };

  const handleAutosizeChange = (autosize) => {
    const { width, height } = context.fullLayout;
    const newLayout = { ...layout };

    if (autosize) {
      delete newLayout.width;
      delete newLayout.height;
    } else {
      newLayout.width = width;
      newLayout.height = height;
    }

    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...newLayout,
        },
      },
    });
  };

  const onChangeColor = (attr, customColor) => {
    props.onChangeValue({
      ...props.value,
      chartData: {
        ...chartData,
        layout: {
          ...layout,
          [attr]: customColor,
        },
      },
    });
  };

  return (
    <LayoutPanel>
      <PlotlyFold name={_('Defaults')}>
        <ColorPicker label={_('Plot Background')} attr="plot_bgcolor" />
        <ColorPicker label={_('Margin Color')} attr="paper_bgcolor" />
        <PlotlySection name={_('Colorscales')} attr="colorway">
          <ColorwayPicker
            label={_('Color')}
            attr="colorway"
            updatePlot={(inputValue) => onChangeColor('colorway', inputValue)}
            labelWidth={80}
            editable
          />
        </PlotlySection>
        <PlotlySection name={_('Text')} attr="font.family">
          <FontSelector
            label={_('Typeface')}
            attr="font.family"
            clearable={true}
          />
          <Numeric label={_('Base Font Size')} attr="font.size" units="px" />
          <ColorPicker label={_('Font Color')} attr="font.color" />
          <Dropdown
            label={_('Number format')}
            attr="separators"
            options={[
              { label: _('1,234.56'), value: '.,' },
              { label: _('1 234.56'), value: '. ' },
              { label: _('1 234,56'), value: ', ' },
              { label: _('1.234,56'), value: ',.' },
            ]}
            clearable={false}
          />
          <Dropdown
            label={_('Uniform Text Mode')}
            attr="uniformtext.mode"
            options={[
              { label: _('Off'), value: false },
              { label: _('Show'), value: 'show' },
              { label: _('Hide'), value: 'hide' },
            ]}
            clearable={false}
          />
          <Numeric
            label={_('Uniform Text Size Minimum')}
            attr="uniformtext.minsize"
            units="px"
          />
        </PlotlySection>
      </PlotlyFold>

      <PlotlyFold name={_('Precision Format')}>
        <div
          style={styles.precisionRadio}
          className="radio-block radio-block__group"
        >
          <div
            role="presentation"
            onClick={() => setPrecisionAxis('all')}
            className={`radio-block__option ${
              precisionAxis === 'all' ? 'radio-block__option--active' : ''
            }`}
          >
            <span>All</span>
          </div>
          <div
            role="presentation"
            onClick={() => setPrecisionAxis('x')}
            className={`radio-block__option ${
              precisionAxis === 'x' ? 'radio-block__option--active' : ''
            }`}
          >
            <span>X</span>
          </div>
          <div
            role="presentation"
            onClick={() => setPrecisionAxis('y')}
            className={`radio-block__option ${
              precisionAxis === 'y' ? 'radio-block__option--active' : ''
            }`}
          >
            <span>Y</span>
          </div>
        </div>

        <Dropdown
          label={_('Number')}
          attr="separators"
          options={[
            { label: _('1,234.56'), value: '.,' },
            { label: _('1 234.56'), value: '. ' },
            { label: _('1 234,56'), value: ', ' },
            { label: _('1.234,56'), value: ',.' },
          ]}
          clearable={false}
        />
        {precisionAxis === 'all' && (
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
              Hover
            </p>
            <div style={styles.customDropdown}>
              <Select
                value={hoverFormatAll}
                onChange={(e) => handleHoverFormatAll(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        )}
        {precisionAxis === 'x' && (
          <Dropdown
            attr="xaxis.hoverformat"
            label={_('Hover X')}
            options={numbersFormat}
            clearable={false}
          />
        )}
        {precisionAxis === 'y' && (
          <Dropdown
            attr="yaxis.hoverformat"
            label={_('Hover Y')}
            options={numbersFormat}
            clearable={false}
          />
        )}
        {precisionAxis === 'all' && (
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
              Tick
            </p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.all}
                onChange={(e) => handleTickFormatAll(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        )}
        {precisionAxis === 'x' && (
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
              Tick X
            </p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.xaxis}
                onChange={(e) => handleTickFormatX(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        )}
        {precisionAxis === 'y' && (
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
              Tick Y
            </p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.yaxis}
                onChange={(e) => handleTickFormatY(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        )}
        {precisionAxis === 'all' && (
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
              Text
            </p>
            <div style={styles.customDropdown}>
              <Select
                value={textFormat}
                onChange={(e) => handleTextFormat(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                options={textFormats}
              />
            </div>
          </div>
        )}
      </PlotlyFold>
      <PlotlyFold name={_('Title')}>
        <TextEditor attr="title.text" />
        <FontSelector
          label={_('Typeface')}
          attr="title.font.family"
          clearable={true} // should keep it clearable to apply the default font family EEA
        />
        <Numeric label={_('Font Size')} attr="title.font.size" units="px" />
        <ColorPicker label={_('Font Color')} attr="title.font.color" />
        <Numeric
          label={_('Horizontal Position')}
          showSlider
          step={0.02}
          attr="title.x"
        />
      </PlotlyFold>

      <PlotlyFold name={_('Modebar')}>
        <Radio
          label={_('Orientation')}
          attr="modebar.orientation"
          options={[
            { label: _('Horizontal'), value: 'h' },
            { label: _('Vertical'), value: 'v' },
          ]}
        />
        <ColorPicker label={_('Icon Color')} attr="modebar.color" />
        <ColorPicker
          label={_('Active Icon Color')}
          attr="modebar.activecolor"
        />
        <ColorPicker label={_('Background Color')} attr="modebar.bgcolor" />
      </PlotlyFold>
      <PlotlyFold name={_('Size and Margins')}>
        <VisibilitySelect
          attr="autosize"
          label={_('Size')}
          options={[
            { label: _('Auto'), value: true },
            { label: _('Custom'), value: false },
          ]}
          showOn={false}
          defaultOpt={true}
          onChange={handleAutosizeChange}
        >
          <Numeric label={_('Fixed Width')} attr="width" units="px" />
          <Numeric label={_('Fixed height')} attr="height" units="px" />
        </VisibilitySelect>
        <Numeric label={_('Top')} attr="margin.t" units="px" />
        <Numeric label={_('Bottom')} attr="margin.b" units="px" />
        <Numeric label={_('Left')} attr="margin.l" units="px" />
        <Numeric label={_('Right')} attr="margin.r" units="px" />
        <Numeric label={_('Padding')} attr="margin.pad" units="px" />
      </PlotlyFold>
      <PlotlyFold name={_('Interactions')}>
        <PlotlySection name={_('Drag')} attr="dragmode">
          <Dropdown
            label={_('Mode')}
            attr="dragmode"
            options={[
              { label: _('Zoom'), value: 'zoom' },
              { label: _('Select'), value: 'select' },
              { label: _('Pan'), value: 'pan' },
              { label: _('Lasso'), value: 'lasso' },
              { label: _('Orbit'), value: 'orbit' },
              { label: _('Turntable'), value: 'turntable' },
            ]}
            clearable={false}
          />
          <Dropdown
            label={_('Select Direction')}
            attr="selectdirection"
            options={[
              { label: _('Any'), value: 'any' },
              { label: _('Horizontal'), value: 'h' },
              { label: _('Vertical'), value: 'v' },
              { label: _('Diagonal'), value: 'd' },
            ]}
            clearable={false}
          />
        </PlotlySection>
        <PlotlySection name={_('Click')} attr="clickmode">
          <Flaglist
            label={_('Mode')}
            attr="clickmode"
            options={[
              { label: _('Click Event'), value: 'event' },
              { label: _('Select Data Point'), value: 'select' },
            ]}
          />
          <TextInput
            label={'Search Link'}
            attr="customLink"
            {...props}
            isVisible={true}
          />
          <PanelMessage icon={null}>
            <div style={{ textAlign: 'left' }}>
              <p>
                {_(` For Bar chart use "allLinks" for specific clicked sector, "fullLinks" for clicked parent and set link list in Meta Text/Custom data,
          or insert direct link `)}
              </p>
            </div>
          </PanelMessage>
        </PlotlySection>
        <PlotlySection name={_('Hover')}>
          <HovermodeDropdown label={_('Mode')} attr="hovermode">
            <Dropdown
              label={_('Text Alignment')}
              attr="hoverlabel.align"
              options={[
                { label: _('Auto'), value: 'auto' },
                { label: _('Left'), value: 'left' },
                { label: _('Right'), value: 'right' },
              ]}
              clearable={false}
            />
            <HoverColor
              label={_('Background Color')}
              attr="hoverlabel.bgcolor"
              defaultColor="#FFF"
              handleEmpty
            />
            <HoverColor
              label={_('Border Color')}
              attr="hoverlabel.bordercolor"
              defaultColor="#000"
              handleEmpty
            />
            <FontSelector
              label={_('Typeface')}
              attr="hoverlabel.font.family"
              clearable
            />
            <Numeric label={_('Font Size')} attr="hoverlabel.font.size" />
            <HoverColor
              label={_('Font Color')}
              attr="hoverlabel.font.color"
              defaultColor="#000"
              handleEmpty
            />
          </HovermodeDropdown>
        </PlotlySection>
      </PlotlyFold>
      <PlotlyFold name={_('Meta Text')}>
        <DataSelector label={_('Custom Data')} attr="meta" />
        <Info>
          <p>
            {_(
              'You can refer to the items in this column in any text fields of the editor like so: ',
            )}
          </p>
          <p>
            {_('Ex: ')}
            <span
              style={{
                letterSpacing: '1px',
                fontStyle: 'italic',
                userSelect: 'text',
              }}
            >
              {_('My custom title %{meta[1]}')}
            </span>
          </p>
        </Info>
      </PlotlyFold>
    </LayoutPanel>
  );
};

StyleLayoutPanel.contextTypes = {
  localize: PropTypes.func,
  layout: PropTypes.object,
  fullLayout: PropTypes.object,
};

export default StyleLayoutPanel;
