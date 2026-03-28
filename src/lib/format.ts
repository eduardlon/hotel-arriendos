import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

const toDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

export const formatDate = (value: Date | string, pattern: string = 'dd/MM/yyyy'): string => {
  const date = toDate(value);
  if (!isValid(date)) return '';
  return format(date, pattern, { locale: es });
};

export const formatMonthYear = (value: Date | string): string => {
  return formatDate(value, 'MMM yyyy');
};

export const formatDayShort = (value: Date | string): string => {
  return formatDate(value, 'EEE');
};

export const formatDayNumber = (value: Date | string): string => {
  return formatDate(value, 'd');
};

export const formatCurrency = (
  amount: number,
  locale: string = 'es-CL',
  currency: string = 'CLP',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 0
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};
