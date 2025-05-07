import { connect } from 'react-redux';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

function VisualizationViewWidget(props) {
  return (
    <PlotlyComponent
      data={{
        with_sources: false,
        with_notes: false,
        with_more_info: false,
        download_button: true,
        with_enlarge: true,
        with_share: true,
        visualization: props.value,
        properties: pickMetadata(props.content),
      }}
    />
  );
}

export default connect((state, props) => ({
  content: props.content ?? state.content.data,
}))(VisualizationViewWidget);
