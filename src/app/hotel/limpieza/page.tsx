'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Clock, Sparkles, AlertCircle, Sun, Moon, Settings, Save } from 'lucide-react';
import type { Room, Employee, CleaningRecord, ShiftConfig } from '@/types';
import {
  getRooms,
  getEmployees,
  getCleaningRecords,
  createCleaningRecord,
  updateRoom,
  getShiftConfig,
  updateShiftConfig,
  isCachePrimed,
} from '@/lib/data-access';
import CleaningSchedule from '@/components/hotel/CleaningSchedule';
import Modal from '@/components/shared/Modal';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

const defaultShiftConfig: ShiftConfig = {
  dayStart: '06:00',
  dayEnd: '18:00',
  nightStart: '18:00',
  nightEnd: '06:00',
  cleaningsPerDay: 8,
};

const isDayShift = (shift: Employee['shift']) => shift === 'mañana' || shift === 'tarde';

const parseTimeToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const isWithinRange = (minutes: number, start: string, end: string): boolean => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
};

export default function LimpiezaPage() {
  const { addToast } = useToast();
  const hasCache = useMemo(
    () => isCachePrimed('rooms', 'employees', 'cleaningRecords', 'shiftConfig'),
    []
  );
  const [loading, setLoading] = useState(!hasCache);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cleaningRecords, setCleaningRecords] = useState<CleaningRecord[]>([]);
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(defaultShiftConfig);
  const [configForm, setConfigForm] = useState<ShiftConfig>(defaultShiftConfig);
  const [configErrors, setConfigErrors] = useState<Record<string, string>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [roomsData, employeesData, recordsData, shiftConfigData] = await Promise.all([
          getRooms(),
          getEmployees(),
          getCleaningRecords(),
          getShiftConfig().catch(() => defaultShiftConfig),
        ]);
        if (!active) return;
        setRooms(roomsData);
        setEmployees(employeesData);
        setCleaningRecords(recordsData);
        const resolvedConfig = shiftConfigData || defaultShiftConfig;
        setShiftConfig(resolvedConfig);
        setConfigForm(resolvedConfig);
      } catch (error) {
        addToast('No se pudo cargar la información de limpieza.', 'error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [addToast, hasCache]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const clean = rooms.filter((r) => r.status === 'disponible').length;
    const pending = rooms.filter((r) => r.status === 'limpieza').length;
    const inProcess = rooms.filter((r) => r.status === 'ocupada').length;
    
    return { clean, pending, inProcess };
  }, [rooms]);

  // Get rooms that need cleaning today
  const roomsNeedingCleaning = useMemo(() => {
    return rooms.filter((r) => r.status === 'limpieza');
  }, [rooms]);

  const cleaningEmployees = useMemo(
    () => employees.filter((employee) => employee.role === 'limpieza'),
    [employees]
  );

  const currentShiftInfo = useMemo(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const isDay = isWithinRange(minutes, shiftConfig.dayStart, shiftConfig.dayEnd);
    const shiftEmployees = cleaningEmployees.filter((employee) =>
      isDay ? isDayShift(employee.shift) : employee.shift === 'noche'
    );

    return {
      label: isDay ? 'Día' : 'Noche',
      isDay,
      employees: shiftEmployees,
    };
  }, [cleaningEmployees, shiftConfig]);

  const todayCleaningCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return cleaningRecords.filter((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    }).length;
  }, [cleaningRecords]);

  const limitReached = useMemo(
    () =>
      shiftConfig.cleaningsPerDay > 0 &&
      todayCleaningCount >= shiftConfig.cleaningsPerDay,
    [shiftConfig.cleaningsPerDay, todayCleaningCount]
  );

  const hasConfigChanges = useMemo(() => {
    return (
      configForm.dayStart !== shiftConfig.dayStart ||
      configForm.dayEnd !== shiftConfig.dayEnd ||
      configForm.nightStart !== shiftConfig.nightStart ||
      configForm.nightEnd !== shiftConfig.nightEnd ||
      configForm.cleaningsPerDay !== shiftConfig.cleaningsPerDay
    );
  }, [configForm, shiftConfig]);

  // Open modal to mark cleaning as complete
  const handleMarkComplete = (room: Room) => {
    const preferredEmployees = currentShiftInfo.employees.length
      ? currentShiftInfo.employees
      : cleaningEmployees;
    const assignedEmployee = room.assignedEmployeeId
      ? preferredEmployees.find((employee) => employee.id === room.assignedEmployeeId)
      : undefined;
    const fallbackEmployeeId = preferredEmployees[0]?.id ?? '';
    setSelectedRoom(room);
    setFormData({
      employeeId: assignedEmployee?.id || fallbackEmployeeId,
      startTime: '',
      endTime: '',
      notes: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Debe seleccionar un empleado';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es obligatoria';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La hora de fin es obligatoria';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!configForm.dayStart) {
      newErrors.dayStart = 'La hora de inicio es obligatoria';
    }
    if (!configForm.dayEnd) {
      newErrors.dayEnd = 'La hora de fin es obligatoria';
    }
    if (!configForm.nightStart) {
      newErrors.nightStart = 'La hora de inicio es obligatoria';
    }
    if (!configForm.nightEnd) {
      newErrors.nightEnd = 'La hora de fin es obligatoria';
    }
    if (!configForm.cleaningsPerDay || configForm.cleaningsPerDay < 1) {
      newErrors.cleaningsPerDay = 'Debe definir al menos 1 aseo por día';
    }

    setConfigErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveConfig = async () => {
    if (!validateConfig()) return;

    setIsSavingConfig(true);
    try {
      const updated = await updateShiftConfig({
        ...configForm,
        cleaningsPerDay: Number(configForm.cleaningsPerDay),
      });
      setShiftConfig(updated);
      setConfigForm(updated);
      addToast('Configuración de turnos actualizada.', 'success');
    } catch (error) {
      addToast('No se pudo guardar la configuración.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleResetConfig = () => {
    setConfigForm(shiftConfig);
    setConfigErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom || !validateForm()) {
      return;
    }

    if (limitReached) {
      addToast('Se alcanzó el límite de aseos para hoy.', 'error');
      return;
    }

    try {
      // Create cleaning record
      const newRecord = await createCleaningRecord({
        roomId: selectedRoom.id,
        employeeId: formData.employeeId,
        date: new Date(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes || undefined,
      });

      // Update room status to disponible and set lastCleaned
      const updatedRoom = await updateRoom(selectedRoom.id, {
        status: 'disponible',
        lastCleaned: new Date(),
      });

      if (updatedRoom) {
        setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
      }

      setCleaningRecords((prev) => [...prev, newRecord]);
      setIsModalOpen(false);
    } catch (error) {
      addToast('No se pudo completar la limpieza.', 'error');
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.name : 'Sin asignar';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando limpieza...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Limpieza</h1>
      </div>

      {/* Status Panel */}
      <div className={styles.statusPanel}>
        <div className={styles.statusCard}>
          <div className={styles.statusIcon} style={{ background: 'var(--color-green-100)' }}>
            <CheckCircle size={24} style={{ color: 'var(--color-green-600)' }} />
          </div>
          <div className={styles.statusContent}>
            <span className={styles.statusLabel}>Limpias</span>
            <span className={styles.statusValue}>{statusCounts.clean}</span>
          </div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusIcon} style={{ background: 'var(--color-yellow-100)' }}>
            <Clock size={24} style={{ color: 'var(--color-yellow-600)' }} />
          </div>
          <div className={styles.statusContent}>
            <span className={styles.statusLabel}>Pendientes</span>
            <span className={styles.statusValue}>{statusCounts.pending}</span>
          </div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusIcon} style={{ background: 'var(--color-blue-100)' }}>
            <Sparkles size={24} style={{ color: 'var(--color-blue-600)' }} />
          </div>
          <div className={styles.statusContent}>
            <span className={styles.statusLabel}>En Proceso</span>
            <span className={styles.statusValue}>{statusCounts.inProcess}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.configPanel}>
          <div className={styles.configHeader}>
            <div>
              <div className={styles.configTitleRow}>
                <Settings size={18} />
                <h2 className={styles.sectionTitle}>Configuración de turnos</h2>
              </div>
              <p className={styles.configSubtitle}>
                Define horarios diurnos/nocturnos y el cupo diario de aseos.
              </p>
            </div>
            <span className={styles.shiftBadge}>
              Turno actual: <strong>{currentShiftInfo.label}</strong>
            </span>
          </div>

          <div className={styles.configGrid}>
            <div className={styles.configCard}>
              <div className={styles.configCardHeader}>
                <Sun size={18} />
                <span>Día (mañana/tarde)</span>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="dayStart" className={styles.label}>
                    Inicio
                  </label>
                  <input
                    id="dayStart"
                    type="time"
                    className={styles.input}
                    value={configForm.dayStart}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, dayStart: event.target.value }))
                    }
                  />
                  {configErrors.dayStart && (
                    <span className={styles.error}>{configErrors.dayStart}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="dayEnd" className={styles.label}>
                    Fin
                  </label>
                  <input
                    id="dayEnd"
                    type="time"
                    className={styles.input}
                    value={configForm.dayEnd}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, dayEnd: event.target.value }))
                    }
                  />
                  {configErrors.dayEnd && (
                    <span className={styles.error}>{configErrors.dayEnd}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.configCard}>
              <div className={styles.configCardHeader}>
                <Moon size={18} />
                <span>Noche</span>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nightStart" className={styles.label}>
                    Inicio
                  </label>
                  <input
                    id="nightStart"
                    type="time"
                    className={styles.input}
                    value={configForm.nightStart}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, nightStart: event.target.value }))
                    }
                  />
                  {configErrors.nightStart && (
                    <span className={styles.error}>{configErrors.nightStart}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="nightEnd" className={styles.label}>
                    Fin
                  </label>
                  <input
                    id="nightEnd"
                    type="time"
                    className={styles.input}
                    value={configForm.nightEnd}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, nightEnd: event.target.value }))
                    }
                  />
                  {configErrors.nightEnd && (
                    <span className={styles.error}>{configErrors.nightEnd}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.configCard}>
              <div className={styles.configCardHeader}>
                <Sparkles size={18} />
                <span>Aseos por día</span>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cleaningsPerDay" className={styles.label}>
                  Cantidad
                </label>
                <input
                  id="cleaningsPerDay"
                  type="number"
                  min={1}
                  className={styles.input}
                  value={configForm.cleaningsPerDay}
                  onChange={(event) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      cleaningsPerDay: Number(event.target.value),
                    }))
                  }
                />
                {configErrors.cleaningsPerDay && (
                  <span className={styles.error}>{configErrors.cleaningsPerDay}</span>
                )}
              </div>
              <div className={styles.configHint}>
                Hoy: {todayCleaningCount} / {shiftConfig.cleaningsPerDay}
              </div>
              {limitReached && (
                <div className={styles.limitBadge}>Límite diario alcanzado</div>
              )}
            </div>
          </div>

          <div className={styles.configActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleResetConfig}
              disabled={!hasConfigChanges || isSavingConfig}
            >
              Restablecer
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSaveConfig}
              disabled={!hasConfigChanges || isSavingConfig}
            >
              <Save size={16} />
              Guardar configuración
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Needing Cleaning */}
      {roomsNeedingCleaning.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <AlertCircle size={20} />
            Habitaciones Pendientes de Limpieza
          </h2>
          {limitReached && (
            <div className={styles.limitNotice}>
              <AlertCircle size={16} />
              Se alcanzó el límite diario de aseos. Ajusta el cupo para continuar.
            </div>
          )}
          <div className={styles.roomsList}>
            {roomsNeedingCleaning.map((room) => (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomInfo}>
                  <span className={styles.roomNumber}>Habitación {room.number}</span>
                  <span className={styles.roomDetails}>
                    Piso {room.floor} • {room.type}
                  </span>
                  {room.assignedEmployeeId && (
                    <span className={styles.roomEmployee}>
                      Asignado: {getEmployeeName(room.assignedEmployeeId)}
                    </span>
                  )}
                </div>
                <button
                  className={styles.completeButton}
                  onClick={() => handleMarkComplete(room)}
                  disabled={limitReached}
                >
                  <CheckCircle size={18} />
                  {limitReached ? 'Límite diario alcanzado' : 'Marcar como Completa'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleaning Schedule */}
      <div className={styles.section}>
        <CleaningSchedule
          cleaningRecords={cleaningRecords}
          rooms={rooms}
          employees={employees}
        />
      </div>

      {/* Complete Cleaning Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRoom ? `Completar Limpieza - Habitación ${selectedRoom.number}` : 'Completar Limpieza'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="employeeId" className={styles.label}>
              Empleado *
            </label>
            <select
              id="employeeId"
              className={styles.select}
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">Seleccionar empleado</option>
              {cleaningEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.shift}
                </option>
              ))}
            </select>
            {currentShiftInfo.employees.length === 0 && (
              <span className={styles.helperText}>
                No hay personal asignado al turno actual. Se muestran todos los empleados de limpieza.
              </span>
            )}
            {errors.employeeId && <span className={styles.error}>{errors.employeeId}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startTime" className={styles.label}>
                Hora de Inicio *
              </label>
              <input
                id="startTime"
                type="time"
                className={styles.input}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              {errors.startTime && <span className={styles.error}>{errors.startTime}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endTime" className={styles.label}>
                Hora de Fin *
              </label>
              <input
                id="endTime"
                type="time"
                className={styles.input}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
              {errors.endTime && <span className={styles.error}>{errors.endTime}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Notas
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Observaciones adicionales (opcional)"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Completar Limpieza
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


