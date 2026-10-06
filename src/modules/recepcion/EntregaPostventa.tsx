import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord } from '../../types';
import { 
  Award, 
  CheckCircle2, 
  Star, 
  Calendar, 
  Car, 
  Phone, 
  Clock, 
  ShieldCheck, 
  PenTool, 
  MessageCircle,
  FileCheck2,
  Smile
} from 'lucide-react';

export const EntregaPostventa: React.FC = () => {
  const { vehicles, updateVehicle, advanceWorkflowStage, addAuditLog } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSignature, setCheckoutSignature] = useState('');
  
  // Postventa survey modal
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyType, setSurveyType] = useState<'7dias' | '30dias'>('7dias');
  const [surveyRating, setSurveyRating] = useState<number>(5);
  const [surveyComments, setSurveyComments] = useState('');

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Vehicles ready for delivery or in delivery stage
  const readyVehicles = vehicles.filter(v => 
    v.currentWorkflowStage === 'armado_calidad' || 
    v.currentWorkflowStage === 'facturacion_entrega' ||
    v.currentWorkflowStage === 'postventa_cierre'
  );

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    updateVehicle(currentVehicle.id, {
      currentWorkflowStage: 'postventa_cierre',
      fechaEntregaReal: new Date().toISOString().slice(0, 10),
      firmaEntregaConformidad: checkoutSignature || 'Firma digital de entrega conforme por el cliente'
    });

    addAuditLog(
      'Entrega de Vehículo Realizada',
      `Cliente ${currentVehicle.clienteNombre} recibió ${currentVehicle.marca} ${currentVehicle.submarca} (${currentVehicle.placas}) a entera conformidad.`,
      currentVehicle.expediente
    );

    setShowCheckoutModal(false);
    setCheckoutSignature('');
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    if (surveyType === '7dias') {
      updateVehicle(currentVehicle.id, {
        postventa: {
          ...currentVehicle.postventa,
          encuesta7DiasRealizada: true,
          calificacion7Dias: surveyRating,
          comentarios7Dias: surveyComments,
          encuesta30DiasRealizada: currentVehicle.postventa?.encuesta30DiasRealizada || false,
        }
      });
      addAuditLog(
        'Encuesta Postventa 7 Días Registrada',
        `Calificación: ${surveyRating}/5 estrellas. Comentarios: "${surveyComments}"`,
        currentVehicle.expediente
      );
    } else {
      updateVehicle(currentVehicle.id, {
        postventa: {
          ...currentVehicle.postventa,
          encuesta7DiasRealizada: currentVehicle.postventa?.encuesta7DiasRealizada || false,
          encuesta30DiasRealizada: true,
          calificacion30Dias: surveyRating,
          comentarios30Dias: surveyComments,
        }
      });
      addAuditLog(
        'Encuesta Postventa 30 Días (Garantía)',
        `Calificación: ${surveyRating}/5 estrellas. Revisión de brillo y acabados.`,
        currentVehicle.expediente
      );
    }

    setShowSurveyModal(false);
    setSurveyComments('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#91B146]" />
            Entrega de Unidades y Seguimiento Postventa
          </h2>
          <p className="text-xs text-[#939395]">
            Check-out de salida con firma de conformidad, calendario de entregas y encuestas de satisfacción a 7 y 30 días.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Deliveries list */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Unidades en Fase de Entrega / Postventa ({readyVehicles.length})
          </h3>

          <div className="space-y-2.5">
            {readyVehicles.map((v) => {
              const isSelected = currentVehicle?.id === v.id;
              const isDelivered = !!v.fechaEntregaReal;

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-white border-[#91B146] shadow-sm ring-2 ring-[#91B146]/20'
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {v.placas}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDelivered 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isDelivered ? 'Entregado al Cliente' : 'Por Entregar'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {v.marca} {v.submarca} {v.modeloAnio}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cliente: {v.clienteNombre} • Siniestro: {v.siniestro}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Promesa: <strong className="text-slate-700">{v.fechaPromesaEntrega}</strong>
                    </span>
                    {v.fechaEntregaReal && (
                      <span className="text-emerald-700 font-bold">
                        Entregado: {v.fechaEntregaReal}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout & Postventa survey controls */}
        <div className="lg:col-span-7 space-y-4">
          {currentVehicle ? (
            <>
              {/* Unit Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Acta de Entrega • Expediente {currentVehicle.expediente}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentVehicle.marca} {currentVehicle.submarca} ({currentVehicle.placas})
                    </h3>
                  </div>

                  {!currentVehicle.fechaEntregaReal ? (
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="px-4 py-2 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <PenTool className="w-4 h-4" />
                      Firmar Check-out de Entrega
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Entrega Concluida
                    </span>
                  )}
                </div>

                {/* Delivery details */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cliente titular:</span>
                    <span className="font-bold text-slate-900">{currentVehicle.clienteNombre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Aseguradora / Canal:</span>
                    <span className="font-bold text-slate-900">{currentVehicle.procedencia} (Siniestro: {currentVehicle.siniestro})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deducible convenido:</span>
                    <span className="font-bold text-slate-900">
                      ${currentVehicle.deducible.toLocaleString()} MXN ({currentVehicle.deducibleCobrado ? 'Liquidado' : 'Pendiente de cobro'})
                    </span>
                  </div>
                  {currentVehicle.firmaEntregaConformidad && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Firma de conformidad:</span>
                      <span>{currentVehicle.firmaEntregaConformidad}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Postventa & Surveys Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#67A0CD]" />
                  Control de Calidad Postventa y Encuestas de Satisfacción
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* 7 Days Survey */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">Encuesta 7 Días (Satisfacción)</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentVehicle.postventa?.encuesta7DiasRealizada 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {currentVehicle.postventa?.encuesta7DiasRealizada ? 'Realizada' : 'Pendiente'}
                      </span>
                    </div>

                    {currentVehicle.postventa?.encuesta7DiasRealizada ? (
                      <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (currentVehicle.postventa?.calificacion7Dias || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-slate-700 font-bold ml-1 text-xs">
                            {currentVehicle.postventa?.calificacion7Dias}/5
                          </span>
                        </div>
                        <p className="text-slate-600 italic">
                          "{currentVehicle.postventa?.comentarios7Dias || 'Excelente acabado de pintura y trato amable.'}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[11px]">
                        Llamar al cliente a los 7 días para verificar desempeño del auto y satisfacción con el armado.
                      </p>
                    )}

                    <button
                      onClick={() => {
                        setSurveyType('7dias');
                        setShowSurveyModal(true);
                      }}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition"
                    >
                      {currentVehicle.postventa?.encuesta7DiasRealizada ? 'Actualizar Encuesta 7 Días' : 'Aplicar Encuesta 7 Días'}
                    </button>
                  </div>

                  {/* 30 Days Survey (Warranty) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">Encuesta 30 Días (Garantía)</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentVehicle.postventa?.encuesta30DiasRealizada 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {currentVehicle.postventa?.encuesta30DiasRealizada ? 'Realizada' : 'Pendiente'}
                      </span>
                    </div>

                    {currentVehicle.postventa?.encuesta30DiasRealizada ? (
                      <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (currentVehicle.postventa?.calificacion30Dias || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-slate-700 font-bold ml-1 text-xs">
                            {currentVehicle.postventa?.calificacion30Dias}/5
                          </span>
                        </div>
                        <p className="text-slate-600 italic">
                          "{currentVehicle.postventa?.comentarios30Dias || 'Pintura mantiene brillo de fábrica sin anomalías.'}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[11px]">
                        Inspección de garantía: verificar estabilidad de transparente, ensamble de líneas y satisfacción general.
                      </p>
                    )}

                    <button
                      onClick={() => {
                        setSurveyType('30dias');
                        setShowSurveyModal(true);
                      }}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition"
                    >
                      {currentVehicle.postventa?.encuesta30DiasRealizada ? 'Actualizar Encuesta 30 Días' : 'Aplicar Encuesta 30 Días'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No hay unidades seleccionadas.
            </div>
          )}
        </div>

      </div>

      {/* Checkout modal */}
      {showCheckoutModal && currentVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#91B146]" />
                Check-out y Firma de Conformidad
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Validaciones previas a entrega:</p>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" defaultChecked required className="rounded text-[#91B146]" />
                  <span>Unidad lavada, aspirada y detallada exterior e interior.</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" defaultChecked required className="rounded text-[#91B146]" />
                  <span>Pertenencias e inventario devueltos completos al cliente.</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" defaultChecked required className="rounded text-[#91B146]" />
                  <span>Inspección visual conjunta de pintura y ensambles concluida.</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Cliente que Recibe y Firma:
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Firma de ${currentVehicle.clienteNombre}`}
                  value={checkoutSignature}
                  onChange={(e) => setCheckoutSignature(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && currentVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                {surveyType === '7dias' ? 'Encuesta de Satisfacción (7 Días)' : 'Revisión de Garantía (30 Días)'}
              </h3>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSurvey} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Cliente: <strong>{currentVehicle.clienteNombre}</strong> • {currentVehicle.clienteTelefono}
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Calificación General del Servicio (1 a 5 Estrellas):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSurveyRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= surveyRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-sm text-slate-800 ml-2">{surveyRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Comentarios del Cliente y Observaciones de Garantía:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalles sobre el acabado, trato del personal, tiempos de entrega..."
                  value={surveyComments}
                  onChange={(e) => setSurveyComments(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#67A0CD] hover:bg-[#5287b0] text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Encuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
