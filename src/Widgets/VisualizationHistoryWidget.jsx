import { useMemo } from 'react';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

function VisualizationHistoryWidget({ value }) {
  const rows = useMemo(() => {
    const dataSources = value.dataSources;
    const columns = Object.keys(dataSources);
    let col = 0;
    return columns.reduce(
      (acc, opts) => {
        if (!opts) {
          return acc;
        }
        const value = [opts, ...(dataSources[opts] || [])];
        value.forEach((_, i) => {
          if (!acc[i]) {
            acc[i] = [];
          }
          acc[i][col] = value[i];
        });
        ++col;
        return acc;
      },
      [[]],
    );
  }, [value.dataSources]);

  return (
    <>
      <table style={{ marginLeft: '-1rem' }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={`${i}_${j}`} style={{ padding: '0 1rem' }}>
                  {cell || 'NULL'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
    </>
  );
}

export default VisualizationHistoryWidget;
