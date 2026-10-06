import React from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { WORKFLOW_STAGES, WorkflowStage, VehicleRecord } from '../../types';
import { 
  GitFork, 
  ArrowDown, 
  Car, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const FlujoTallerGlobal: React.FC = () => {
  const { vehicles, setSelectedVehicleForWorkflow, setActiveModule } = useCarbody();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#91B146]" />
            Línea de Proceso Integral del Taller Carbody (7 Etapas)
          </h2>
          <p className="text-xs text-[#939395]">
            Monitoreo en tiempo real del ciclo de vida de cada unidad desde el agendamiento hasta el seguimiento postventa.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 self-start">
          {vehicles.length} Unidades Activas en Flujo
        </span>
      </div>

      {/* 7-Step Interactive Pipeline Vertical Diagram */}
      <div className="max-w-4xl mx-auto space-y-4">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const carsInStage = vehicles.filter(v => v.currentWorkflowStage === stage.id);

          return (
            <React.Fragment key={stage.id}>
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.stepNumber}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#1B1B1B]">
                        {stage.label}
                      </h3>
                      <p className="text-[11px] text-[#939395]">
                        {stage.id === 'cita_recepcion' && 'Agendamiento, captura de ficha técnica, peritaje 360° y firma de inventario.'}
                        {stage.id === 'valuacion_inspeccion' && 'Desglose por paneles, tabulador de aseguradora y cálculo de horas/pintura.'}
                        {stage.id === 'aprobacion_refacciones' && 'Autorización de aseguradora, complementos y orden de compra vinculada.'}
                        {stage.id === 'taller_proceso' && 'Mecánica ligera, banco de estiraje, laboratorio OEM y cabina de horneado.'}
                        {stage.id === 'armado_calidad' && 'Armado final, ajuste milimétrico de líneas, pulido y liberación técnica.'}
                        {stage.id === 'facturacion_entrega' && 'Emisión de CFDI, cobro de deducible pactado y acta de entrega conforme.'}
                        {stage.id === 'postventa_cierre' && 'Encuestas de satisfacción a 7 y 30 días con certificación de garantía.'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    carsInStage.length > 0 
                      ? 'bg-[#91B146]/10 text-[#91B146] border border-[#91B146]/30' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {carsInStage.length} auto(s) en esta etapa
                  </span>
                </div>

                {/* Cars located in this stage */}
                {carsInStage.length > 0 ? (
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {carsInStage.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicleForWorkflow(v)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center justify-between gap-2 group"
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-900">
                              {v.placas}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                              {v.procedencia}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
                            {v.marca} {v.submarca}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Siniestro: {v.siniestro}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#91B146] transition shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="pt-3 text-[11px] text-slate-400 italic">
                    Sin unidades esperando en esta fase actualmente.
                  </p>
                )}
              </div>

              {/* Arrow Connector between steps */}
              {idx < WORKFLOW_STAGES.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="p-1 rounded-full bg-slate-200/80 text-slate-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
