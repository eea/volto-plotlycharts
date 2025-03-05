import loadable from '@loadable/component';

import 'react-chart-editor/lib/react-chart-editor.css';

const PlotlyEditor = loadable(() => import('./PlotlyEditor'));

export default PlotlyEditor;
