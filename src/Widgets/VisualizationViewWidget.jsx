import ConnectedChart from '../ConnectedChart';

export default function VisualizationViewWidget(props) {
  return <ConnectedChart visualization={props.value} />;
}
