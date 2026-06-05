import { useState, useEffect } from 'react';
import { ParkingSlot } from '../types';
import { MapPin, Check, Plus, Edit, AlertTriangle, ShieldCheck, CheckSquare, RefreshCw } from 'lucide-react';

interface DriverLocationCheckInProps {
  slots: ParkingSlot[];
  onCheckIn: (slotCode: string, plate: string) => void;
}

export default function DriverLocationCheckIn({
  slots,
  onCheckIn
}: DriverLocationCheckInProps) {
  const [selectedCode, setSelectedCode] = useState('A-45');
  const [plate, setPlate] = useState('ABCD-12');
  const [isChangingCode, setIsChangingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');

  // Setup initial arrival time once on load
  useEffect(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setArrivalTime(`${hours}:${minutes}`);
  }, []);

  // Filter available slots for changing
  const availableSlots = slots.filter(s => s.status === 'free');

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      onCheckIn(selectedCode, plate);
      setIsLoading(false);
      setShowSuccessOverlay(true);
    }, 1200);
  };

  const handleReset = () => {
    setShowSuccessOverlay(false);
    setSelectedCode('A-45');
  };

  return (
    <div className="max-w-md mx-auto py-4 px-4 bg-gray-50 min-h-screen pb-24 relative overflow-hidden">
      {/* Scrollable Container */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Ubicación</h2>
          <p className="text-xs text-gray-500">Confirma los detalles de tu llegada para registrar el estacionamiento.</p>
        </div>

        {/* Top visual reference card (Position map preview) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative min-h-[140px] shadow-xs">
          {/* Mock Map background pattern */}
          <div className="absolute inset-0 bg-slate-100 pointer-events-none opacity-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px] opacity-35"></div>
            {/* Draw a grid road pattern */}
            <div className="w-full h-10 bg-white border-y border-gray-200 flex items-center justify-around font-mono text-[8px] text-gray-400">
              <span>LANE A</span>
              <span>LANE B</span>
            </div>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-200/50 flex items-center gap-2 shadow-xs">
            <span className="bg-[#00288e] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide font-sans">
              POSICIÓN EN VIVO
            </span>
            <span className="text-gray-700 text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00288e]" />
              Sede Maipú - Sector Techado
            </span>
          </div>
        </div>

        {/* Space Selection Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-[#00288e] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Espacio Seleccionado</span>
          </div>

          <div className="flex items-center justify-between">
            {isChangingCode ? (
              <select
                value={selectedCode}
                onChange={(e) => {
                  setSelectedCode(e.target.value);
                  setIsChangingCode(false);
                }}
                className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-base font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
              >
                {/* Seed a helpful subset of slots */}
                {slots.slice(0, 30).map(s => (
                  <option key={s.id} value={s.code}>Slot {s.code} ({s.status === 'free' ? 'Libre' : 'Ocupado'})</option>
                ))}
              </select>
            ) : (
              <span className="text-4xl font-extrabold text-[#00288e] tracking-tight">{selectedCode}</span>
            )}

            <button
              onClick={() => setIsChangingCode(!isChangingCode)}
              className="text-[#00288e] text-xs font-bold underline hover:opacity-80 transition-opacity"
            >
              {isChangingCode ? 'Cancelar' : 'Cambiar'}
            </button>
          </div>

          <p className="text-xs text-gray-500 font-medium">Bajo Techo • Piso 1 • Sede Principal</p>
        </div>

        {/* Arrival Time Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" />
            <span>Hora de Llegada</span>
          </div>

          <div className="text-2xl font-black text-gray-900 tracking-tight">{arrivalTime}</div>
          <p className="text-xs text-gray-500 font-medium">Registrado al momento de confirmar el estacionamiento</p>
        </div>

        {/* Plate Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <label className="flex items-center gap-1.5 text-gray-700 text-xs font-bold uppercase tracking-wider" htmlFor="checkin-plate">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Patente del Vehículo</span>
          </label>
          
          <div className="relative">
            <input
              id="checkin-plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="w-full text-center text-xl font-bold tracking-widest py-3 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl bg-gray-50 outline-none transition-colors uppercase"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Check className="w-5 h-5 text-emerald-500 stroke-[3]" />
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-400 font-medium">Patente aprobada de acuerdo a las políticas de acceso de Sede Maipú</p>
        </div>

        {/* Confirm Trigger Button */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full py-4 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Registrando Estancia...
              </span>
            ) : (
              <>
                Confirmar Estacionamiento
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
          
          <button className="w-full text-center text-xs font-semibold text-gray-500 hover:text-blue-800 underline transition-all">
            ¿Problemas con el espacio asignado? Reportar aquí
          </button>
        </div>
      </div>

      {/* Success Done All Overlay panel */}
      <div 
        className={`fixed inset-0 bg-blue-900 z-110 flex flex-col items-center justify-center text-white px-6 text-center transition-all duration-500 ease-in-out transform ${
          showSuccessOverlay ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-blue-900 shadow-xl animate-bounce">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <h3 className="text-3xl font-extrabold mb-2 tracking-tight">¡Todo Listo!</h3>
        <p className="text-sm tracking-wide opacity-85 max-w-xs leading-relaxed">
          Tu estancia en el slot <b className="font-bold opacity-100 bg-white/20 px-2 py-0.5 rounded text-white">{selectedCode}</b> ha sido confirmada con éxito. Que tengas un excelente día de actividades!
        </p>

        <button
          onClick={handleReset}
          className="mt-12 px-8 py-3 bg-white text-blue-950 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-100 shadow-md transition-all active:scale-95"
        >
          Regresar a Inicio
        </button>
      </div>
    </div>
  );
}
