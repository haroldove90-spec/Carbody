import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord } from '../../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Camera, 
  Car, 
  Clock, 
  Award, 
  AlertCircle,
  FileCheck2,
  Check
} from 'lucide-react';

export const ControlCalidad: React.FC = () => {
  const { vehicles, updateVehicle, advanceWorkflowStage, addAuditLog } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Checklist state
  const [ajusteLineas, setAjusteLineas] = useState(currentVehicle?.calidadChecklist?.ajusteLineas ?? true);
  const [tonoColor, setTonoColor] = useState(currentVehicle?.calidadChecklist?.tonoColorCorrecto ?? true);
  const [sinDefectos, setSinDefectos] = useState(currentVehicle?.calidadChecklist?.sinDefectosPintura ?? true);
  const [limpieza, setLimpieza] = useState(currentVehicle?.calidadChecklist?.limpiezaInteriorExterior ?? true);
  const [torque, setTorque] = useState(currentVehicle?.calidadChecklist?.torqueTuercas ?? true);
  const [evidenciaFotos, setEvidenciaFotos] = useState(currentVehicle?.calidadChecklist?.evidenciaFotografica ?? true);

  const isAllApproved = ajusteLineas && tonoColor && sinDefectos && limpieza && torque && evidenciaFotos;

  const handleLiberarCalidad = () => {
    if (!currentVehicle) return;

    const fechaHoy = new Date().toISOString().slice(0, 10);

    updateVehicle(currentVehicle.id, {
      currentWorkflowStage: 'facturacion_entrega',
      tallerSubEtapa: 'control_calidad',
      calidadChecklist: {
        ajusteLineas,
        tonoColorCorrecto: tonoColor,
        sinDefectosPintura: sinDefectos,
        limpiezaInteriorExterior: limpieza,
        torqueTuercas: torque,
        aprobadoPorJefe: true,
        evidenciaFotografica: evidenciaFotos,
        fechaLiberacion: fechaHoy
      }
    });

    addAuditLog(
      'Liberación de Control de Calidad',
      `Unidad ${currentVehicle.placas} aprobada formalmente por Jefe de Taller. Lista para facturación y entrega.`,
      currentVehicle.expediente
    );

    alert('¡Unidad liberada por Control de Calidad! Pasa automáticamente al módulo de Facturación y Entrega.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#91B146]" />
            Control de Calidad y Liberación de Unidad
          </h2>
          <p className="text-xs text-[#939395]">
            Verificación técnica final: ajuste de líneas, exactitud del tono de pintura, pulido libre de hologramas y registro de evidencia fotográfica.
          </p>
        </div>

        {currentVehicle && (
          <button
            onClick={handleLiberarCalidad}
            disabled={!isAllApproved}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition ${
              isAllApproved
                ? 'bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sellar y Liberar Unidad</span>
          </button>
        )}
      </div>

      {/* Target Vehicle Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Expedientes en Revisión de Calidad:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {vehicles.map((v) => {
            const isApproved = !!v.calidadChecklist?.aprobadoPorJefe;
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
                    isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isApproved ? 'Liberado' : 'Por Revisar'}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Quality Inspection Points */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hoja de Inspección Técnica
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentVehicle.marca} {currentVehicle.submarca} ({currentVehicle.placas})
                </h3>
              </div>

              {currentVehicle.calidadChecklist?.fechaLiberacion && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  Liberado: {currentVehicle.calidadChecklist.fechaLiberacion}
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  id: 'lineas',
                  label: 'Ajuste de Líneas y Holguras Milimétricas',
                  desc: 'Separación uniforme entre puertas, salpicaderas, cofre y cajuela con tolerancias OEM.',
                  val: ajusteLineas,
                  set: setAjusteLineas
                },
                {
                  id: 'tono',
                  label: 'Tono, Matiz y Brillo de Pintura',
                  desc: 'Colorimetría idéntica a paneles adyacentes, sin diferencias de tonalidad a la luz solar.',
                  val: tonoColor,
                  set: setTonoColor
                },
                {
                  id: 'defectos',
                  label: 'Superficie Libre de Defectos',
                  desc: 'Sin piel de naranja excesiva, escurridos, hervidos, motas ni rayas de lijado en el transparente.',
                  val: sinDefectos,
                  set: setSinDefectos
                },
                {
                  id: 'limpieza',
                  label: 'Detallado, Lavado y Aspirado Completo',
                  desc: 'Interiores desmanchados, tablero limpio, cristales sin residuo de pasta y llantas abrillantadas.',
                  val: limpieza,
                  set: setLimpieza
                },
                {
                  id: 'torque',
                  label: 'Torque de Ruedas y Seguridad',
                  desc: 'Tuercas de seguridad apretadas a especificación de torque y birlo de seguridad devuelto.',
                  val: torque,
                  set: setTorque
                },
                {
                  id: 'fotos',
                  label: 'Evidencia Fotográfica de Calidad',
                  desc: 'Captura de fotos perimetrales 360° en alta resolución previo a la entrega.',
                  val: evidenciaFotos,
                  set: setEvidenciaFotos
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.set(!item.val)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    item.val
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                    item.val ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {item.val && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Photographic Evidence & Sign-off Seal */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#67A0CD]" />
                Evidencia Fotográfica de Entrega
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { pos: 'Frontal 45°', label: 'Ensamble de facia y faros' },
                  { pos: 'Lateral Izquierdo', label: 'Planimetría de puertas' },
                  { pos: 'Trasera 45°', label: 'Calaveras y cajuela' },
                  { pos: 'Reflejo Transparente', label: 'Brillo efecto espejo' }
                ].map((ph, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1"
                  >
                    <div className="h-16 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800 block text-xs">{ph.pos}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{ph.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Release Seal Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#91B146]">
                <ShieldCheck className="w-6 h-6" />
                <h4 className="font-bold text-sm">Sello de Calidad Carbody</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Este sello certifica que la unidad fue inspeccionada bajo los estándares técnicos de hojalatería, preparación de fondos y pintura automotriz con garantía de por vida en ensambles.
              </p>

              <div className="pt-2 border-t border-white/10 text-xs flex items-center justify-between text-slate-400">
                <span>Jefe de Taller: <strong>Jorge Bernal</strong></span>
                <span className="text-[#91B146] font-bold">100% Validado</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
