import { toImage } from 'plotly.js/dist/plotly';

const handleDownloadImage = (type, chartRef, title) => {
  const {
    clientWidth: width = 700,
    clientHeight: height = 450,
  } = chartRef.current;

  toImage(chartRef.current, { format: type, height, width }).then((dataUrl) => {
    // Create a download link for the SVG
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};

const DownloadImage = ({ type, chartRef, title }) => {
  return (
    <div>
      <button
        className="plotly-download-button"
        onClick={() => {
          handleDownloadImage(type, chartRef, title);
        }}
      >
        <span>{type}</span>
      </button>
    </div>
  );
};

export default DownloadImage;
