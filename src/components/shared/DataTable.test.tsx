import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable, { Column, Filter } from './DataTable';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await vi.importActual<typeof import('@/tests/utils/framer-motion-mock')>(
    '@/tests/utils/framer-motion-mock'
  );
  return createFramerMotionMock();
});

interface TestData {
  id: string;
  name: string;
  age: number;
  status: string;
  date: Date;
}

describe('DataTable', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'Juan', age: 30, status: 'activo', date: new Date('2024-01-15') },
    { id: '2', name: 'María', age: 25, status: 'inactivo', date: new Date('2024-02-20') },
    { id: '3', name: 'Pedro', age: 35, status: 'activo', date: new Date('2024-01-10') },
  ];

  const mockColumns: Column<TestData>[] = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'age', label: 'Edad', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Edad')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('María')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });

  it('displays empty state when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} emptyMessage="Sin datos" />);

    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('sorts data ascending when clicking column header', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByRole('button', { name: /Ordenar por Nombre/i });
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    // First row is header, so data rows start at index 1
    expect(rows[1]).toHaveTextContent('Juan');
    expect(rows[2]).toHaveTextContent('María');
    expect(rows[3]).toHaveTextContent('Pedro');
  });

  it('sorts data descending when clicking column header twice', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByRole('button', { name: /Ordenar por Nombre/i });
    fireEvent.click(nameHeader); // First click: ascending
    fireEvent.click(nameHeader); // Second click: descending

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Pedro');
    expect(rows[2]).toHaveTextContent('María');
    expect(rows[3]).toHaveTextContent('Juan');
  });

  it('clears sort when clicking column header three times', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByRole('button', { name: /Ordenar por Nombre/i });
    fireEvent.click(nameHeader); // First click: ascending
    fireEvent.click(nameHeader); // Second click: descending
    fireEvent.click(nameHeader); // Third click: clear sort

    const rows = screen.getAllByRole('row');
    // Should return to original order
    expect(rows[1]).toHaveTextContent('Juan');
    expect(rows[2]).toHaveTextContent('María');
    expect(rows[3]).toHaveTextContent('Pedro');
  });

  it('sorts numeric columns correctly', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const ageHeader = screen.getByRole('button', { name: /Ordenar por Edad/i });
    fireEvent.click(ageHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('25');
    expect(rows[2]).toHaveTextContent('30');
    expect(rows[3]).toHaveTextContent('35');
  });

  it('applies filters correctly', () => {
    const filters: Filter[] = [
      {
        key: 'status',
        label: 'Estado',
        options: [
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' },
        ],
      },
    ];

    render(<DataTable columns={mockColumns} data={mockData} filters={filters} />);

    const filterSelect = screen.getByLabelText('Estado');
    fireEvent.change(filterSelect, { target: { value: 'activo' } });

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    expect(screen.queryByText('María')).not.toBeInTheDocument();
  });

  it('displays empty message when filters return no results', () => {
    const filters: Filter[] = [
      {
        key: 'status',
        label: 'Estado',
        options: [{ value: 'pendiente', label: 'Pendiente' }],
      },
    ];

    render(<DataTable columns={mockColumns} data={mockData} filters={filters} />);

    const filterSelect = screen.getByLabelText('Estado');
    fireEvent.change(filterSelect, { target: { value: 'pendiente' } });

    expect(screen.getByText('No se encontraron resultados con los filtros aplicados')).toBeInTheDocument();
  });

  it('paginates data correctly with 20 items per page', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    expect(screen.getByText('Persona 1')).toBeInTheDocument();
    expect(screen.getByText('Persona 20')).toBeInTheDocument();
    expect(screen.queryByText('Persona 21')).not.toBeInTheDocument();
    expect(screen.getByText('Mostrando 1-20 de 50 resultados')).toBeInTheDocument();
  });

  it('navigates to next page', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    const nextButton = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('Persona 21')).toBeInTheDocument();
    expect(screen.getByText('Persona 40')).toBeInTheDocument();
    expect(screen.queryByText('Persona 1')).not.toBeInTheDocument();
    expect(screen.getByText('Mostrando 21-40 de 50 resultados')).toBeInTheDocument();
  });

  it('navigates to previous page', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    const nextButton = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(nextButton);

    const prevButton = screen.getByRole('button', { name: /Página anterior/i });
    fireEvent.click(prevButton);

    expect(screen.getByText('Persona 1')).toBeInTheDocument();
    expect(screen.getByText('Persona 20')).toBeInTheDocument();
    expect(screen.queryByText('Persona 21')).not.toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    const prevButton = screen.getByRole('button', { name: /Página anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    const nextButton = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(nextButton); // Page 2
    fireEvent.click(nextButton); // Page 3 (last page)

    expect(nextButton).toBeDisabled();
  });

  it('uses custom render function for columns', () => {
    const columnsWithRender: Column<TestData>[] = [
      {
        key: 'name',
        label: 'Nombre',
        render: (value) => <strong>{value}</strong>,
      },
    ];

    render(<DataTable columns={columnsWithRender} data={mockData} />);

    const strongElements = screen.getAllByText(/Juan|María|Pedro/);
    strongElements.forEach((element) => {
      expect(element.tagName).toBe('STRONG');
    });
  });

  it('handles non-sortable columns', () => {
    const columnsWithNonSortable: Column<TestData>[] = [
      { key: 'name', label: 'Nombre', sortable: false },
      { key: 'age', label: 'Edad', sortable: true },
    ];

    render(<DataTable columns={columnsWithNonSortable} data={mockData} />);

    expect(screen.queryByRole('button', { name: /Ordenar por Nombre/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ordenar por Edad/i })).toBeInTheDocument();
  });

  it('resets to first page when sorting', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: 'activo',
      date: new Date(),
    }));

    render(<DataTable columns={mockColumns} data={largeData} />);

    // Go to page 2
    const nextButton = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(nextButton);
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();

    // Sort by name
    const nameHeader = screen.getByRole('button', { name: /Ordenar por Nombre/i });
    fireEvent.click(nameHeader);

    // Should reset to page 1
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });

  it('resets to first page when filtering', () => {
    const largeData: TestData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Persona ${i + 1}`,
      age: 20 + i,
      status: i % 2 === 0 ? 'activo' : 'inactivo',
      date: new Date(),
    }));

    const filters: Filter[] = [
      {
        key: 'status',
        label: 'Estado',
        options: [
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' },
        ],
      },
    ];

    render(<DataTable columns={mockColumns} data={largeData} filters={filters} />);

    // Go to page 2
    const nextButton = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(nextButton);

    // Apply filter
    const filterSelect = screen.getByLabelText('Estado');
    fireEvent.change(filterSelect, { target: { value: 'activo' } });

    // Should reset to page 1
    expect(screen.getByText(/Página 1 de/)).toBeInTheDocument();
  });
});



