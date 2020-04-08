import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ColorPicker,
  ColorwayPicker,
  ColorscalePicker,
  Dropdown,
  FontSelector,
  PlotlyFold,
  Numeric,
  TextEditor,
  PlotlySection,
  LayoutPanel,
  VisibilitySelect,
  HovermodeDropdown,
  Flaglist,
  Radio,
  Info,
} from 'react-chart-editor/lib/components';
import { HoverColor } from 'react-chart-editor/lib/components/fields/derived';
import DataSelector from 'react-chart-editor/lib/components/fields/DataSelector';
import { Colorscale } from 'react-colorscales'
import Select from 'react-select';

import { settings } from '~/config'
import { useEffect } from 'react';

const customColors = settings.plotlyCustomColors || []


const StyleGeneralPanel = (props, { localize: _ }) => {

  const [tickFormat, setTickFormat] = useState({
    "xaxis": { label: _('Default'), value: '' },
    'yaxis': { label: _('Default'), value: '' },
    'all': { label: _('Default'), value: '' },
  })

  const [hoverFormatAll, setHoverFormatAll] = useState({ label: _('Default'), value: '' })

  const [textFormat, setTextFormat] = useState({ label: _('Default'), value: '' })

  const [precisionAxis, setPrecisionAxis] = useState("all")

  const numbersFormat = [
    { label: _('Default'), value: '' },
    { label: _('No Digit'), value: ',.1s' },
    { label: _('1 Digit'), value: ',.2s' },
    { label: _('2 Digits'), value: ',.3s' },
    { label: _('3 Digits'), value: ',.4s' },
    { label: _('4 Digits'), value: ',.5s' },
    { label: _('5 Digits'), value: ',.6s' },
    { label: _('6 Digits'), value: ',.7s' },
    { label: _('7 Digits'), value: ',.8s' },
  ]

  useEffect(() => {
    const data = props.value.data
    const cleanFormats = numbersFormat.slice(1, numbersFormat.length)
    if (data.length !== 0) {
      if (data[0].texttemplate) {
        const existingTextFormat = cleanFormats.find(format => data[0].texttemplate.includes(format.value))
        setTextFormat(existingTextFormat)
      }
    }
    // const layoutx = props.value.layout.xaxis
    // const layouty = props.value.layout.yaxis

    // if (layoutx && layouty) {
    //   if (layoutx.tickFormat === layouty.tickFormat) {
    //     const existingTickFormat = cleanFormats.find(format => format.value === layoutx.tickFormat)
    //     setTickFormat({
    //       ...tickFormat,
    //       all: format
    //     })
    //   }
    // }

  



  }, [])




  const onChangeColor = (customColor) => {
    props.onChangeValue({
      ...props.value,
      layout: {
        ...props.value.layout,
        colorway: customColor
      },
    });

  }

  const handleTextFormat = (e) => {
    setTextFormat(e)

    const newData = props.value.data.map(trace => {
      if (trace.text && !isNaN(parseFloat(trace.text[0]))) {
        return {
          ...trace, texttemplate: `%{text:${e.value}}`
        }
      } else return trace
    })

    props.onChangeValue({
      ...props.value,
      data: newData
    })
  }

  const handleTickFormatX = (format) => {
    setTickFormat({
      ...tickFormat,
      xaxis: format
    })

    props.onChangeValue({
      ...props.value,
      layout: {
        ...props.value.layout,
        xaxis: {
          ...props.value.layout.xaxis,
          tickformat: format.value,
        },
      }
    })
  }

  const handleTickFormatY = (format) => {
    setTickFormat({
      ...tickFormat,
      yaxis: format
    })
    props.onChangeValue({
      ...props.value,
      layout: {
        ...props.value.layout,
        yaxis: {
          ...props.value.layout.yaxis,
          tickformat: format.value,
        },
      }
    })
  }
  const handleTickFormatAll = (format) => {
    setTickFormat({
      ...tickFormat,
      all: format
    })
    props.onChangeValue({
      ...props.value,
      layout: {
        ...props.value.layout,
        xaxis: {
          ...props.value.layout.xaxis,
          tickformat: format.value,
        },
        yaxis: {
          ...props.value.layout.yaxis,
          tickformat: format.value,
        },
      }
    })
  }

  const handleHoverFormatAll = (format) => {
    setHoverFormatAll(format)
    props.onChangeValue({
      ...props.value,
      layout: {
        ...props.value.layout,
        xaxis: {
          ...props.value.layout.xaxis,
          hoverformat: format.value,
        },
        yaxis: {
          ...props.value.layout.yaxis,
          hoverformat: format.value,
        },
      }
    })
  }

  return (
    <LayoutPanel>
      <PlotlyFold name={_('Defaults')}>
        <ColorPicker label={_('Plot Background')} attr="plot_bgcolor" />
        <ColorPicker label={_('Margin Color')} attr="paper_bgcolor" />
        <PlotlySection name={_('Colorscales')} attr="colorway">
          <ColorwayPicker
            label={_('General')}
            attr="colorway"
            disableCategorySwitch
            labelWidth={80}
          />
          <ColorscalePicker
            label={_('Sequential')}
            attr="colorscale.sequential"
            disableCategorySwitch
            labelWidth={80}
          />

          <ColorscalePicker
            label={_('Diverging')}
            attr="colorscale.diverging"
            initialCategory="divergent"
            disableCategorySwitch
            labelWidth={80}
          />
          <ColorscalePicker
            label={_('Negative Sequential')}
            attr="colorscale.sequentialminus"
            disableCategorySwitch
            labelWidth={80}
          />
        </PlotlySection>
        <PlotlySection name={_('Custom Colorscales')} attr="colorway">
          {
            customColors && customColors.length ?
              customColors.map(customColorscale => (
                <div style={styles.scaleContainer} className="field field__colorscale">
                  <p style={{ width: '70px', fontSize: "12px" }}>{customColorscale.title}</p>
                  <div style={{ width: "180px", "margin-left": "12px", width: "180px" }}>
                    <Colorscale
                      colorscale={customColorscale.colorscale}
                      onClick={(colorscale) => onChangeColor(colorscale)}
                    />
                  </div>
                </div>
              ))
              :
              ""
          }

        </PlotlySection>
        <PlotlySection name={_('Text')} attr="font.family">
          <FontSelector label={_('Typeface')} attr="font.family" clearable={false} />
          <Numeric label={_('Base Font Size')} attr="font.size" units="px" />
          <ColorPicker label={_('Font Color')} attr="font.color" />
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
          <Numeric label={_('Uniform Text Size Minimum')} attr="uniformtext.minsize" units="px" />
        </PlotlySection>
      </PlotlyFold>
      <PlotlyFold name={_('Precision Format')}>

        <div style={styles.precisionRadio} className="radio-block radio-block__group">
          <div onClick={() => setPrecisionAxis("all")} className={`radio-block__option ${precisionAxis === "all" ? "radio-block__option--active" : ""}`}>
            <span>All</span>
          </div>
          <div onClick={() => setPrecisionAxis("x")} className={`radio-block__option ${precisionAxis === "x" ? "radio-block__option--active" : ""}`}>
            <span>X</span>
          </div>
          <div onClick={() => setPrecisionAxis("y")} className={`radio-block__option ${precisionAxis === "y" ? "radio-block__option--active" : ""}`}>
            <span>Y</span>
          </div>
        </div>

        <Dropdown
          label={_('Number')}
          attr="separators"
          options={[
            { label: _('1,234.56'), value: '.,' },
            { label: _('1 234.56'), value: ', ' },
            { label: _('1 234,56'), value: ', ' },
            { label: _('1.234,56'), value: ',.' },
          ]}
          clearable={false}
        />
        {precisionAxis === "all" &&
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: "12px", color: "#506784" }}>Hover</p>
            <div style={styles.customDropdown}>
              <Select
                value={hoverFormatAll}
                onChange={(e) => handleHoverFormatAll(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        }
        {precisionAxis === "x" && <Dropdown
          attr="xaxis.hoverformat"
          label={_('Hover X')}
          options={numbersFormat}
          clearable={false}
        />}
        {precisionAxis === "y" &&
          <Dropdown
            attr="yaxis.hoverformat"
            label={_('Hover Y')}
            options={numbersFormat}
            clearable={false}
          />}
        {precisionAxis === "all" &&
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: "12px", color: "#506784" }}>Tick</p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.all}
                onChange={(e) => handleTickFormatAll(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        }
        {precisionAxis === "x" &&
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: "12px", color: "#506784" }}>Tick X</p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.xaxis}
                onChange={(e) => handleTickFormatX(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        }
        {precisionAxis === "y" &&
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: "12px", color: "#506784" }}>Tick Y</p>
            <div style={styles.customDropdown}>
              <Select
                value={tickFormat.yaxis}
                onChange={(e) => handleTickFormatY(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null
                }}
                options={numbersFormat}
              />
            </div>
          </div>}
        {precisionAxis === "all" &&
          <div style={styles.scaleContainer} className="field field__widget">
            <p style={{ width: '70px', fontSize: "12px", color: "#506784" }}>Trace</p>
            <div style={styles.customDropdown}>
              <Select
                value={textFormat}
                onChange={(e) => handleTextFormat(e)}
                styles={selectStyles}
                components={{
                  IndicatorSeparator: () => null
                }}
                options={numbersFormat}
              />
            </div>
          </div>
        }
      </PlotlyFold>
      <PlotlyFold name={_('Title')}>
        <TextEditor attr="title.text" />
        <FontSelector label={_('Typeface')} attr="title.font.family" clearable={false} />
        <Numeric label={_('Font Size')} attr="title.font.size" units="px" />
        <ColorPicker label={_('Font Color')} attr="title.font.color" />
        <Numeric label={_('Horizontal Position')} showSlider step={0.02} attr="title.x" />
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
        <ColorPicker label={_('Active Icon Color')} attr="modebar.activecolor" />
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
            <FontSelector label={_('Typeface')} attr="hoverlabel.font.family" clearable />
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
              'You can refer to the items in this column in any text fields of the editor like so: '
            )}
          </p>
          <p>
            {_('Ex: ')}
            <span style={{ letterSpacing: '1px', fontStyle: 'italic', userSelect: 'text' }}>
              {_('My custom title %{meta[1]}')}
            </span>
          </p>
        </Info>
      </PlotlyFold>
    </LayoutPanel>
  );
}

StyleGeneralPanel.contextTypes = {
  localize: PropTypes.func,
};

export default StyleGeneralPanel;

const styles = {
  scaleContainer: {
    padding: '10px', fontWeight: "400 !important", color: "black !important"
  },
  customDropdown: {
    backgroundColor: "var(--color-background-inputs) !important",
    borderRadius: "5px",
    backgroundColor: "white",
    color: "var(--color-text-active)",
    marginLeft: "10px",
    webkitAppearance: "none",
    flex: '1'
  },
  precisionRadio: {
    padding: "10px"
  }
}

const selectStyles = {
  control: base => ({
    ...base,
    borderColor: "#C9D4E2",
    boxShadow: 'none'
  })
}
