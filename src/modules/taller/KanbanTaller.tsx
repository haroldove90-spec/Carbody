import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { TallerSubEtapa, VehicleRecord } from '../../types';
import { 
  Kanban, 
  ArrowRight, 
  ArrowLeft, 
  Car, 
  Clock, 
  Shield, 
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const KANBAN_STAGES: { id: TallerSubEtapa; label: string; color: string }[] = [
  { id: 'en_espera', label: 'En Espera', color: '#939395' },
  { id: 'mecanica', label: 'Mecánica', color: '#67A0CD' },
  { id: 'hojalateria', label: 'Hojalatería', color: '#1B1B1B' },
  { id: 'preparacion', label: 'Preparación', color: '#939395' },
  { id: 'pintura', label: 'Pintura', color: '#91B146' },
  { id: 'armado', label: 'Armado', color: '#67A0CD' },
  { id: 'detallado_lavado', label: 'Detallado / Lavado', color: '#91B146' },
  { id: 'control_calidad', label: 'Control de Calidad', color: '#1B1B1B' },
];

export const KanbanTaller: React.FC = () => {
  const { vehicles, updateVehicle, advanceWorkflowStage, setSelectedVehicleForWorkflow, addAuditLog } = useCarbody();
  const [filterProcedencia, setFilterProcedencia] = useState<string>('all');

  const workshopVehicles = vehicles.filter(v => {
    const matchProc = filterProcedencia === 'all' || v.procedencia === filterProcedencia;
    return matchProc;
  });

  const moveStage = (vehicleId: string, currentSub: TallerSubEtapa, direction: 'next' | 'prev') => {
    const currentIndex = KANBAN_STAGES.findIndex(s => s.id === currentSub);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < KANBAN_STAGES.length) {
      const nextSub = KANBAN_STAGES[targetIndex].id;
      const vehicle = vehicles.find(v => v.id === vehicleId);

      // If moving to control_calidad, ensure it's in armado_calidad workflow
      let nextWorkflow = vehicle?.currentWorkflowStage || 'taller_proceso';
      if (nextSub === 'control_calidad') {
        nextWorkflow = 'armado_calidad';
      }

      updateVehicle(vehicleId, {
        tallerSubEtapa: nextSub,
        currentWorkflowStage: nextWorkflow
      });

      addAuditLog(
        'Avance en Tablero Kanban',
        `Unidad ${vehicle?.placas} movida a etapa operativa: ${KANBAN_STAGES[targetIndex].label}`,
        vehicle?.expediente
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#91B146]" />
            Tablero de Producción (Kanban de Taller)
          </h2>
          <p className="text-xs text-[#939395]">
            Vista general y control de flujo de unidades por etapas operativas en tiempo real.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 hidden md:inline">Filtro:</span>
          {['all', 'Chubb', 'GNP', 'Renta de autos', 'Particular'].map((proc) => (
            <button
              key={proc}
              onClick={() => setFilterProcedencia(proc)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                filterProcedencia === proc
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {proc === 'all' ? 'Todos' : proc}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {KANBAN_STAGES.map((col, colIndex) => {
          const cardsInCol = workshopVehicles.filter(v => v.tallerSubEtapa === col.id);

          return (
            <div
              key={col.id}
              className="w-72 shrink-0 bg-slate-100/80 rounded-2xl p-3 flex flex-col border border-slate-200/90 shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: col.color }} 
                  />
                  <h3 className="text-xs font-bold text-slate-800">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                  {cardsInCol.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-2.5 min-h-[300px]">
                {cardsInCol.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                    Sin autos en esta etapa
                  </div>
                ) : (
                  cardsInCol.map((v) => {
                    const hasOpenComp = v.complementos.some(c => !c.aprobado);

                    return (
                      <div
                        key={v.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded">
                            {v.placas}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            {v.procedencia}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">
                            {v.marca} {v.submarca}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Siniestro: {v.siniestro}
                          </p>
                        </div>

                        {/* Operational tags */}
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {v.operativoMecanica?.completado && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">Mecánica ✓</span>
                          )}
                          {v.operativoHojalateria?.completado && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">Hojalatería ✓</span>
                          )}
                          {v.operativoCabina?.pulidoListo && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Pintura ✓</span>
                          )}
                        </div>

                        {/* Card bottom bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedVehicleForWorkflow(v)}
                            className="text-[10px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-0.5"
                          >
                            <span>Flujo</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>

                          <div className="flex items-center gap-1">
                            {colIndex > 0 && (
                              <button
                                onClick={() => moveStage(v.id, v.tallerSubEtapa, 'prev')}
                                title="Regresar a etapa previa"
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {colIndex < KANBAN_STAGES.length - 1 && (
                              <button
                                onClick={() => moveStage(v.id, v.tallerSubEtapa, 'next')}
                                title="Avanzar siguiente etapa"
                                className="p-1 px-2 text-xs font-bold text-white bg-[#91B146] hover:bg-[#7e9c3b] rounded-lg shadow-2xs flex items-center gap-1"
                              >
                                <span>Avanzar</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
