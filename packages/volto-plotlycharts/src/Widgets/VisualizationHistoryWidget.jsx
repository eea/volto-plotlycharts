import { useMemo } from 'react';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

function VisualizationHistoryWidget({ value, oldValue, newValue }) {
  const color = useMemo(() => {
    if (oldValue) {
      return 'green';
    }
    if (newValue) {
      return 'red';
    }
    return 'black';
  }, [oldValue, newValue]);

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

  const diffRows = useMemo(() => {
    const dataSources = oldValue?.dataSources || newValue?.dataSources || {};
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
  }, [oldValue, newValue]);

  return (
    <>
      <div
        style={{ overflowX: 'auto', maxHeight: '400px', marginBottom: '1rem' }}
      >
        <table style={{ marginLeft: '-1rem' }}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#f8f9fa',
              zIndex: 2,
            }}
          >
            <tr>
              {rows[0].map((header, i) => (
                <th key={i} style={{ padding: '0 1rem' }}>
                  {header || 'NULL'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (i === 0) {
                // Skip the first row as it contains headers
                return null;
              }
              return (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={`${i}_${j}`}
                      style={{
                        padding: '0 1rem',
                        ...(diffRows[i][j] !== cell
                          ? {
                              backgroundColor: color,
                              color: 'white',
                              fontWeight: 'bold',
                            }
                          : {}),
                      }}
                    >
                      {cell || 'NULL'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
