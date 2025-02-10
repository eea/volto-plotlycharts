import { capitalize, striptags } from 'react-chart-editor/lib';

function getAxisNumber(axis) {
  const splitSubplot = axis._subplot
    ? axis._subplot.split(axis._axisGroup)
    : [];
  return splitSubplot[1]
    ? Number(splitSubplot[1])
    : axis._name.split('axis')[1];
}

export function getAxisTitle(axis) {
  const axisType = capitalize(axis._name.split('axis')[0]);
  const subplotNumber = getAxisNumber(axis) || 1;

  return axis._input?.title?.text
    ? striptags(`${axisType}: ${axis._input.title.text}`)
    : striptags(`${axisType} ${subplotNumber}`);
}
