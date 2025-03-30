import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

function VisualizationHistoryWidget({ value }) {
  return (
    <PlotlyComponent
      data={{
        with_sources: false,
        with_notes: false,
        with_more_info: false,
        download_button: false,
        with_enlarge: false,
        with_share: false,
        visualization: value,
      }}
    />
  );
}

export default VisualizationHistoryWidget;
