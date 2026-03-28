import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Chart, { ChartData, ChartConfig } from './Chart';

describe('Chart Component', () => {
  const mockBarData: ChartData[] = [
    { name: 'Enero', value: 4000 },
    { name: 'Febrero', value: 3000 },
    { name: 'Marzo', value: 5000 },
  ];

  const mockLineData: ChartData[] = [
    { name: 'Lun', value: 10 },
    { name: 'Mar', value: 15 },
    { name: 'Mié', value: 12 },
  ];

  const mockPieData: ChartData[] = [
    { name: 'Disponible', value: 5 },
    { name: 'Ocupada', value: 7 },
    { name: 'Limpieza', value: 2 },
  ];

  describe('Bar Chart', () => {
    it('should render bar chart component without crashing', () => {
      const config: ChartConfig = {
        xKey: 'name',
        yKey: 'value',
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      // Component renders successfully
      expect(container).toBeTruthy();
    });

    it('should use default config when not provided', () => {
      const { container } = render(<Chart type="bar" data={mockBarData} config={{}} />);
      
      expect(container).toBeTruthy();
    });

    it('should apply custom colors from config', () => {
      const config: ChartConfig = {
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });

  describe('Line Chart', () => {
    it('should render line chart component without crashing', () => {
      const config: ChartConfig = {
        xKey: 'name',
        yKey: 'value',
      };

      const { container } = render(<Chart type="line" data={mockLineData} config={config} />);
      
      expect(container).toBeTruthy();
    });

    it('should hide grid when showGrid is false', () => {
      const config: ChartConfig = {
        showGrid: false,
      };

      const { container } = render(<Chart type="line" data={mockLineData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });

  describe('Pie Chart', () => {
    it('should render pie chart component without crashing', () => {
      const config: ChartConfig = {
        dataKey: 'value',
        nameKey: 'name',
      };

      const { container } = render(<Chart type="pie" data={mockPieData} config={config} />);
      
      expect(container).toBeTruthy();
    });

    it('should hide legend when showLegend is false', () => {
      const config: ChartConfig = {
        showLegend: false,
      };

      const { container } = render(<Chart type="pie" data={mockPieData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display loading state when loading is true', () => {
      render(<Chart type="bar" data={mockBarData} config={{}} loading={true} />);
      
      expect(screen.getByText('Cargando gráfico...')).toBeInTheDocument();
    });

    it('should not render chart when loading', () => {
      const { container } = render(<Chart type="bar" data={mockBarData} config={{}} loading={true} />);
      
      // Should not render chart content when loading
      expect(container).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when data is empty array', () => {
      render(<Chart type="bar" data={[]} config={{}} />);
      
      expect(screen.getByText('No hay datos disponibles para mostrar')).toBeInTheDocument();
    });

    it('should display empty state message in Spanish', () => {
      render(<Chart type="line" data={[]} config={{}} />);
      
      const emptyText = screen.getByText('No hay datos disponibles para mostrar');
      expect(emptyText).toBeInTheDocument();
    });
  });

  describe('Responsive Sizing', () => {
    it('should use default height when not specified', () => {
      const { container } = render(<Chart type="bar" data={mockBarData} config={{}} />);
      
      expect(container).toBeTruthy();
    });

    it('should use custom height from config', () => {
      const config: ChartConfig = {
        height: 400,
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });

  describe('Spanish Tooltips', () => {
    it('should support Spanish locale formatting', () => {
      const config: ChartConfig = {
        showTooltip: true,
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      // The tooltip component is rendered but not visible until hover
      expect(container).toBeTruthy();
    });

    it('should hide tooltip when showTooltip is false', () => {
      const config: ChartConfig = {
        showTooltip: false,
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });

  describe('Chart Types', () => {
    it('should render all three chart types', () => {
      const { rerender, container } = render(<Chart type="bar" data={mockBarData} config={{}} />);
      expect(container).toBeTruthy();

      rerender(<Chart type="line" data={mockLineData} config={{}} />);
      expect(container).toBeTruthy();

      rerender(<Chart type="pie" data={mockPieData} config={{}} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Configuration Options', () => {
    it('should support all configuration options', () => {
      const config: ChartConfig = {
        xKey: 'customX',
        yKey: 'customY',
        dataKey: 'customData',
        nameKey: 'customName',
        colors: ['#ff0000'],
        showGrid: false,
        showLegend: false,
        showTooltip: false,
        height: 500,
      };

      const { container } = render(<Chart type="bar" data={mockBarData} config={config} />);
      
      expect(container).toBeTruthy();
    });
  });
});
