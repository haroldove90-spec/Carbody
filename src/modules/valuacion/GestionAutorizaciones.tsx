import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord } from '../../types';
import { 
  FileCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Check, 
  Clock, 
  DollarSign, 
  FileText,
  Camera
} from 'lucide-react';

export const GestionAutorizaciones: React.FC = () => {
  const { vehicles, updateVehicle, addAuditLog, advanceWorkflowStage } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  // Complement form
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [compDesc, setCompDesc] = useState('');
  const [compMonto, setCompMonto] = useState(1500);

  // Authorization form
  const [montoAutorizado, setMontoAutorizado] = useState<number>(0);
  const [deduciblePactado, setDeduciblePactado] = useState<number>(0);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const handleAuthorizeClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    updateVehicle(currentVehicle.id, {
      presupuestoAutorizadoAseguradora: montoAutorizado || currentVehicle.totalPresupuesto,
      deducible: deduciblePactado || currentVehicle.deducible,
      currentWorkflowStage: 'aprobacion_refacciones'
    });

    addAuditLog(
      'Presupuesto Autorizado por Aseguradora',
      `Siniestro ${currentVehicle.siniestro} (${currentVehicle.procedencia}) autorizado por $${(montoAutorizado || currentVehicle.totalPresupuesto).toLocaleString()} MXN. Pasa a pedido de refacciones.`,
      currentVehicle.expediente
    );

    alert('¡Presupuesto marcado como autorizado y vinculado al flujo!');
  };

  const handleAddComplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle || !compDesc) return;

    const newComp = {
      id: `comp-${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: compDesc,
      monto: compMonto,
      aprobado: true,
    };

    const updatedComps = [...currentVehicle.complementos, newComp];
    const newTotal = currentVehicle.totalPresupuesto + compMonto;

    updateVehicle(currentVehicle.id, {
      complementos: updatedComps,
      totalPresupuesto: newTotal,
      presupuestoAutorizadoAseguradora: (currentVehicle.presupuestoAutorizadoAseguradora || currentVehicle.totalPresupuesto) + compMonto
    });

    addAuditLog(
      'Complemento de Valuación (Daño Oculto)',
      `${compDesc} (+$${compMonto.toLocaleString()} MXN) para ${currentVehicle.placas}`,
      currentVehicle.expediente
    );

    setShowComplementModal(false);
    setCompDesc('');
    setCompMonto(1500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#67A0CD]" />
          Gestión de Autorizaciones y Complementos de Siniestro
        </h2>
        <p className="text-xs text-[#939395]">
          Carga de presupuestos aprobados por ajustador/aseguradora y control de complementos por daños ocultos detectados tras el desarme.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Vehicles under authorization */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Expedientes en Trámite de Autorización ({vehicles.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {vehicles.map((v) => {
              const isSelected = currentVehicle?.id === v.id;
              const hasAuth = !!v.presupuestoAutorizadoAseguradora && v.presupuestoAutorizadoAseguradora > 0;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setMontoAutorizado(v.presupuestoAutorizadoAseguradora || v.totalPresupuesto);
                    setDeduciblePactado(v.deducible || 0);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white border-[#67A0CD] shadow-sm ring-2 ring-[#67A0CD]/20'
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {v.placas}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasAuth ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {hasAuth ? 'Autorizado' : 'En Espera Ajustador'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {v.marca} {v.submarca} {v.modeloAnio}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Siniestro: {v.siniestro} • {v.procedencia}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Presupuestado: <strong>${v.totalPresupuesto.toLocaleString()}</strong>
                    </span>
                    {v.complementos.length > 0 && (
                      <span className="text-purple-700 font-bold">
                        +{v.complementos.length} Complemento(s)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Authorization & Complement Manager */}
        <div className="lg:col-span-7 space-y-4">
          {currentVehicle ? (
            <>
              {/* Approval form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Expediente {currentVehicle.expediente}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Autorización: {currentVehicle.procedencia} (Siniestro {currentVehicle.siniestro})
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">
                    {currentVehicle.placas}
                  </span>
                </div>

                <form onSubmit={handleAuthorizeClaim} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Monto Autorizado por Ajustador ($ MXN)
                      </label>
                      <input
                        type="number"
                        required
                        value={montoAutorizado || currentVehicle.totalPresupuesto}
                        onChange={(e) => setMontoAutorizado(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-[#67A0CD]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Deducible Pactado con Cliente ($ MXN)
                      </label>
                      <input
                        type="number"
                        value={deduciblePactado || currentVehicle.deducible}
                        onChange={(e) => setDeduciblePactado(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#67A0CD] hover:bg-[#5287b0] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Registrar Aprobación de Aseguradora
                    </button>
                  </div>
                </form>
              </div>

              {/* Complementos (Daños Ocultos) section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Complementos y Daños Ocultos ({currentVehicle.complementos.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ampliaciones de presupuesto generadas tras desarmar y encontrar piezas internas rotas.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowComplementModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B1B1B] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Solicitar Complemento
                  </button>
                </div>

                {currentVehicle.complementos.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No se han registrado complementos ni daños ocultos para este vehículo.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentVehicle.complementos.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-purple-950">{comp.descripcion}</span>
                            <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-mono">
                              {comp.fecha}
                            </span>
                          </div>
                          <span className="text-[11px] text-purple-800 font-medium">
                            Estatus: {comp.aprobado ? 'Aprobado por Aseguradora' : 'En Revisión'}
                          </span>
                        </div>

                        <span className="font-extrabold text-sm text-purple-900">
                          +${comp.monto.toLocaleString()} MXN
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Selecciona una unidad de la lista izquierda para gestionar su autorización.
            </div>
          )}
        </div>

      </div>

      {/* Complement Modal */}
      {showComplementModal && currentVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#91B146]" />
                Registrar Daño Oculto / Complemento
              </h3>
              <button onClick={() => setShowComplementModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddComplement} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Vehículo: <strong>{currentVehicle.marca} {currentVehicle.submarca} ({currentVehicle.placas})</strong>
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción del Daño Oculto (Justificación Técnica)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Al retirar facia y alma se detecta fractura en base de radiador y soporte lateral de motor..."
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto Estimado de Ampliación ($ MXN)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={compMonto}
                  onChange={(e) => setCompMonto(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComplementModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Agregar Complemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
