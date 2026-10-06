import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord } from '../../types';
import { 
  Package, 
  Car, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';

export const AsignacionRefacciones: React.FC = () => {
  const { vehicles, updateVehicle, addAuditLog, advanceWorkflowStage } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  // New part requisition form
  const [showAddPart, setShowAddPart] = useState(false);
  const [partName, setPartName] = useState('');
  const [partCost, setPartCost] = useState(2500);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Filter parts that require replacement
  const replacementParts = currentVehicle?.piezasValuadas.filter(p => p.accion === 'Sustituir') || [];

  const handleUpdatePartStatus = (
    partId: string, 
    newStatus: 'Pendiente' | 'Solicitada' | 'En Tránsito' | 'En Taller' | 'Instalada'
  ) => {
    if (!currentVehicle) return;

    const updatedPiezas = currentVehicle.piezasValuadas.map(p => 
      p.id === partId ? { ...p, estatusRefaccion: newStatus } : p
    );

    updateVehicle(currentVehicle.id, {
      piezasValuadas: updatedPiezas
    });

    addAuditLog(
      'Estatus de Refacción Actualizado',
      `Pieza ${partId} en ${currentVehicle.placas} cambiada a: ${newStatus}`,
      currentVehicle.expediente
    );
  };

  const handleAddCustomPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle || !partName) return;

    const newPart = {
      id: `ref-${Date.now()}`,
      pieza: partName,
      accion: 'Sustituir' as const,
      tipoIntervencion: ['Desarme' as const, 'Armado' as const],
      horasHojalateria: 1,
      horasMecanica: 0.5,
      costoPintura: 0,
      costoRefaccion: partCost,
      estatusRefaccion: 'Solicitada' as const,
    };

    updateVehicle(currentVehicle.id, {
      piezasValuadas: [...currentVehicle.piezasValuadas, newPart],
      totalPresupuesto: currentVehicle.totalPresupuesto + partCost
    });

    addAuditLog(
      'Refacción Vinculada al Expediente',
      `${partName} vinculada obligatoriamente al siniestro ${currentVehicle.siniestro}`,
      currentVehicle.expediente
    );

    setShowAddPart(false);
    setPartName('');
  };

  const handleAllPartsReceived = () => {
    if (!currentVehicle) return;
    advanceWorkflowStage(currentVehicle.id, 'taller_proceso', 'hojalateria');
    alert('¡Todas las refacciones han sido asignadas al hojalatero! El vehículo avanza a la etapa activa de taller.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#91B146]" />
            Asignación de Refacciones por Auto y Siniestro
          </h2>
          <p className="text-xs text-[#939395]">
            Vinculación obligatoria de cada refacción o insumo al expediente del vehículo/número de siniestro y control de entrega física.
          </p>
        </div>

        <button
          onClick={() => setShowAddPart(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B1B1B] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
        >
          <Plus className="w-4 h-4 text-[#91B146]" />
          <span>Vincular Nueva Refacción</span>
        </button>
      </div>

      {/* Target Vehicle Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Expediente Vinculado:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {vehicles.map((v) => {
            const reqPartsCount = v.piezasValuadas.filter(p => p.accion === 'Sustituir').length;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  currentVehicle?.id === v.id
                    ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold">{v.placas}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    reqPartsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {reqPartsCount} refacciones
                  </span>
                </div>
                <p className="text-xs font-semibold truncate mt-1">
                  {v.marca} {v.submarca}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {currentVehicle && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Expediente {currentVehicle.expediente} • Siniestro: <strong className="text-slate-900">{currentVehicle.siniestro}</strong>
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {currentVehicle.marca} {currentVehicle.submarca} ({currentVehicle.placas}) - {currentVehicle.procedencia}
              </h3>
            </div>

            <button
              onClick={handleAllPartsReceived}
              className="px-4 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start"
            >
              <span>Asignar a Hojalatero y Pasar a Taller</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Parts Requisition Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                  <th className="py-2.5">Descripción de la Autoparte</th>
                  <th className="py-2.5">Siniestro Vinculado</th>
                  <th className="py-2.5 text-right">Costo Estimado</th>
                  <th className="py-2.5 text-center">Estatus Actual</th>
                  <th className="py-2.5 text-right">Acción de Almacén</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {replacementParts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No hay piezas marcadas para 'Sustituir' en este expediente. Usa el botón superior para agregar una.
                    </td>
                  </tr>
                ) : (
                  replacementParts.map((p) => {
                    const status = p.estatusRefaccion || 'Pendiente';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>{p.pieza}</span>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-600">
                          {currentVehicle.siniestro}
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900">
                          ${p.costoRefaccion.toLocaleString()} MXN
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === 'En Taller' || status === 'Instalada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'En Tránsito'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={status}
                            onChange={(e) => handleUpdatePartStatus(p.id, e.target.value as any)}
                            className="p-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="Pendiente">Pendiente de Pedido</option>
                            <option value="Solicitada">Solicitada a Proveedor</option>
                            <option value="En Tránsito">En Tránsito (Con Guía)</option>
                            <option value="En Taller">Recibida en Taller</option>
                            <option value="Instalada">Asignada / Instalada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Part Modal */}
      {showAddPart && currentVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-[#91B146]" />
                Vincular Refacción al Expediente
              </h3>
              <button onClick={() => setShowAddPart(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCustomPart} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Expediente Vinculado Obligatorio:</span>
                <span className="font-bold text-slate-900">{currentVehicle.expediente} • Siniestro {currentVehicle.siniestro}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción de la Autoparte
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Faro LED Izquierdo OEM, Facia Trasera, Radiador..."
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Costo Estimado de Compra ($ MXN)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={partCost}
                  onChange={(e) => setPartCost(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPart(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Vincular y Solicitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
