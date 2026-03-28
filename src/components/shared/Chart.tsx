'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './Chart.module.css';

export interface ChartData {
  [key: string]: string | number;
}

export interface ChartConfig {
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: ChartData[];
  config: ChartConfig;
  loading?: boolean;
}

const DEFAULT_COLORS = [
  'var(--color-blue-accent)',
  'var(--color-green-accent)',
  'var(--color-status-warning)',
  'var(--color-status-error)',
  '#8b5cf6',
  '#ec4899',
];

const DEFAULT_CONFIG: ChartConfig = {
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  height: 300,
  colors: DEFAULT_COLORS,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        {label && <p className={styles.tooltipLabel}>{label}</p>}
        {payload.map((entry: any, index: number) => (
          <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('es-ES') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Chart({ type, data, config, loading = false }: ChartProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const colors = mergedConfig.colors || DEFAULT_COLORS;
  const gradientId = useId();

  if (loading) {
    return (
      <div className={styles.loadingContainer} style={{ height: mergedConfig.height }}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Cargando gráfico...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyContainer} style={{ height: mergedConfig.height }}>
        <p className={styles.emptyText}>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={mergedConfig.height}>
            <BarChart data={data}>
              <defs>
                <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[0]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={colors[0]} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              {mergedConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />}
              <XAxis
                dataKey={mergedConfig.xKey || 'name'}
                stroke="var(--color-gray-600)"
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
              <YAxis
                stroke="var(--color-gray-600)"
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
              {mergedConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {mergedConfig.showLegend && <Legend wrapperStyle={{ fontSize: 'var(--font-size-sm)' }} />}
              <Bar
                dataKey={mergedConfig.yKey || 'value'}
                fill={`url(#${gradientId}-bar)`}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={mergedConfig.height}>
            <LineChart data={data}>
              <defs>
                <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors[0]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={colors[0]} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              {mergedConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />}
              <XAxis
                dataKey={mergedConfig.xKey || 'name'}
                stroke="var(--color-gray-600)"
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
              <YAxis
                stroke="var(--color-gray-600)"
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
              {mergedConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {mergedConfig.showLegend && <Legend wrapperStyle={{ fontSize: 'var(--font-size-sm)' }} />}
              <Line
                type="monotone"
                dataKey={mergedConfig.yKey || 'value'}
                stroke={`url(#${gradientId}-line)`}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={mergedConfig.height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={mergedConfig.dataKey || 'value'}
                nameKey={mergedConfig.nameKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {mergedConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {mergedConfig.showLegend && <Legend wrapperStyle={{ fontSize: 'var(--font-size-sm)' }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={styles.chartContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {renderChart()}
    </motion.div>
  );
}
