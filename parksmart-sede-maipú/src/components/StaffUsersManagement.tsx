import { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Search, Plus, Filter, ShieldAlert, User, Trash2, Edit2, ShieldCheck, Mail } from 'lucide-react';

interface StaffUsersManagementProps {
  users: UserProfile[];
  onToggleUserActive: (userId: string) => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
}

export default function StaffUsersManagement({
  users,
  onToggleUserActive,
  onUpdateUserRole
}: StaffUsersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRoleOption, setSelectedRoleOption] = useState<UserRole>('Guardia');

  const totalCount = users.length;
  const activeCount = users.filter(u => u.active).length;
  const inactiveCount = users.filter(u => !u.active).length;
  const alertCount = 0;

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleEditRoleClick = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedRoleOption(user.role);
  };

  const handleSaveRole = () => {
    if (editingUser) {
      onUpdateUserRole(editingUser.id, selectedRoleOption);
      setEditingUser(null);
    }
  };

  const availableRoles: UserRole[] = [
    'Super Admin',
    'Jefe Seguridad',
    'Guardia',
    'Jefe Servicios Gral.',
    'Conductor'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 pb-24 bg-gray-50 min-h-screen">
      
      {/* Header and overview */}
      <section className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h2>
        <p className="text-xs text-gray-500">Control de acceso y Roles (RBAC) para el sistema de infraestructura y barreras.</p>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total Usuarios</span>
          <span className="text-3xl font-black text-[#00288e] tracking-tight mt-1">{totalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Activos Ahora</span>
          <span className="text-3xl font-black text-emerald-600 tracking-tight mt-1">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Inactivos</span>
          <span className="text-3xl font-black text-amber-600 tracking-tight mt-1">{inactiveCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Alertas</span>
          <span className="text-3xl font-black text-red-600 tracking-tight mt-1">{alertCount}</span>
        </div>
      </div>

      {/* Filters search row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full sm:max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-600 transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all outline-none">
            <Filter className="w-3.5 h-3.5" />
            Filtrar
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-[#00288e] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-none">
            <Plus className="w-3.5 h-3.5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* User listing rows (Structured list mapping to mockup) */}
      <div className="space-y-3">
        {/* Table Head Legend (Desktop only) */}
        <div className="hidden md:grid grid-cols-12 px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
          <div className="col-span-5">Usuario</div>
          <div className="col-span-3">Rol Actual</div>
          <div className="col-span-2">Acceso Inmediato</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* User items map list */}
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            // Role colors mapping
            let roleBadgeClass = 'bg-blue-50 text-[#00288e] border-blue-100';
            if (user.role === 'Super Admin') {
              roleBadgeClass = 'bg-blue-100 bg-indigo-50 border-indigo-100 text-indigo-800 text-[#00288e] font-bold';
            } else if (user.role === 'Jefe Seguridad') {
              roleBadgeClass = 'bg-slate-50 text-slate-800 border-slate-200';
            }

            return (
              <div
                key={user.id}
                className="bg-white border border-gray-100 rounded-xl hover:shadow-xs transition-all p-4 md:p-3 flex flex-col md:grid md:grid-cols-12 items-center gap-4 md:gap-0"
              >
                {/* Profile card metadata column */}
                <div className="w-full md:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-gray-250/50 flex-shrink-0">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-full h-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 text-[#00288e] flex items-center justify-center font-bold text-sm">
                        {user.name.split(' ').map(token => token[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-gray-900 block truncate">{user.name}</span>
                    <span className="text-[10px] text-gray-500 font-semibold block flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400 inline" />
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Role badge representation column */}
                <div className="w-full md:col-span-3 flex items-center">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border uppercase ${roleBadgeClass}`}>
                    {user.role}
                  </span>
                </div>

                {/* Toggle switch controls representing active permission */}
                <div className="w-full md:col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => onToggleUserActive(user.id)}
                    className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200 bg-none"
                    style={{ backgroundColor: user.active ? '#1e40af' : '#d1d5db' }}
                  >
                    <span
                      className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                      style={{ transform: user.active ? 'translateX(16px)' : 'translateX(0px)' }}
                    />
                  </button>
                  <span className={`text-[10px] font-black ${user.active ? 'text-gray-500' : 'text-red-600 font-extrabold'}`}>
                    {user.active ? 'Activo' : 'Inhabilitado'}
                  </span>
                </div>

                {/* Edit inline button column */}
                <div className="w-full md:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleEditRoleClick(user)}
                    className="text-[#00288e] hover:underline text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5 inline text-[#00288e]" />
                    Editar Rol
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white border rounded-xl text-gray-400">
            No se encontraron usuarios que coincidan con su búsqueda.
          </div>
        )}
      </div>

      {/* Standard descriptions context section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5 shadow-xs">
          <h3 className="text-[10px] font-extrabold text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00288e]" />
            Jerarquía de Seguridad
          </h3>
          <p className="text-[11px] text-blue-900/80 leading-relaxed">
            Los roles Super Admin y Jefe Seguridad disponen de credenciales exclusivas para la anulación total en situaciones críticas de emergencia.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5 shadow-xs">
          <h3 className="text-[10px] font-extrabold text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
            👥 Auditoría Inmediata
          </h3>
          <p className="text-[11px] text-blue-900/80 leading-relaxed">
            Cada cambio de rol, designación o inhabilitación de acceso es registrado automáticamente con marca de tiempo cronológica y ID de administrador.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5 shadow-xs">
          <h3 className="text-[10px] font-extrabold text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
            ⚡ Inactivación Express
          </h3>
          <p className="text-[11px] text-blue-900/80 leading-relaxed">
            Los interruptores de acceso invalidan inmediatamente todas las sesiones activas y credenciales JWT asociadas de forma instantánea.
          </p>
        </div>
      </section>

      {/* Editing Dialog Modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Editar Rol de Usuario</h3>
              <p className="text-xs text-gray-500 mt-1">Usuario: <b className="text-gray-800 font-bold">{editingUser.name}</b></p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Elige un nuevo Rol de credenciales:</label>
              <select
                value={selectedRoleOption}
                onChange={(e) => setSelectedRoleOption(e.target.value as UserRole)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 block cursor-pointer font-bold text-slate-800"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 hover:bg-gray-50 cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRole}
                className="py-3 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer active:scale-95"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
