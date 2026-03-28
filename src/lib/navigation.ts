import type { ComponentType } from 'react';
import {
  Home,
  DoorOpen,
  Users,
  Sparkles,
  DollarSign,
  Building2,
  UserCircle,
  CreditCard,
  Receipt,
  Bell,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const hotelNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/hotel/dashboard', icon: Home },
  { label: 'Habitaciones', href: '/hotel/habitaciones', icon: DoorOpen },
  { label: 'Empleados', href: '/hotel/empleados', icon: Users },
  { label: 'Limpieza', href: '/hotel/limpieza', icon: Sparkles },
  { label: 'Finanzas', href: '/hotel/finanzas', icon: DollarSign },
];

export const arriendosNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/arriendos/dashboard', icon: Home },
  { label: 'Propiedades', href: '/arriendos/propiedades', icon: Building2 },
  { label: 'Inquilinos', href: '/arriendos/inquilinos', icon: UserCircle },
  { label: 'Pagos', href: '/arriendos/pagos', icon: CreditCard },
  { label: 'Gastos', href: '/arriendos/gastos', icon: Receipt },
  { label: 'Recordatorios', href: '/arriendos/recordatorios', icon: Bell },
];

export const getNavItems = (business: 'hotel' | 'arriendos') =>
  business === 'hotel' ? hotelNavItems : arriendosNavItems;
