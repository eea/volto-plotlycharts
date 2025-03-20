import { connect } from 'react-redux';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import ConnectedChart from '../ConnectedChart';
import { useSelector } from 'react-redux';

function VisualizationViewWidget(props) {
  // get the url of the figure from the visualization object
  // and use it to get the content from the store
  // this is needed because the visualization object is not
  // available in the content object when loading the component
  // from a Modal if found else fallback to the content object
  const figure_url = props.value?.provider_url;
  const obj_url = figure_url?.split('/').slice(0, -1).join('/');
  const contentFromStore = useSelector(
    (state) => state.content.subrequests?.[obj_url]?.data || state.content.data,
  );
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
          ...pickMetadata(contentFromStore),
        },
      }}
    />
  );
}

export default connect((state) => ({ content: state.content.data }))(
  VisualizationViewWidget,
);
