import { useState, ChangeEvent, MouseEvent, FormEvent } from 'react';
import { IncidentReport } from '../types';
import { Camera, Send, CheckCircle, Trash2, Shield, HelpCircle, Construction, FlameKindling, Info } from 'lucide-react';

interface DriverReportIncidentProps {
  onAddIncident: (type: string, description: string, imageSrc?: string) => void;
}

export default function DriverReportIncident({
  onAddIncident
}: DriverReportIncidentProps) {
  const [selectedType, setSelectedType] = useState('Vehículo mal estacionado');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const incidentTypes = [
    { name: 'Vehículo mal estacionado', icon: '🚗' },
    { name: 'Obstrucción de paso', icon: '⛔' },
    { name: 'Falla de infraestructura', icon: '🛠️' },
    { name: 'Otro problema', icon: '❓' }
  ];

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateCameraClick = () => {
    // If they want to test quickly, seed an instant high quality mock asset
    setImagePreview('https://images.unsplash.com/photo-1506521788701-1e13a7007a2a?w=400&auto=format&fit=crop&q=80');
  };

  const handleRemovePhoto = (e: MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onAddIncident(selectedType, description, imagePreview || undefined);
    
    // Show success acknowledge
    setShowSuccessOverlay(true);
  };

  const handleClose = () => {
    setShowSuccessOverlay(false);
    setDescription('');
    setImagePreview(null);
    setSelectedType('Vehículo mal estacionado');
  };

  return (
    <div className="max-w-md mx-auto py-4 px-4 bg-gray-50 min-h-screen pb-24 relative">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reportar Incidencia</h2>
          <p className="text-xs text-gray-500">Notifica a la guardia sobre problemas en tu sector para una resolución rápida.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type Select Grid */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">TIPO DE INCIDENCIA</label>
            <div className="grid grid-cols-2 gap-2">
              {incidentTypes.map((typeObj) => {
                const isActive = selectedType === typeObj.name;
                return (
                  <button
                    key={typeObj.name}
                    type="button"
                    onClick={() => setSelectedType(typeObj.name)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-50 border-[#00288e] text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{typeObj.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{typeObj.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Detail Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block" htmlFor="inc-desc">
              DESCRIPCIÓN DETALLADA
            </label>
            <textarea
              id="inc-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente lo ocurrido (ej: patente del auto, nro de columna, etc.)"
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs text-sm text-gray-800 placeholder-gray-400"
              required
            ></textarea>
          </div>

          {/* Picture Dropzone Attachment */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ADJUNTAR FOTO</label>
            
            <div 
              onClick={simulateCameraClick}
              className="relative border-2 border-dashed border-gray-200 hover:border-blue-600 hover:bg-blue-50/50 bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-xs group min-h-[140px]"
            >
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-photo-input"
              />

              {imagePreview ? (
                /* Interactive Preview display */
                <div className="absolute inset-0 rounded-2xl overflow-hidden z-10">
                  <img 
                    src={imagePreview} 
                    alt="Upload Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg active:scale-90 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Unassigned indicator placeholder */
                <>
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#00288e] transition-colors" />
                  <span className="text-xs font-bold text-gray-800">
                    Toca para capturar simulado o subir imagen
                  </span>
                  <span className="text-[10px] text-gray-400">
                    (Click para simular captura de cámara en Sede)
                  </span>
                </>
              )}
            </div>
            
            {/* Quick action button file uploader trigger */}
            {!imagePreview && (
              <div className="text-right">
                <label 
                  htmlFor="file-photo-input"
                  className="text-xs text-blue-800 hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
                >
                  Subir archivo local
                </label>
              </div>
            )}
          </div>

          {/* Submit Trigger Actions */}
          <button
            type="submit"
            className="w-full py-4 bg-[#00288e] hover:bg-blue-800 text-white font-bold rounded-xl text-sm leading-none transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Reporte a la Guardia
          </button>
        </form>
      </div>

      {/* Success Modal popup */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Acuse de Recibo</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                La guardia de <b className="text-gray-800">Sede Maipú</b> ha sido notificada exitosamente. Un personal de seguridad en turno revisará tu reporte a la brevedad.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 border border-blue-600 hover:bg-blue-50 text-[#00288e] rounded-full text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
