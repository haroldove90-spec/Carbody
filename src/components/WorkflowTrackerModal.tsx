import React from 'react';
import { useCarbody } from '../context/CarbodyContext';
import { WORKFLOW_STAGES, WorkflowStage, VehicleRecord } from '../types';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Car, 
  Shield, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Tag, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const WorkflowTrackerModal: React.FC = () => {
  const { 
    selectedVehicleForWorkflow, 
    setSelectedVehicleForWorkflow, 
    advanceWorkflowStage 
  } = useCarbody();

  if (!selectedVehicleForWorkflow) return null;

  const vehicle = selectedVehicleForWorkflow;
  const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.id === vehicle.currentWorkflowStage);

  const handleAdvance = (stageId: WorkflowStage) => {
    advanceWorkflowStage(vehicle.id, stageId);
    setSelectedVehicleForWorkflow({
      ...vehicle,
      currentWorkflowStage: stageId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1B1B1B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-[#91B146]">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  {vehicle.marca} {vehicle.submarca} {vehicle.modeloAnio}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/20 text-white font-bold">
                  {vehicle.placas}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Expediente: <span className="text-white font-semibold">{vehicle.expediente}</span> • Siniestro: <span className="text-[#91B146] font-semibold">{vehicle.siniestro}</span> ({vehicle.procedencia})
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedVehicleForWorkflow(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle snapshot */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div>
            <span className="text-[#939395] block text-[10px]">Cliente:</span>
            <span className="font-semibold text-slate-900">{vehicle.clienteNombre}</span>
          </div>
          <div>
            <span className="text-[#939395] block text-[10px]">Teléfono:</span>
            <span className="font-semibold text-slate-900">{vehicle.clienteTelefono}</span>
          </div>
          <div>
            <span className="text-[#939395] block text-[10px]">Ingreso:</span>
            <span className="font-semibold text-slate-900">{vehicle.fechaIngreso}</span>
          </div>
          <div>
            <span className="text-[#939395] block text-[10px]">Promesa Entrega:</span>
            <span className="font-semibold text-[#91B146]">{vehicle.fechaPromesaEntrega}</span>
          </div>
        </div>

        {/* 7-Step Workflow Diagram & Stage Advancer */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Línea de Proceso en Taller (7 Etapas)
            </h4>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#91B146]/10 text-[#91B146] border border-[#91B146]/30">
              Etapa {currentStageIndex + 1} de 7
            </span>
          </div>

          {/* Stepper Vertical / Grid */}
          <div className="space-y-3">
            {WORKFLOW_STAGES.map((st, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                      : isPassed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50/40 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#1B1B1B] text-[#91B146]'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : st.stepNumber}
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${
                        isCurrent ? 'text-amber-950 font-extrabold' : isPassed ? 'text-emerald-950' : 'text-slate-700'
                      }`}>
                        {st.label}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isPassed 
                          ? 'Completado y validado' 
                          : isCurrent 
                          ? `En proceso activo • Sub-etapa taller: ${vehicle.tallerSubEtapa.toUpperCase()}`
                          : 'Pendiente de inicio'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isCurrent && idx < WORKFLOW_STAGES.length - 1 && (
                      <button
                        onClick={() => handleAdvance(WORKFLOW_STAGES[idx + 1].id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 rounded-lg shadow-xs transition"
                      >
                        <span>Avanzar a {WORKFLOW_STAGES[idx + 1].shortLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isCurrent && (
                      <button
                        onClick={() => handleAdvance(st.id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
                      >
                        Fijar aquí
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current sub-etapa details for taller_proceso */}
          {vehicle.currentWorkflowStage === 'taller_proceso' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-800 mb-2">
                Sub-etapas operativas de producción:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'en_espera', label: 'En espera' },
                  { id: 'mecanica', label: 'Mecánica' },
                  { id: 'hojalateria', label: 'Hojalatería' },
                  { id: 'preparacion', label: 'Preparación' },
                  { id: 'pintura', label: 'Pintura' },
                  { id: 'armado', label: 'Armado' },
                  { id: 'detallado_lavado', label: 'Detallado' },
                  { id: 'control_calidad', label: 'Control Calidad' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      advanceWorkflowStage(vehicle.id, 'taller_proceso', sub.id as any);
                      setSelectedVehicleForWorkflow({
                        ...vehicle,
                        tallerSubEtapa: sub.id as any
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium border text-xs transition ${
                      vehicle.tallerSubEtapa === sub.id
                        ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedVehicleForWorkflow(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Cerrar Flujo
          </button>
        </div>

      </div>
    </div>
  );
};
