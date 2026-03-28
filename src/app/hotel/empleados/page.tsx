'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Employee, CleaningRecord, Room } from '@/types';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getCleaningRecordsByEmployeeId, getRooms, isCachePrimed } from '@/lib/data-access';
import EmployeeCard from '@/components/hotel/EmployeeCard';
import Modal from '@/components/shared/Modal';
import { useToast } from '@/components/shared/Toast';
import { formatDate } from '@/lib/format';
import styles from './page.module.css';

export default function EmpleadosPage() {
  const { addToast } = useToast();
  const hasCache = useMemo(() => isCachePrimed('employees', 'rooms'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [cleaningHistory, setCleaningHistory] = useState<CleaningRecord[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    role: 'limpieza' as Employee['role'],
    shift: 'mañana' as Employee['shift'],
    phone: '',
    email: '',
    photo: '',
    hireDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load employees and rooms
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [employeesData, roomsData] = await Promise.all([getEmployees(), getRooms()]);
        if (!active) return;
        setEmployees(employeesData);
        setRooms(roomsData);
      } catch (error) {
        addToast('No se pudieron cargar los empleados.', 'error');
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

  // Open modal for creating new employee
  const handleCreate = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'limpieza',
      shift: 'mañana',
      phone: '',
      email: '',
      photo: '',
      hireDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing employee
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      shift: employee.shift,
      phone: employee.phone,
      email: employee.email,
      photo: employee.photo || '',
      hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open detail modal to view employee cleaning history
  const handleViewDetail = async (employee: Employee) => {
    setViewingEmployee(employee);
    const history = await getCleaningRecordsByEmployeeId(employee.id);
    // Sort by date descending (most recent first)
    const sortedHistory = history.sort((a, b) => b.date.getTime() - a.date.getTime());
    setCleaningHistory(sortedHistory);
    setIsDetailModalOpen(true);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Check for duplicate email (only when creating or changing email)
    const isDuplicateEmail = employees.some(
      (emp) =>
        emp.email === formData.email &&
        emp.id !== editingEmployee?.id
    );
    if (isDuplicateEmail) {
      newErrors.email = 'Ya existe un empleado con este correo electrónico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const employeeData = {
      name: formData.name,
      role: formData.role,
      shift: formData.shift,
      phone: formData.phone,
      email: formData.email,
      photo: formData.photo || undefined,
      hireDate: new Date(formData.hireDate),
    };

    if (editingEmployee) {
      const previousState = [...employees];
      const optimisticEmployee: Employee = { ...editingEmployee, ...employeeData };
      setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? optimisticEmployee : emp)));
      setIsModalOpen(false);

      try {
        const updated = await updateEmployee(editingEmployee.id, employeeData);
        if (updated) {
          setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
        }
      } catch (error) {
        setEmployees(previousState);
        addToast('No se pudieron guardar los cambios.', 'error');
      }
    } else {
      const previousState = [...employees];
      const tempId = `emp-temp-${Date.now()}`;
      const optimisticEmployee: Employee = { id: tempId, ...employeeData };
      setEmployees((prev) => [optimisticEmployee, ...prev]);
      setIsModalOpen(false);

      try {
        const newEmployee = await createEmployee(employeeData);
        setEmployees((prev) => prev.map((emp) => (emp.id === tempId ? newEmployee : emp)));
      } catch (error) {
        setEmployees(previousState);
        addToast('No se pudo crear el empleado.', 'error');
      }
    }
  };

  // Handle employee deletion
  const handleDelete = async () => {
  if (!editingEmployee) return;

  if (confirm(`¿Estás seguro de que deseas eliminar a ${editingEmployee.name}?`)) {
    const previousState = [...employees];
    setEmployees((prev) => prev.filter((e) => e.id !== editingEmployee.id));
    setIsModalOpen(false);
    try {
      const success = await deleteEmployee(editingEmployee.id);
      if (!success) {
        setEmployees(previousState);
        addToast('No se pudo eliminar el empleado.', 'error');
      }
    } catch (error) {
      setEmployees(previousState);
      addToast('No se pudo eliminar el empleado.', 'error');
    }
  }
};

  // Helper function to get room number by ID
  const getRoomNumber = (roomId: string): string => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.number : roomId;
  };



  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Empleados</h1>
        <button className={styles.createButton} onClick={handleCreate}>
          <Plus size={20} />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      <div className={styles.employeeGrid}>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => handleViewDetail(employee)}
          />
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre Completo *
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Rol *
            </label>
            <select
              id="role"
              className={styles.select}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
            >
              <option value="recepcionista">Recepcionista</option>
              <option value="limpieza">Limpieza</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="shift" className={styles.label}>
              Turno *
            </label>
            <select
              id="shift"
              className={styles.select}
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value as Employee['shift'] })}
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Teléfono *
            </label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico *
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photo" className={styles.label}>
              URL de Foto
            </label>
            <input
              id="photo"
              type="url"
              className={styles.input}
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="hireDate" className={styles.label}>
              Fecha de Contratación *
            </label>
            <input
              id="hireDate"
              type="date"
              className={styles.input}
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            />
          </div>

          <div className={styles.formActions}>
            {editingEmployee && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={viewingEmployee ? `Detalles de ${viewingEmployee.name}` : 'Detalles del Empleado'}
      >
        {viewingEmployee && (
          <div className={styles.detailContent}>
            <div className={styles.employeeInfo}>
              <h3 className={styles.sectionTitle}>Información del Empleado</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nombre:</span>
                  <span className={styles.infoValue}>{viewingEmployee.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Rol:</span>
                  <span className={styles.infoValue}>
                    {viewingEmployee.role === 'recepcionista' && 'Recepcionista'}
                    {viewingEmployee.role === 'limpieza' && 'Limpieza'}
                    {viewingEmployee.role === 'mantenimiento' && 'Mantenimiento'}
                    {viewingEmployee.role === 'gerente' && 'Gerente'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Turno:</span>
                  <span className={styles.infoValue}>
                    {viewingEmployee.shift === 'mañana' && 'Mañana'}
                    {viewingEmployee.shift === 'tarde' && 'Tarde'}
                    {viewingEmployee.shift === 'noche' && 'Noche'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono:</span>
                  <span className={styles.infoValue}>{viewingEmployee.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{viewingEmployee.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de Contratación:</span>
                  <span className={styles.infoValue}>{formatDate(viewingEmployee.hireDate)}</span>
                </div>
              </div>
              <button
                className={styles.editButton}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEdit(viewingEmployee);
                }}
              >
                Editar Empleado
              </button>
            </div>

            <div className={styles.cleaningHistory}>
              <h3 className={styles.sectionTitle}>Historial de Limpieza</h3>
              {cleaningHistory.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Habitación</th>
                        <th>Hora Inicio</th>
                        <th>Hora Fin</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cleaningHistory.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.date)}</td>
                          <td>{getRoomNumber(record.roomId)}</td>
                          <td>{record.startTime}</td>
                          <td>{record.endTime}</td>
                          <td>{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.emptyMessage}>No hay registros de limpieza para este empleado.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}





