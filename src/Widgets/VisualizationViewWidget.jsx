import ConnectedChart from '../ConnectedChart';

export default function VisualizationViewWidget(props) {
  return (
    <ConnectedChart
      visualization={props.value}
      data={{
        with_sources: false,
        with_notes: false,
        with_more_info: false,
        download_button: false,
        with_enlarge: false,
        with_share: false,
      }}
    />
  );
}
