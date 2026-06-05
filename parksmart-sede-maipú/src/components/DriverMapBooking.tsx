import { useState, useEffect } from 'react';
import { ParkingSlot, Reservation } from '../types';
import { Search, MapPin, Eye, Info, Clock, CheckCircle2, ChevronRight, Share2, Compass } from 'lucide-react';

interface DriverMapBookingProps {
  slots: ParkingSlot[];
  onReserve: (slotId: number, plate: string) => void;
  activeReservation: Reservation | null;
}

export default function DriverMapBooking({
  slots,
  onReserve,
  activeReservation
}: DriverMapBookingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'norte' | 'ev' | 'preferential'>('all');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [plateInput, setPlateInput] = useState('ABCD-12');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  // Filter slots for presentation
  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          slot.sector.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'norte') return slot.sector === 'Norte';
    if (selectedFilter === 'ev') return slot.type === 'ev';
    if (selectedFilter === 'preferential') return slot.type === 'preferential';
    return true;
  });

  // Calculate generic statistics
  const freeCount = slots.filter(s => s.status === 'free').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;

  // Active Timer effects
  useEffect(() => {
    if (!activeReservation) return;
    
    // Calculate difference between now and expiresAt
    const expirationTime = new Date(activeReservation.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, Math.floor((expirationTime - now) / 1000));
      setTimeLeft(difference);
      
      if (difference <= 0) {
        clearInterval(interval);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeReservation]);

  const handleSelectSlot = (code: string) => {
    const found = slots.find(s => s.code === code);
    if (found) {
      setSelectedSlot(found);
    }
  };

  const handleBook = () => {
    if (!selectedSlot) return;
    onReserve(selectedSlot.id, plateInput);
    setShowSuccessModal(true);
  };

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    if (secs <= 0) return "EXPIRADO";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-md mx-auto py-4 px-4 bg-gray-50 min-h-screen pb-24">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">¿Dónde quieres estacionar?</h2>
        
        {/* Search Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar sector (Ej: Edificio A, Casino)"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs text-sm"
          />
        </div>

        {/* Quick Filter Bubbles */}
        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedFilter('norte')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'norte'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-50'
            }`}
          >
            Sector Norte
          </button>
          <button
            onClick={() => setSelectedFilter('ev')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'ev'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-50'
            }`}
          >
            🔌 Carga Eléctrica
          </button>
          <button
            onClick={() => setSelectedFilter('preferential')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'preferential'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-150 hover:bg-gray-50'
            }`}
          >
            ♿ Preferencial
          </button>
        </div>
      </div>

      {/* Stylized Active Map Representation */}
      <section className="relative bg-blue-900/10 rounded-2xl overflow-hidden aspect-[4/3] border border-gray-200 shadow-xs flex flex-col justify-between">
        {/* Simulated blueprint background */}
        <div className="absolute inset-0 z-0 bg-slate-900 pointer-events-none opacity-95">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Stylized vector representation of the parking lanes */}
          <div className="absolute left-[10%] top-[20%] w-[15%] h-[60%] border-r-2 border-dashed border-blue-500/40 border-l border-blue-500/20 flex flex-col justify-around px-2 text-[8px] text-gray-400 font-mono">
            <div>[ LANE A ]</div>
            <div>[ LANE B ]</div>
          </div>
          <div className="absolute right-[10%] top-[20%] w-[15%] h-[60%] border-l-2 border-dashed border-blue-500/40 border-r border-blue-500/20 flex flex-col justify-around px-2 text-[8px] text-gray-400 font-mono">
            <div>[ LANE C ]</div>
            <div>[ LANE D ]</div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-28 border border-white/5 rounded-xl bg-white/2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Edificio Central</span>
            <span className="text-[8px] text-gray-600">Entrada Norte 150m</span>
          </div>
        </div>

        {/* Floating Labels and Markers */}
        <div className="absolute inset-0 z-10">
          {/* EV Spots marker (A-04 / EV-04) */}
          <button
            onClick={() => handleSelectSlot('EV-04')}
            className={`absolute top-[25%] left-[20%] group transition-all transform ${
              selectedSlot?.code === 'EV-04' ? 'scale-115' : 'hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full shadow-lg border-2 border-white transition-colors ${
                slots.find(s => s.code === 'EV-04')?.status === 'occupied' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-emerald-500 text-white animate-pulse'
              }`}>
                <span className="block text-xs font-bold leading-none font-sans">⚡</span>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded border border-gray-200 text-[9px] font-bold shadow-xs text-gray-800">
                EV-04
              </div>
            </div>
          </button>

          {/* Preferential Marker (PR-12) */}
          <button
            onClick={() => handleSelectSlot('PR-12')}
            className={`absolute bottom-[25%] right-[25%] group transition-all transform ${
              selectedSlot?.code === 'PR-12' ? 'scale-115' : 'hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full shadow-lg border-2 border-white transition-colors ${
                slots.find(s => s.code === 'PR-12')?.status === 'occupied' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                <span className="block text-xs font-bold leading-none font-sans">♿</span>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded border border-gray-200 text-[9px] font-bold shadow-xs text-gray-800">
                PR-12
              </div>
            </div>
          </button>

          {/* Regular standard spot (A-45) */}
          <button
            onClick={() => handleSelectSlot('A-45')}
            className={`absolute top-[48%] left-[70%] group transition-all transform ${
              selectedSlot?.code === 'A-45' ? 'scale-115' : 'hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full shadow-lg border-2 transition-colors ${
                slots.find(s => s.code === 'A-45')?.status === 'occupied' 
                  ? 'bg-red-500 text-white border-white' 
                  : 'bg-white text-blue-900 border-[#00288e]'
              }`}>
                <span className="block text-xs font-bold leading-none font-sans">P</span>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded border border-gray-200 text-[9px] font-bold shadow-xs text-gray-800">
                A-45
              </div>
            </div>
          </button>
        </div>

        {/* Map Status Badge Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl flex justify-between items-center z-20 border border-gray-200/50 shadow-sm text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{freeCount} Libres</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>{occupiedCount} Ocupados</span>
          </div>
        </div>
      </section>

      {/* Lista de plazas filtradas */}
      {filteredSlots.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">
            {filteredSlots.filter(s => s.status === 'free').length} libres de {filteredSlots.length} plazas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {filteredSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => slot.status !== 'blocked' ? setSelectedSlot(slot) : undefined}
                disabled={slot.status === 'blocked'}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedSlot?.id === slot.id
                    ? 'border-[#00288e] bg-blue-50 shadow-sm'
                    : slot.status === 'free'
                    ? 'border-gray-200 bg-white hover:border-[#00288e] hover:shadow-sm'
                    : slot.status === 'occupied'
                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className={`block w-2 h-2 rounded-full mb-1.5 ${
                  slot.status === 'free' ? 'bg-emerald-500' : slot.status === 'occupied' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <span className="block text-xs font-bold text-gray-800 truncate">{slot.code}</span>
                <span className="block text-[9px] text-gray-400 font-medium">{slot.sector}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Selected Spot Details & Booking Panel */}
      <section className="transition-all duration-300">
        {selectedSlot ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md tracking-wider">
                  {selectedSlot.type === 'ev' ? '🔌 Carga Eléctrica' : selectedSlot.type === 'preferential' ? '♿ Preferencial' : '🚘 Estándar'}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedSlot.code}</h3>
                <p className="text-xs text-gray-500">{selectedSlot.sector} • Piso {selectedSlot.floor} • Sec. Techado</p>
              </div>

              <div>
                {selectedSlot.status === 'free' ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block">
                    Disponible
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block">
                    Ocupado
                  </span>
                )}
              </div>
            </div>

            {/* Simulated spot stats */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-center">
              <div className="border-r border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Distancia</span>
                <span className="text-sm font-bold text-gray-800">2 min a pie</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Límite Reserva</span>
                <span className="text-sm font-bold text-red-600 block">15 minutos</span>
              </div>
            </div>

            {/* Plate inputs */}
            {selectedSlot.status === 'free' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Patente asociada para la reserva:</label>
                <input
                  type="text"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  className="w-full text-center tracking-widest text-lg font-bold py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 block uppercase"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://waze.com/ul?q=Av.+Pajaritos+2100+Maipu`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-700 transition-all active:scale-95 shadow-2xs"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                Abrir en Waze
              </a>

              {selectedSlot.status === 'free' ? (
                <button
                  onClick={handleBook}
                  className="flex items-center justify-center gap-2 py-3 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm"
                >
                  Reservar Ahora
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-450 rounded-xl font-bold text-xs cursor-not-allowed"
                >
                  No Disponible
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Helper indicator if no spot selected */
          <div className="text-center py-6 bg-blue-50/50 border border-dashed border-blue-200/80 rounded-2xl">
            <p className="text-blue-900/70 text-xs font-medium">✨ Selecciona una plaza de la lista o toca un marcador en el mapa para ver sus detalles y reservar.</p>
          </div>
        )}
      </section>

      {/* Persistent Active Reservation Indicator Banner at the bottom */}
      {activeReservation && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex justify-between items-center shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-sky-900">Reserva Activa: ({activeReservation.slotCode})</span>
            </div>
            <p className="text-[10px] text-sky-700 font-medium">Asociada a la Patente: <b className="font-bold">{activeReservation.plate}</b></p>
          </div>
          <div className="bg-sky-200/60 text-sky-950 px-3 py-1.5 rounded-lg font-mono font-bold text-sm tracking-wide shadow-2xs">
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* Success Reservation modal dialog overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">¡Reserva Exitosa!</h3>
              <p className="text-xs text-gray-500 px-4">
                El espacio <b className="text-gray-800 font-bold">{selectedSlot?.code}</b> ha quedado reservado para tu patente <b className="text-gray-800 font-bold">{plateInput}</b> por 15 minutos.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-100">
              <Clock className="w-4 h-4 text-slate-500 animate-pulse" />
              <span className="text-xl font-mono font-extrabold text-[#00288e]" id="countdown">15:00</span>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className="w-full py-3.5 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
