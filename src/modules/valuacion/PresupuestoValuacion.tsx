import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord, Procedencia } from '../../types';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  Car, 
  Layers, 
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

const LISTA_PANELES = [
  'Facia delantera',
  'Facia trasera',
  'Cofre',
  'Salpicadera delantera izquierda',
  'Salpicadera delantera derecha',
  'Puerta delantera izquierda',
  'Puerta delantera derecha',
  'Puerta trasera izquierda',
  'Puerta trasera derecha',
  'Costado trasero izquierdo',
  'Costado trasero derecho',
  'Toldo / Techo',
  'Tapa cajuela / Portón',
  'Estribo izquierdo',
  'Estribo derecho',
  'Faro izquierdo OEM',
  'Faro derecho OEM',
  'Calavera izquierda',
  'Calavera derecha',
  'Marco de radiador / Alma',
  'Soporte de motor / Suspensión'
];

export const PresupuestoValuacion: React.FC = () => {
  const { vehicles, updateVehicle, advanceWorkflowStage, addAuditLog } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // New item form
  const [pieza, setPieza] = useState(LISTA_PANELES[0]);
  const [accion, setAccion] = useState<'Reparar' | 'Sustituir'>('Reparar');
  const [intervenciones, setIntervenciones] = useState<('Desarme' | 'Hojalatería' | 'Mecánica' | 'Pintura' | 'Pulido')[]>(['Hojalatería', 'Pintura']);
  const [horasHojalateria, setHorasHojalateria] = useState(3);
  const [horasMecanica, setHorasMecanica] = useState(0);
  const [costoPintura, setCostoPintura] = useState(1800);
  const [costoRefaccion, setCostoRefaccion] = useState(0);

  // Tabulador rates ($/hour)
  const getTarifaManoObra = (proc: Procedencia) => {
    switch (proc) {
      case 'Chubb': return 380;
      case 'GNP': return 360;
      case 'Renta de autos': return 420;
      case 'Lote': return 400;
      case 'Particular': return 550;
      default: return 400;
    }
  };

  const tarifaHora = currentVehicle ? getTarifaManoObra(currentVehicle.procedencia) : 400;

  const toggleIntervencion = (tipo: 'Desarme' | 'Hojalatería' | 'Mecánica' | 'Pintura' | 'Pulido') => {
    setIntervenciones(prev => 
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  const handleAddPieza = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    const newItem = {
      id: `pie-${Date.now()}`,
      pieza,
      accion,
      tipoIntervencion: intervenciones,
      horasHojalateria,
      horasMecanica,
      costoPintura: intervenciones.includes('Pintura') ? costoPintura : 0,
      costoRefaccion: accion === 'Sustituir' ? costoRefaccion : 0,
      estatusRefaccion: accion === 'Sustituir' ? 'Pendiente' as const : undefined
    };

    const updatedPiezas = [...currentVehicle.piezasValuadas, newItem];
    const totalMO = updatedPiezas.reduce((acc, p) => acc + ((p.horasHojalateria + p.horasMecanica) * tarifaHora), 0);
    const totalPintura = updatedPiezas.reduce((acc, p) => acc + p.costoPintura, 0);
    const totalRefacciones = updatedPiezas.reduce((acc, p) => acc + p.costoRefaccion, 0);
    const subtotal = totalMO + totalPintura + totalRefacciones;

    updateVehicle(currentVehicle.id, {
      piezasValuadas: updatedPiezas,
      totalPresupuesto: subtotal,
      tabuladorAplicado: `Tabulador ${currentVehicle.procedencia} ($${tarifaHora}/h)`
    });

    addAuditLog(
      'Pieza Valuada Agregada',
      `${pieza} (${accion}) - ${horasHojalateria}h Hojalatería en ${currentVehicle.placas}`,
      currentVehicle.expediente
    );

    // Reset
    setCostoRefaccion(0);
    setHorasHojalateria(2);
  };

  const handleRemovePieza = (pieId: string) => {
    if (!currentVehicle) return;
    const updatedPiezas = currentVehicle.piezasValuadas.filter(p => p.id !== pieId);
    const totalMO = updatedPiezas.reduce((acc, p) => acc + ((p.horasHojalateria + p.horasMecanica) * tarifaHora), 0);
    const totalPintura = updatedPiezas.reduce((acc, p) => acc + p.costoPintura, 0);
    const totalRefacciones = updatedPiezas.reduce((acc, p) => acc + p.costoRefaccion, 0);
    const subtotal = totalMO + totalPintura + totalRefacciones;

    updateVehicle(currentVehicle.id, {
      piezasValuadas: updatedPiezas,
      totalPresupuesto: subtotal
    });
  };

  const handleFinalizeValuacion = () => {
    if (!currentVehicle) return;
    advanceWorkflowStage(currentVehicle.id, 'aprobacion_refacciones');
    addAuditLog(
      'Presupuesto de Valuación Concluido',
      `Monto valuado: $${currentVehicle.totalPresupuesto.toLocaleString()} MXN. Pasa a Aprobación y Pedido de Refacciones.`,
      currentVehicle.expediente
    );
  };

  // Calculations
  const piezas = currentVehicle?.piezasValuadas || [];
  const sumHorasHojalateria = piezas.reduce((a, b) => a + b.horasHojalateria, 0);
  const sumHorasMecanica = piezas.reduce((a, b) => a + b.horasMecanica, 0);
  const sumManoObra = (sumHorasHojalateria + sumHorasMecanica) * tarifaHora;
  const sumPintura = piezas.reduce((a, b) => a + b.costoPintura, 0);
  const sumRefacciones = piezas.reduce((a, b) => a + b.costoRefaccion, 0);
  const totalValuado = sumManoObra + sumPintura + sumRefacciones;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#67A0CD]" />
            Presupuesto y Valuación por Paneles
          </h2>
          <p className="text-xs text-[#939395]">
            Valuación por piezas/paneles (desarme, hojalatería, mecánica, pintura, pulido) con tabuladores específicos para Chubb, GNP, flotillas y particulares.
          </p>
        </div>

        {currentVehicle && (
          <button
            onClick={handleFinalizeValuacion}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <span>Concluir Valuación →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Target Vehicle Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Seleccionar Expediente a Valuar:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicleId(v.id)}
              className={`p-3 rounded-xl border text-left transition ${
                currentVehicle?.id === v.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold">{v.placas}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentVehicle?.id === v.id ? 'bg-[#91B146] text-[#1B1B1B]' : 'bg-slate-200 text-slate-700'
                }`}>
                  {v.procedencia}
                </span>
              </div>
              <p className="text-xs font-semibold truncate mt-1">
                {v.marca} {v.submarca}
              </p>
            </button>
          ))}
        </div>
      </div>

      {currentVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Add panel to valuation */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#91B146]" />
              Valuar Nueva Pieza / Panel
            </h3>

            <form onSubmit={handleAddPieza} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pieza o Panel</label>
                <select
                  value={pieza}
                  onChange={(e) => setPieza(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  {LISTA_PANELES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acción Técnica</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccion('Reparar')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      accion === 'Reparar'
                        ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Reparar Pieza
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccion('Sustituir')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      accion === 'Sustituir'
                        ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Sustituir Refacción
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intervenciones Requeridas</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Desarme', 'Hojalatería', 'Mecánica', 'Pintura', 'Pulido'] as const).map(tipo => {
                    const isSelected = intervenciones.includes(tipo);
                    return (
                      <button
                        type="button"
                        key={tipo}
                        onClick={() => toggleIntervencion(tipo)}
                        className={`px-3 py-1.5 rounded-lg border font-semibold text-[11px] transition ${
                          isSelected
                            ? 'bg-[#67A0CD] text-white border-[#67A0CD]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tipo}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Hojalatería</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={horasHojalateria}
                    onChange={(e) => setHorasHojalateria(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Mecánica</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={horasMecanica}
                    onChange={(e) => setHorasMecanica(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Materiales Pintura ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={costoPintura}
                    onChange={(e) => setCostoPintura(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                {accion === 'Sustituir' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Costo Refacción ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={costoRefaccion}
                      onChange={(e) => setCostoRefaccion(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1B1B1B] hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                + Agregar a la Valuación
              </button>
            </form>

            {/* Tabulador info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Tabulador Convenido:</span>
              <p>Procedencia: <strong>{currentVehicle.procedencia}</strong></p>
              <p>Mano de obra convenida: <strong className="text-[#91B146]">${tarifaHora} MXN / hora</strong></p>
            </div>
          </div>

          {/* Right: Valuation Table & Financial Summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Desglose de Valuación Técnica
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentVehicle.marca} {currentVehicle.submarca} ({currentVehicle.placas})
                  </h3>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                  {piezas.length} paneles/piezas valuadas
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                      <th className="py-2">Pieza / Panel</th>
                      <th className="py-2">Acción</th>
                      <th className="py-2 text-right">Hrs Hoj/Mec</th>
                      <th className="py-2 text-right">Pintura</th>
                      <th className="py-2 text-right">Refacción</th>
                      <th className="py-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {piezas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Aún no se han capturado piezas valuadas para este expediente.
                        </td>
                      </tr>
                    ) : (
                      piezas.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 font-semibold text-slate-900">{p.pieza}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.accion === 'Reparar' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.accion}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-medium text-slate-700">
                            {p.horasHojalateria}h / {p.horasMecanica}h
                          </td>
                          <td className="py-2.5 text-right font-medium text-slate-700">
                            ${p.costoPintura.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900">
                            {p.costoRefaccion > 0 ? `$${p.costoRefaccion.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleRemovePieza(p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] block">Mano de Obra ({sumHorasHojalateria + sumHorasMecanica}h)</span>
                  <span className="font-bold text-slate-900">${sumManoObra.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Insumos Pintura</span>
                  <span className="font-bold text-slate-900">${sumPintura.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Refacciones</span>
                  <span className="font-bold text-slate-900">${sumRefacciones.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Presupuestado</span>
                  <span className="font-extrabold text-sm text-[#91B146]">${totalValuado.toLocaleString()} MXN</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
