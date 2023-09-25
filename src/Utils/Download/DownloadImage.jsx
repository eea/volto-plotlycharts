import { toImage } from 'plotly.js/dist/plotly';

const handleDownloadImage = (type, chartRef) => {
  const {
    clientWidth: width = 700,
    clientHeight: height = 450,
  } = chartRef.current;

  toImage(chartRef.current, { format: type, height, width }).then((dataUrl) => {
    // Create a download link for the SVG
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `chart.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};

const DownloadImage = ({ type, chartRef }) => {
  return (
    <div>
      <button
        className="plotly-download-button"
        onClick={() => {
          handleDownloadImage(type, chartRef);
        }}
      >
        <span>{type}</span>
      </button>
    </div>
  );
};

export default DownloadImage;
