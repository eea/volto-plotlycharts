import React from 'react';
import { DefaultEditor } from 'react-chart-editor';
import {
  // GraphCreatePanel,
  GraphTransformsPanel,
  GraphSubplotsPanel,
  // StyleLayoutPanel,
  // StyleAxesPanel,
  StyleMapsPanel,
  // StyleLegendPanel,
  // StyleNotesPanel,
  StyleShapesPanel,
  StyleSlidersPanel,
  StyleImagesPanel,
  // StyleTracesPanel,
  StyleColorbarsPanel,
  StyleUpdateMenusPanel,
  PanelMenuWrapper,
  Logo,
} from 'react-chart-editor';

import {
  StructureTemplatePanel,
  StructureFilterPanel,
  StructureGraphCreatePanel,
  StyleLayoutPanel,
  StyleTracesPanel,
  StyleAxesPanel,
  StyleLegendPanel,
  AnnotateNotesPanel,
} from './panels';

class CustomEditor extends DefaultEditor {
  render() {
    if (__SERVER__) return '';
    const _ = this.context.localize;
    const logo = this.props.logoSrc && <Logo src={this.props.logoSrc} />;

    return (
      <PanelMenuWrapper menuPanelOrder={this.props.menuPanelOrder}>
        {logo ? logo : null}
        {this.props.isTemplate && (
          <StructureTemplatePanel
            {...this.props}
            group={_('Structure')}
            name={_('Template')}
          />
        )}
        <StructureGraphCreatePanel group={_('Structure')} name={_('Traces')} />
        <GraphSubplotsPanel group={_('Structure')} name={_('Subplots')} />
        {this.hasTransforms() && (
          <GraphTransformsPanel group={_('Structure')} name={_('Transforms')} />
        )}
        <StructureFilterPanel
          {...this.props}
          group={_('Structure')}
          name={_('Filters')}
        />
        <StyleLayoutPanel
          group={_('Style')}
          name={_('General')}
          value={this.props.value}
          onChangeValue={this.props.onChangeValue}
        />
        <StyleTracesPanel
          group={_('Style')}
          name={_('Traces')}
          value={this.props.value}
          onChangeValue={this.props.onChangeValue}
        />
        {this.hasAxes() && (
          <StyleAxesPanel group={_('Style')} name={_('Axes')} />
        )}
        {this.hasMaps() && (
          <StyleMapsPanel group={_('Style')} name={_('Maps')} />
        )}
        {this.hasLegend() && (
          <StyleLegendPanel group={_('Style')} name={_('Legend')} />
        )}
        {this.hasColorbars() && (
          <StyleColorbarsPanel group={_('Style')} name={_('Color Bars')} />
        )}
        <AnnotateNotesPanel group={_('Annotate')} name={_('Text')} />
        <StyleShapesPanel group={_('Annotate')} name={_('Shapes')} />
        <StyleImagesPanel group={_('Annotate')} name={_('Images')} />
        {this.hasSliders() && (
          <StyleSlidersPanel group={_('Control')} name={_('Sliders')} />
        )}
        {this.hasMenus() && (
          <StyleUpdateMenusPanel group={_('Control')} name={_('Menus')} />
        )}
        {this.props.children ? this.props.children : null}
      </PanelMenuWrapper>
    );
  }
}

export default CustomEditor;
