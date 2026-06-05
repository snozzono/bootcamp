import { useState } from 'react';
import { ParkingSlot, ParkingStatus, ParkingSector } from '../types';
import { Search, Filter, Layers, CheckCircle2, RotateCcw, AlertOctagon, HelpCircle } from 'lucide-react';

interface StaffGridOccupancyProps {
  slots: ParkingSlot[];
  onUpdateSlotStatus: (slotId: number, status: ParkingStatus) => void;
}

export default function StaffGridOccupancy({
  slots,
  onUpdateSlotStatus
}: StaffGridOccupancyProps) {
  const [searchCode, setSearchCode] = useState('');
  const [sectorFilter, setSectorFilter] = useState<ParkingSector | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<ParkingStatus | 'Todos'>('Todos');
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

  // Dynamic calculations based on state list
  const totalCount = slots.length;
  const freeCount = slots.filter(s => s.status === 'free').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const blockedCount = slots.filter(s => s.status === 'blocked').length;

  const filteredSlots = slots.filter(s => {
    const matchesSearch = s.code.toLowerCase().includes(searchCode.trim().toLowerCase());
    const matchesSector = sectorFilter === 'Todos' || s.sector === sectorFilter;
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const handleSlotClick = (slot: ParkingSlot) => {
    setEditingSlot(slot);
  };

  const updateStatus = (status: ParkingStatus) => {
    if (editingSlot) {
      onUpdateSlotStatus(editingSlot.id, status);
      setEditingSlot(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 md:px-8 pb-24 bg-gray-50 min-h-screen">
      {/* Top statistics overview panels */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total Plazas</span>
          <span className="text-3xl font-black text-[#00288e] mt-1 block tracking-tight">{totalCount}</span>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-4 border-t-emerald-500 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Libres</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block tracking-tight">{freeCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-4 border-t-red-500 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Ocupados</span>
          <span className="text-3xl font-black text-red-600 mt-1 block tracking-tight">{occupiedCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-4 border-t-slate-400 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Inhabilitados</span>
          <span className="text-3xl font-black text-slate-500 mt-1 block tracking-tight">{blockedCount}</span>
        </div>
      </section>

      {/* Advanced search and filter controls bar */}
      <section className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200/80 shadow-3xs">
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Buscar número o código de plaza (ej: A-45)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs outline-none transition-all placeholder-gray-400"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {/* Sector Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs">
            <Layers className="w-3.5 h-3.5 text-gray-450" />
            <span className="text-gray-500 font-medium">Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value as ParkingSector | 'Todos')}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Techado">Techado</option>
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-450" />
            <span className="text-gray-500 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ParkingStatus | 'Todos')}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="free">Libre</option>
              <option value="occupied">Ocupado</option>
              <option value="blocked">Inhabilitado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Grid Representation */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-3xs">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Mapa de Ocupación</h3>
          <p className="text-[10px] bg-blue-50 text-[#00288e] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
            Mostrando {filteredSlots.length} de {totalCount} Plazas
          </p>
        </div>

        {filteredSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredSlots.map((slot) => {
              // Color variables
              let badgeColor = 'bg-emerald-500';
              let actionText = 'libre';
              if (slot.status === 'occupied') {
                badgeColor = 'bg-red-500';
                actionText = 'ocupado';
              } else if (slot.status === 'blocked') {
                badgeColor = 'bg-gray-450';
                actionText = 'bloqueado';
              }

              return (
                <div
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className="flex flex-col items-center justify-center border border-gray-150 hover:border-[#00288e] bg-white rounded-xl overflow-hidden transition-all duration-150 cursor-pointer p-0 group relative overflow-hidden active:scale-95 hover:shadow-sm"
                >
                  <div className={`w-full h-1.5 ${badgeColor}`}></div>
                  <div className="p-3.5 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-[#00288e] transition-colors leading-none tracking-widest mt-0.5">
                      {slot.code}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-gray-400 mt-2 tracking-wider font-mono">
                      {actionText}
                    </span>
                  </div>
                  {/* Subtle hover icon prompt indicator */}
                  <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-blue-500 font-bold">✎</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto stroke-1 mb-2" />
            <p className="text-sm font-semibold">No se encontraron plazas con los criterios aplicados.</p>
          </div>
        )}
      </section>

      {/* Editing State Modal Overlay drawer */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Gestionar Plaza: <span className="text-[#00288e] font-extrabold">{editingSlot.code}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ubicación: Sector {editingSlot.sector} • Piso {editingSlot.floor} • Tipo {editingSlot.type.toUpperCase()}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => updateStatus('free')}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                Marcar como Disponible / Libre
              </button>

              <button
                onClick={() => updateStatus('occupied')}
                className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                Marcar como Ocupado
              </button>

              <button
                onClick={() => updateStatus('blocked')}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                Marcar como Inhabilitado / Bloqueado
              </button>
            </div>

            <button
              onClick={() => setEditingSlot(null)}
              className="text-slate-500 hover:text-slate-800 border-none bg-transparent hover:underline text-xs font-semibold"
            >
              Cerrar sin guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
