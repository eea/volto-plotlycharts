import { connect } from 'react-redux';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import ConnectedChart from '../ConnectedChart';

function VisualizationViewWidget(props) {
  return (
    <ConnectedChart
      data={{
        with_sources: false,
        with_notes: false,
        with_more_info: false,
        download_button: true,
        with_enlarge: true,
        with_share: true,
        visualization: {
          ...(props.value || {}),
          ...pickMetadata(props.content),
        },
      }}
    />
  );
}

export default connect((state) => ({ content: state.content.data }))(
  VisualizationViewWidget,
);
