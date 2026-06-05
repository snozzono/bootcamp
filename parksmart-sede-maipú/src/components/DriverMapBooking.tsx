import { useState, useEffect } from 'react';
import type { ParkingSlot, ParkingSector, SlotType, Reservation } from '../types';
import type { ApiUsuario, RecomendacionResult } from '../api';
import { fetchRecomendacion } from '../api';
import { Search, ChevronRight, CheckCircle2, Clock, Sparkles, X, AlertCircle } from 'lucide-react';

interface Props {
  slots: ParkingSlot[];
  currentUser: ApiUsuario;
  onReserve: (slotId: number, plate: string) => void;
  activeReservation: Reservation | null;
  onCancelReservation: () => void;
}

function formatTime(secs: number) {
  if (secs <= 0) return 'EXPIRADO';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SECTOR_LABEL: Record<ParkingSector | 'Todos', string> = {
  Todos: 'Sector',
  Norte: 'Norte',
  Sur: 'Sur',
  Techado: 'Techado',
};

const TYPE_LABEL: Record<SlotType | 'Todos', string> = {
  Todos: 'Tipo',
  standard: 'Estándar',
  ev: 'Carga EV',
  preferential: 'Preferencial',
};

const TYPE_ICON: Record<SlotType, string> = {
  standard: '',
  ev: '⚡',
  preferential: '♿',
};

export default function DriverMapBooking({ slots, currentUser, onReserve, activeReservation, onCancelReservation }: Props) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<ParkingSector | 'Todos'>('Todos');
  const [typeFilter, setTypeFilter] = useState<SlotType | 'Todos'>('Todos');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [plateInput, setPlateInput] = useState(currentUser.patente_asociada ?? '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RecomendacionResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeReservation) return;
    const expiry = new Date(activeReservation.expiresAt).getTime();
    const tick = () => setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeReservation]);

  const handleAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const result = await fetchRecomendacion(currentUser.id);
      setAiResult(result);
      const slot = slots.find(s => s.id === result.slotId);
      if (slot) setSelectedSlot(slot);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleBook = () => {
    if (!selectedSlot || !plateInput.trim()) return;
    onReserve(selectedSlot.id, plateInput.trim());
    setSelectedSlot(null);
  };

  const freeCount = slots.filter(s => s.status === 'free').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;

  const filtered = slots.filter(s => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (sectorFilter !== 'Todos' && s.sector !== sectorFilter) return false;
    if (typeFilter !== 'Todos' && s.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => {
    const order = { free: 0, occupied: 1, blocked: 2 };
    return order[a.status] - order[b.status];
  });

  // ── Active reservation takeover ─────────────────────────────────
  if (activeReservation && !arrivalConfirmed) {
    const slot = slots.find(s => s.id === activeReservation.slotId);
    return (
      <div className="max-w-sm mx-auto py-8 px-4 pb-24 flex flex-col items-center gap-6 min-h-[70vh] justify-center">
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 text-center">
          <div className="w-14 h-14 bg-[#00288e] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <span className="text-white text-2xl font-black">P</span>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Plaza Reservada</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{activeReservation.slotCode}</h2>
            {slot && (
              <p className="text-sm text-gray-500 mt-1">
                Sector {slot.sector} · {slot.type === 'ev' ? 'Carga EV ⚡' : slot.type === 'preferential' ? 'Preferencial ♿' : 'Estándar'}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-mono font-black text-2xl text-[#00288e]">{formatTime(timeLeft)}</span>
            <span className="text-xs text-slate-500 font-medium">restante</span>
          </div>

          <div className="text-left bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Patente</p>
            <p className="text-sm font-bold text-gray-800">{activeReservation.plate}</p>
          </div>

          <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            Dirígete a tu plaza. Confirma llegada cuando ya estés estacionado.
          </p>

          <button
            onClick={() => setArrivalConfirmed(true)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar llegada
          </button>

          <button
            onClick={onCancelReservation}
            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl font-semibold text-xs transition-all cursor-pointer"
          >
            Cancelar reserva
          </button>
        </div>
      </div>
    );
  }

  // ── Arrival confirmed success screen ────────────────────────────
  if (arrivalConfirmed) {
    return (
      <div className="max-w-sm mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[70vh] gap-5">
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900">¡Llegada confirmada!</h2>
          <p className="text-sm text-gray-500">Tu estacionamiento ha quedado registrado. Buen día.</p>
          <button
            onClick={() => { setArrivalConfirmed(false); onCancelReservation(); }}
            className="w-full py-3 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Main booking list view ──────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto py-5 px-4 pb-24 space-y-4 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Busca tu plaza</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="text-emerald-600 font-bold">{freeCount} libres</span>
            {' · '}
            <span className="text-red-500 font-bold">{occupiedCount} ocupadas</span>
          </p>
        </div>
      </div>

      {/* AI Recommendation button */}
      <button
        onClick={handleAI}
        disabled={aiLoading || freeCount === 0}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-[#00288e] to-blue-600 hover:from-[#001d6e] hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        {aiLoading ? 'Consultando IA...' : 'Recomendar plaza con IA'}
      </button>

      {aiError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {aiError}
        </div>
      )}

      {aiResult && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-yellow-800">
              IA recomienda: <span className="text-[#00288e]">{aiResult.codigo}</span>
              {aiResult.source === 'ai' && <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Gemini</span>}
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">{aiResult.razon}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar código..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
          />
        </div>
        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value as ParkingSector | 'Todos')}
          className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
        >
          <option value="Todos">Sector</option>
          <option value="Norte">Norte</option>
          <option value="Techado">Techado</option>
          <option value="Sur">Sur</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as SlotType | 'Todos')}
          className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
        >
          <option value="Todos">Tipo</option>
          <option value="standard">Estándar</option>
          <option value="ev">⚡ EV</option>
          <option value="preferential">♿ Preferencial</option>
        </select>
      </div>

      {/* Slot list */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
          {filtered.filter(s => s.status === 'free').length} libres · {filtered.length} total
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No se encontraron plazas.</div>
        ) : (
          filtered.map(slot => {
            const isFree = slot.status === 'free';
            const isSelected = selectedSlot?.id === slot.id;
            const isAI = aiResult?.slotId === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => isFree ? setSelectedSlot(slot) : undefined}
                disabled={!isFree}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#00288e] bg-blue-50 shadow-sm'
                    : isAI && isFree
                    ? 'border-yellow-300 bg-yellow-50 shadow-sm'
                    : isFree
                    ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
                    : 'border-gray-100 bg-white opacity-50 cursor-not-allowed'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  slot.status === 'free' ? 'bg-emerald-500' :
                  slot.status === 'occupied' ? 'bg-red-400' : 'bg-gray-300'
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{slot.code}</span>
                    {slot.type !== 'standard' && (
                      <span className="text-xs">{TYPE_ICON[slot.type]}</span>
                    )}
                    {isAI && (
                      <span className="text-[9px] bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">IA</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {slot.sector} · {TYPE_LABEL[slot.type]}
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  slot.status === 'free' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  slot.status === 'occupied' ? 'bg-red-50 text-red-600 border border-red-100' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {slot.status === 'free' ? 'Libre' : slot.status === 'occupied' ? 'Ocupado' : 'No disp.'}
                </span>

                {isFree && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {/* Bottom sheet: selected slot confirmation */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setSelectedSlot(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div
            className="relative bg-white rounded-t-2xl p-6 space-y-4 shadow-2xl border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-200 max-w-lg w-full mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#00288e] px-2 py-0.5 rounded">
                    {selectedSlot.sector}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {TYPE_LABEL[selectedSlot.type]}{TYPE_ICON[selectedSlot.type] ? ` ${TYPE_ICON[selectedSlot.type]}` : ''}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedSlot.code}</h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Patente del vehículo</label>
              <input
                type="text"
                value={plateInput}
                onChange={e => setPlateInput(e.target.value.toUpperCase())}
                placeholder="Ej: ABCD-12"
                maxLength={8}
                className="w-full text-center tracking-widest text-xl font-black py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 uppercase transition-all"
              />
            </div>

            <button
              onClick={handleBook}
              disabled={!plateInput.trim()}
              className="w-full py-4 bg-[#00288e] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Reservar plaza {selectedSlot.code}
            </button>

            <p className="text-center text-[10px] text-gray-400">
              La reserva tiene validez de 1 hora. Llegarás a la plaza reservada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
