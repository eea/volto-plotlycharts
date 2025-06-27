import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Default, PieChartExample } from './Plot.stories';
import '@testing-library/jest-dom/extend-expect';

beforeAll(() => {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock');
  HTMLCanvasElement.prototype.getContext = jest.fn();
});

describe('VoltoPlotlyCharts Stories', () => {
  describe('Default story', () => {
    it('renders Plotly bar chart and toolbar correctly', async () => {
      const { getByText, container } = render(<Default {...Default.args} />);

      expect(getByText(/Notes/i)).toBeInTheDocument();
      expect(getByText(/Sources/i)).toBeInTheDocument();
      expect(getByText(/More Info/i)).toBeInTheDocument();
      expect(getByText(/Download/i)).toBeInTheDocument();
      expect(getByText(/Share/i)).toBeInTheDocument();
      expect(getByText(/Enlarge/i)).toBeInTheDocument();

      fireEvent.click(getByText(/Download/i));

      await waitFor(() => {
        const svgElements = container.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PieChartExample story', () => {
    it('renders Plotly pie chart and toolbar correctly', async () => {
      const { getByText, container } = render(
        <PieChartExample {...PieChartExample.args} />,
      );

      expect(getByText(/Download/i)).toBeInTheDocument();
      expect(getByText(/Share/i)).toBeInTheDocument();
      expect(getByText(/Enlarge/i)).toBeInTheDocument();

      fireEvent.click(getByText(/Share/i));

      await waitFor(() => {
        const svgElements = container.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThan(0);
      });
    });
  });
});
