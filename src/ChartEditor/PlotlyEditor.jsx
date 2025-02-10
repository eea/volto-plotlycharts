import React from 'react';
import DefaultPlotlyEditor, { EditorControls } from 'react-chart-editor';
import TemplateSelector from './widgets/TemplateSelector';

class PlotlyEditor extends DefaultPlotlyEditor {
  render() {
    // console.log({
    //   ...(this.props.layout || {}),
    //   ...(this.props.layout?.annotations
    //     ? {
    //         annotations: this.props.layout.annotations.map((annotation) => {
    //           return {
    //             ...annotation,
    //           };
    //         }),
    //       }
    //     : {}),
    // });
    return (
      <div className="plotly_editor">
        {!this.props.hideControls && (
          <EditorControls
            graphDiv={this.state.graphDiv}
            dataSources={this.props.dataSources}
            dataSourceOptions={this.props.dataSourceOptions}
            plotly={this.props.plotly}
            onUpdate={this.props.onUpdate}
            advancedTraceTypeSelector={this.props.advancedTraceTypeSelector}
            locale={this.props.locale}
            traceTypesConfig={this.props.traceTypesConfig}
            dictionaries={this.props.dictionaries}
            showFieldTooltips={this.props.showFieldTooltips}
            srcConverters={this.props.srcConverters}
            makeDefaultTrace={this.props.makeDefaultTrace}
            glByDefault={this.props.glByDefault}
            mapBoxAccess={Boolean(
              this.props.config && this.props.config.mapboxAccessToken,
            )}
            fontOptions={this.props.fontOptions}
            chartHelp={this.props.chartHelp}
            customConfig={this.props.customConfig}
          >
            {this.props.children}
          </EditorControls>
        )}
        <div
          className="plotly_editor_plot"
          style={{ width: '100%', height: '100%' }}
        >
          {!this.props.data.length && !this.props.isTemplate && (
            <TemplateSelector
              dataSources={this.props.dataSources}
              dataSourceOptions={this.props.dataSourceOptions}
              onUpdateValue={this.props.onUpdateValue}
            />
          )}
          <this.PlotComponent
            data={this.props.data}
            layout={this.props.layout}
            // layout={{
            //   ...(this.props.layout || {}),
            //   ...(this.props.layout?.annotations
            //     ? {
            //         annotations: this.props.layout.annotations.map(
            //           (annotation) => {
            //             return {
            //               ...annotation,
            //             };
            //           },
            //         ),
            //       }
            //     : {}),
            // }}
            frames={this.props.frames}
            config={this.props.config}
            useResizeHandler={this.props.useResizeHandler}
            debug={this.props.debug}
            onInitialized={this.handleRender}
            onUpdate={this.handleRender}
            style={{ width: '100%', height: '100%' }}
            divId={this.props.divId}
          />
        </div>
      </div>
    );
  }
}

export default PlotlyEditor;
