import {
  TraceTypeBarIcon,
  TraceTypePieIcon,
  TraceTypeLineIcon,
  TraceTypeHeatmapIcon,
} from 'plotly-icons';

export default function ThemeIcon({ size = 48 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size / 2}px`,
          display: 'flex',
        }}
      >
        <TraceTypeBarIcon />
        <TraceTypePieIcon />
      </div>
      <div
        style={{
          width: `${size}px`,
          height: `${size / 2}px`,
          display: 'flex',
        }}
      >
        <TraceTypeLineIcon />
        <TraceTypeHeatmapIcon />
      </div>
    </div>
  );
}
