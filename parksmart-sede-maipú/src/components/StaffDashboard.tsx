import { useState } from 'react';
import { ParkingSlot, IncidentReport } from '../types';
import { RefreshCw, CheckCircle, ArrowUpRight, Compass, Shield, Wifi, BellRing, Settings, CircleAlert, Check } from 'lucide-react';

interface StaffDashboardProps {
  slots: ParkingSlot[];
  incidents: IncidentReport[];
  onResolveIncident: (incidentId: string) => void;
  onRefresh: () => void;
}

export default function StaffDashboard({
  slots,
  incidents,
  onResolveIncident,
  onRefresh
}: StaffDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic values calculated directly from active slot states!
  const totalSlots = slots.length;
  const freeSlots = slots.filter(s => s.status === 'free').length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const blockedSlots = slots.filter(s => s.status === 'blocked').length;

  const occupancyRatio = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  const evFree = slots.filter(s => s.type === 'ev' && s.status === 'free').length;
  const preferentialFree = slots.filter(s => s.type === 'preferential' && s.status === 'free').length;

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Determine flow message
  let flowText = "Actualmente hay un flujo moderado de vehículos.";
  if (occupancyRatio < 35) {
    flowText = "Tránsito fluido. Gran disponibilidad de plazas vacantes.";
  } else if (occupancyRatio > 80) {
    flowText = "Alta congestión de estacionamiento. Se recomienda priorizar reservas online.";
  }

  // Micro grid for visualization (A subset of slots P1 to P48)
  const previewSlots = slots.slice(0, 48);

  const activeIncidents = incidents.filter(i => i.status === 'Pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 md:px-8 pb-24 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-3xl font-black text-[#0d1c2d] tracking-tight">Sede Maipú - Estado en Vivo</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-xs font-semibold text-gray-500">Última medición: Actualizado en tiempo real</p>
          </div>
        </div>
        
        {/* Active Emergency / Incident alerts toast inline */}
        {activeIncidents.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs md:block">
            <div className="flex items-center gap-2">
              <CircleAlert className="w-4 h-4 text-red-600" />
              <span>Hay {activeIncidents.length} reportes de incidencias activos!</span>
            </div>
          </div>
        )}
      </section>

      {/* Main Dashboard Bento-style Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dial Occupancy Card (Primary Focus) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xs group">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#00288e] text-white rounded-full hover:bg-blue-800 transition-all active:scale-95 shadow-sm text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mt-6">
            {/* SVG Circle Dial */}
            <svg className="w-56 h-56 md:w-64 md:h-64 transform -rotate-90">
              <circle
                className="text-gray-100"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="42%"
                stroke="currentColor"
                strokeWidth="16"
              />
              <circle
                className="text-[#00288e] transition-all duration-1000 ease-in-out"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="42%"
                stroke="currentColor"
                strokeDasharray="527" // Approximately 2 * PI * (64*2*0.42)
                strokeDashoffset={527 - (527 * occupancyRatio) / 100}
                strokeLinecap="round"
                strokeWidth="16"
              />
            </svg>
            
            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-extrabold text-[#00288e] tracking-tight">{occupancyRatio}%</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ocupación</span>
            </div>
          </div>

          <p className="mt-6 text-sm font-semibold text-gray-600 text-center max-w-xs">
            {flowText}
          </p>
        </div>

        {/* Detailed Status Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Availability Big Card (Green background) */}
          <div className="flex-1 bg-[#6bff8f] p-6 lg:p-8 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-[#006e2f]/10 rounded-full flex items-center justify-center text-[#006e2f]">
                <CheckCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[9px] bg-[#006e2f]/10 text-[#007432] border border-[#006e2f]/20 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                Vía Segura
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-[#007432] text-xs font-bold uppercase tracking-widest">Espacios Disponibles</h3>
              <p className="text-5xl md:text-6xl font-black text-[#007432] mt-1 tracking-tight">{freeSlots}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#007432]/20">
              <p className="text-xs font-bold text-[#007432]/80">De un total de {totalSlots} estacionamientos</p>
            </div>
          </div>

          {/* Auxiliary Info (Bento Style Sub-row) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col justify-between shadow-xs">
              <span className="text-lg">🔌</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Carga EV</h4>
                <p className="text-2xl font-black text-blue-900 mt-1">{evFree} Libres</p>
              </div>
            </div>
            
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-105 flex flex-col justify-between shadow-xs">
              <span className="text-lg">♿</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-indigo-650 tracking-wider">Preferencial</h4>
                <p className="text-2xl font-black text-indigo-900 mt-1">{preferentialFree} Libres</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver-Reported Active Incident Feed Log */}
      {activeIncidents.length > 0 && (
        <section className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-350">
          <div className="flex items-center gap-2 text-red-700">
            <BellRing className="w-5 h-5 text-red-600 animate-pulse" />
            <h3 className="text-base font-bold">Incidencias Recibidas (Sin Resolver)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="bg-red-50/50 rounded-xl p-4 border border-red-100 flex flex-col justify-between gap-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wide">
                      {incident.type}
                    </span>
                    <p className="text-slate-800 font-semibold mt-1.5">{incident.description}</p>
                    {incident.slotCode && (
                      <p className="text-slate-500 text-[10px] mt-1 font-bold">Ubicación Slot: {incident.slotCode}</p>
                    )}
                  </div>
                  {incident.imageUrl && (
                    <img 
                      src={incident.imageUrl} 
                      alt="Incident reference" 
                      className="w-12 h-12 rounded object-cover border border-red-200/50"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="flex justify-between items-center text-[10px] border-t border-red-100/60 pt-2 text-slate-500">
                  <span>Reportado por: {incident.userEmail}</span>
                  <button
                    onClick={() => onResolveIncident(incident.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3 h-3" /> Resuelto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Real-time Grid Visualizer (P1 - P48 Mini layout matching mockup 1) */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Mapa de Disponibilidad (P1 - P48)</h3>
            <p className="text-xs text-gray-500">Vista rápida esquemática para control de barreras de acceso inmediato</p>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span>
              <span className="text-gray-500 text-[11px]">Libre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-gray-300 rounded-xs"></span>
              <span className="text-gray-500 text-[11px]">Ocupado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-400 rounded-xs"></span>
              <span className="text-gray-500 text-[11px]">Inhabilitado</span>
            </div>
          </div>
        </div>

        {/* Responsive Parking Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5">
          {previewSlots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const isBlocked = slot.status === 'blocked';
            return (
              <div
                key={slot.id}
                className={`h-9 border text-[10px] font-bold rounded flex items-center justify-center transition-all shadow-xs ${
                  isOccupied
                    ? 'bg-gray-200 border-gray-300 text-gray-500'
                    : isBlocked
                    ? 'bg-slate-400 border-slate-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 cursor-pointer'
                }`}
              >
                P{slot.id}
              </div>
            );
          })}
        </div>
      </section>

      {/* Location Context Card and General Notes */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden flex flex-col sm:flex-row h-full shadow-xs">
          <div className="w-full sm:w-1/3 bg-slate-100 relative min-h-[140px] border-r border-gray-100">
            <img
              alt="Maipú Facility Map"
              className="w-full h-full object-cover grayscale opacity-85"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#00288e]/5"></div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-3">
            <h4 className="text-[#00288e] text-base font-bold">Ubicación Maipú</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Av. Pajaritos 2100, Maipú. El acceso de control secundario rápido se encuentra por la entrada lateral Norte.
            </p>
            <a
              href="https://waze.com/ul?q=Av.+Pajaritos+2100+Maipu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#00288e] font-bold text-[10px] uppercase tracking-wider hover:underline"
            >
              🚀 Abrir en Waze / Waze Link
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-[#1e40af] p-6 text-white rounded-2xl flex flex-col justify-center border border-blue-800 shadow-xs space-y-4">
          <h4 className="text-base font-bold tracking-tight">Aviso de Servicio del Sistema</h4>
          <p className="text-xs text-blue-100 leading-relaxed">
            Se recomienda a todo el personal de guardias guiar la descarga de la app oficial para reservas de accesos prioritarios o pagos de tarifas automáticas de inmediato.
          </p>
          <div className="flex gap-3">
            <button className="bg-white text-blue-900 border border-transparent font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-xs hover:bg-gray-150 transition-colors">
              Descargar App
            </button>
          </div>
        </div>
      </section>

      {/* Footer System Status Bar Indicator */}
      <footer className="pt-4 border-t border-gray-200/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <Wifi className="w-4 h-4" />
            <span>Sistema Conectado (Sede Central)</span>
          </div>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline font-medium">Actualización manual con el botón "Actualizar"</span>
        </div>
        <div className="font-semibold text-slate-500">
          © 2026 ParkSmart Global S.A.
        </div>
      </footer>
    </div>
  );
}
