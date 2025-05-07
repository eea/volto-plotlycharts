/* eslint-disable no-magic-numbers */
import React from 'react';
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
  SizeVisibilitySelect,
  HovermodeDropdown,
  Flaglist,
  Radio,
  Info,
} from '@eeacms/react-chart-editor';
import { HoverColor } from '@eeacms/react-chart-editor/lib/components/fields/derived';
import DataSelector from '@eeacms/react-chart-editor/lib/components/fields/DataSelector';

import { TextInput } from '../fields';

const Sizes = (_, { graphDiv }) => {
  if (!graphDiv) {
    return null;
  }

  function getHeight(selector, el) {
    const height = (el || (selector ? graphDiv.querySelector(selector) : null))
      ?.getBoundingClientRect()
      .height.toFixed(2);
    return height ? Math.ceil(height) : 0;
  }

  const gdWidth = graphDiv._fullLayout.width;
  const gdHeight = graphDiv._fullLayout.height;
  const margin = graphDiv._fullLayout.margin;

  const cHeight = gdHeight - (margin.t || 0) - (margin.b || 0);
  const cWidth = gdWidth - (margin.l || 0) - (margin.r || 0);

  const annotations = graphDiv.querySelectorAll('.infolayer .annotation');

  let annotationHeight = 0;
  const titleHeight = getHeight('.infolayer .g-gtitle');

  for (const annotation of annotations) {
    const height = getHeight(null, annotation);
    if (height > annotationHeight) {
      annotationHeight = height;
    }
  }

  return (
    <div className="sizes-info">
      <div>Size informations for variate elements.</div>
      <div>
        Chart height: {cHeight}px so 1% = {(0.01 * cHeight).toFixed(2)}px
      </div>
      <div>
        Chart width: {cWidth}px so 1% = {(0.01 * cWidth).toFixed(2)}px
      </div>
      <div>Title height: {titleHeight}px</div>
      <div>Annotation height: {annotationHeight}px</div>
    </div>
  );
};

Sizes.contextTypes = {
  graphDiv: PropTypes.any,
};

const StyleLayoutPanel = (props, { localize: _ }) => (
  <LayoutPanel {...props}>
    <PlotlyFold name={_('Defaults')}>
      <ColorPicker label={_('Plot Background')} attr="plot_bgcolor" />
      <ColorPicker label={_('Margin Color')} attr="paper_bgcolor" />
      <PlotlySection name={_('Colorscales')} attr="colorway">
        <ColorwayPicker
          label={_('Categorical')}
          attr="colorway"
          labelWidth={80}
          editable
        />
        <ColorscalePicker
          label={_('Sequential')}
          attr="colorscale.sequential"
          labelWidth={80}
          disableCategorySwitch
          editable
        />
        <ColorscalePicker
          initialCategory="divergent"
          label={_('Diverging')}
          attr="colorscale.diverging"
          labelWidth={80}
          disableCategorySwitch
          editable
        />
        <ColorscalePicker
          label={_('Negative Seq')}
          attr="colorscale.sequentialminus"
          labelWidth={80}
          disableCategorySwitch
          editable
        />
      </PlotlySection>
      <PlotlySection name={_('Text')} attr="font.family">
        <FontSelector
          label={_('Typeface')}
          attr="font.family"
          clearable={false}
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
            { label: _('1234.56'), value: '.' },
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

    <PlotlyFold name={_('Title')}>
      <TextEditor attr="title.text" />
      <FontSelector
        label={_('Typeface')}
        attr="title.font.family"
        clearable={false}
      />
      <Numeric label={_('Font Size')} attr="title.font.size" units="px" />
      <ColorPicker label={_('Font Color')} attr="title.font.color" />
      <PlotlySection name={_('Horizontal Positioning')}>
        <Dropdown
          label={_('Anchor Point')}
          attr="title.xanchor"
          options={[
            { label: _('Auto'), value: 'auto' },
            { label: _('Left'), value: 'left' },
            { label: _('Center'), value: 'center' },
            { label: _('Right'), value: 'right' },
          ]}
        />
        <Numeric label={_('Position')} showSlider step={0.02} attr="title.x" />
        <Dropdown
          label={_('Relative to')}
          attr="title.xref"
          options={[
            { label: _('Container'), value: 'container' },
            { label: _('Paper'), value: 'paper' },
          ]}
        />
      </PlotlySection>
      <PlotlySection name={_('Vertical Positioning')}>
        <Dropdown
          label={_('Anchor Point')}
          attr="title.yanchor"
          options={[
            { label: _('Auto'), value: 'auto' },
            { label: _('Top'), value: 'top' },
            { label: _('Middle'), value: 'middle' },
            { label: _('Bottom'), value: 'bottom' },
          ]}
        />
        <Numeric
          label={_('Position')}
          step={0.02}
          attr="title.y"
          visibilityOptions={[
            { label: 'Auto', value: 'auto', type: 'string' },
            { label: 'Custom', value: 1, type: 'number' },
          ]}
          showOn={1}
          showArrows
          showSlider
        />
        <Dropdown
          label={_('Relative to')}
          attr="title.yref"
          options={[
            { label: _('Container'), value: 'container' },
            { label: _('Paper'), value: 'paper' },
          ]}
        />
      </PlotlySection>
      <PlotlySection name={_('Subtitle')} attr="title.subtitle">
        <TextEditor attr="title.subtitle.text" />
        <FontSelector
          label={_('Typeface')}
          attr="title.subtitle.font.family"
          clearable={false}
        />
        <Numeric
          label={_('Font Size')}
          attr="title.subtitle.font.size"
          units="px"
        />
        <ColorPicker label={_('Font Color')} attr="title.subtitle.font.color" />
      </PlotlySection>
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
      <Sizes />
      <SizeVisibilitySelect
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
      </SizeVisibilitySelect>
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
        <Info>
          <p>
            {_(
              'For Bar chart use "allLinks" for specific clicked sector, "fullLinks" for clicked parent and set link list in Meta Text/Custom data, or insert direct link',
            )}
          </p>
        </Info>
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

StyleLayoutPanel.contextTypes = {
  localize: PropTypes.func,
};

export default StyleLayoutPanel;
