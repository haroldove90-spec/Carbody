import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { 
  Wrench, 
  Hammer, 
  FlaskConical, 
  Flame, 
  Save, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Thermometer, 
  ShieldCheck 
} from 'lucide-react';

export const ModuloOperativo: React.FC = () => {
  const { vehicles, updateVehicle, addAuditLog } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'mecanica' | 'hojalateria' | 'colorLab' | 'cabina'>('hojalateria');

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Mecanica state
  const [mecTecnico, setMecTecnico] = useState(currentVehicle?.operativoMecanica?.tecnico || 'Pedro Saldaña');
  const [mecIntervenciones, setMecIntervenciones] = useState(currentVehicle?.operativoMecanica?.intervenciones?.join(', ') || 'Suspensión delantera, alineación por impacto, purgado de radiador');
  const [mecHoras, setMecHoras] = useState(currentVehicle?.operativoMecanica?.horasEfectivas || 2);
  const [mecAlineacion, setMecAlineacion] = useState(currentVehicle?.operativoMecanica?.alineacionRealizada ?? true);
  const [mecCompletado, setMecCompletado] = useState(currentVehicle?.operativoMecanica?.completado ?? false);

  // Hojalateria state
  const [hojTecnico, setHojTecnico] = useState(currentVehicle?.operativoHojalateria?.tecnico || 'Mateo González');
  const [hojBanco, setHojBanco] = useState(currentVehicle?.operativoHojalateria?.bancoEstirajeUsado ?? true);
  const [hojSoldadura, setHojSoldadura] = useState(currentVehicle?.operativoHojalateria?.soldaduraAplicada ?? true);
  const [hojHoras, setHojHoras] = useState(currentVehicle?.operativoHojalateria?.horasEfectivas || 4.5);
  const [hojCompletado, setHojCompletado] = useState(currentVehicle?.operativoHojalateria?.completado ?? false);

  // Color Lab state
  const [colorCodigoOEM, setColorCodigoOEM] = useState(currentVehicle?.codigoColorOEM || currentVehicle?.operativoColorLab?.codigoOEM || 'LC9A / 46G');
  const [colorMarca, setColorMarca] = useState(currentVehicle?.operativoColorLab?.marcaPintura || 'Axalta Cromax Pro');
  const [colorGramos, setColorGramos] = useState(currentVehicle?.operativoColorLab?.formulaGramos || 550);
  const [colorMerma, setColorMerma] = useState(currentVehicle?.operativoColorLab?.mermaGramos || 25);
  const [colorIgualador, setColorIgualador] = useState(currentVehicle?.operativoColorLab?.igualador || 'Roberto Valdés (Colorista)');
  const [colorCompletado, setColorCompletado] = useState(currentVehicle?.operativoColorLab?.completado ?? true);

  // Cabina state
  const [cabPintor, setCabPintor] = useState(currentVehicle?.operativoCabina?.pintor || 'Ramiro Ortiz');
  const [cabHorneadoMin, setCabHorneadoMin] = useState(currentVehicle?.operativoCabina?.tiempoHorneadoMinutos || 50);
  const [cabTempC, setCabTempC] = useState(currentVehicle?.operativoCabina?.temperaturaHornoC || 60);
  const [cabTransparente, setCabTransparente] = useState(currentVehicle?.operativoCabina?.tipoTransparente || 'Clear Coat Alto Sólidos 2K');
  const [cabPulido, setCabPulido] = useState(currentVehicle?.operativoCabina?.pulidoListo ?? false);
  const [cabCompletado, setCabCompletado] = useState(currentVehicle?.operativoCabina?.completado ?? false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Save changes to vehicle
  const handleSaveOperational = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    updateVehicle(currentVehicle.id, {
      codigoColorOEM: colorCodigoOEM,
      operativoMecanica: {
        tecnico: mecTecnico,
        intervenciones: mecIntervenciones.split(',').map(s => s.trim()),
        horasEfectivas: mecHoras,
        alineacionRealizada: mecAlineacion,
        completado: mecCompletado,
      },
      operativoHojalateria: {
        tecnico: hojTecnico,
        bancoEstirajeUsado: hojBanco,
        soldaduraAplicada: hojSoldadura,
        horasEfectivas: hojHoras,
        completado: hojCompletado,
      },
      operativoColorLab: {
        codigoOEM: colorCodigoOEM,
        marcaPintura: colorMarca,
        formulaGramos: colorGramos,
        mermaGramos: colorMerma,
        igualador: colorIgualador,
        completado: colorCompletado,
      },
      operativoCabina: {
        pintor: cabPintor,
        tiempoHorneadoMinutos: cabHorneadoMin,
        temperaturaHornoC: cabTempC,
        tipoTransparente: cabTransparente,
        pulidoListo: cabPulido,
        completado: cabCompletado,
      }
    });

    addAuditLog(
      'Actualización de Módulo Operativo',
      `Fase ${activeTab.toUpperCase()} actualizada para ${currentVehicle.placas}`,
      currentVehicle.expediente
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Hammer className="w-5 h-5 text-[#91B146]" />
            Módulo Operativo por Etapas Técnicas
          </h2>
          <p className="text-xs text-[#939395]">
            Registro de intervenciones mecánicas, banco de estiraje en hojalatería, laboratorio de color y horneado en cabina de pintura.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ¡Parámetros Guardados!
          </span>
        )}
      </div>

      {/* Target Vehicle Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Seleccionar Unidad Activa en Taller:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVehicleId(v.id);
                // Pre-fill state
                if (v.operativoMecanica) {
                  setMecTecnico(v.operativoMecanica.tecnico);
                  setMecHoras(v.operativoMecanica.horasEfectivas);
                  setMecCompletado(v.operativoMecanica.completado);
                }
                if (v.operativoHojalateria) {
                  setHojTecnico(v.operativoHojalateria.tecnico);
                  setHojHoras(v.operativoHojalateria.horasEfectivas);
                  setHojCompletado(v.operativoHojalateria.completado);
                }
              }}
              className={`p-3 rounded-xl border text-left transition ${
                currentVehicle?.id === v.id
                  ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold">{v.placas}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentVehicle?.id === v.id ? 'bg-[#91B146] text-[#1B1B1B]' : 'bg-slate-200 text-slate-700'
                }`}>
                  {v.tallerSubEtapa.toUpperCase()}
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
        <form onSubmit={handleSaveOperational} className="space-y-4">
          
          {/* Sub-stage selector tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            {[
              { id: 'mecanica', label: '1. Mecánica e Impacto', icon: <Wrench className="w-4 h-4" /> },
              { id: 'hojalateria', label: '2. Hojalatería y Banco', icon: <Hammer className="w-4 h-4" /> },
              { id: 'colorLab', label: '3. Laboratorio de Color', icon: <FlaskConical className="w-4 h-4" /> },
              { id: 'cabina', label: '4. Cabina y Horneado', icon: <Flame className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'bg-[#1B1B1B] text-[#91B146] border-[#1B1B1B] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Mecánica */}
          {activeTab === 'mecanica' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#67A0CD]" />
                Intervención Mecánica y Geometría de Suspensión
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mecánico Asignado</label>
                  <input
                    type="text"
                    value={mecTecnico}
                    onChange={(e) => setMecTecnico(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Efectivas Invertidas</label>
                  <input
                    type="number"
                    step="0.5"
                    value={mecHoras}
                    onChange={(e) => setMecHoras(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estatus Mecánico</label>
                  <label className="flex items-center gap-2 mt-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={mecCompletado}
                      onChange={(e) => setMecCompletado(e.target.checked)}
                      className="rounded text-[#91B146] w-4 h-4"
                    />
                    <span>Intervenciones Mecánicas Concluidas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detalle de Trabajos Mecánicos</label>
                <textarea
                  rows={2}
                  value={mecIntervenciones}
                  onChange={(e) => setMecIntervenciones(e.target.value)}
                  placeholder="Suspensión, radiadores, mangueras, terminales, dirección..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={mecAlineacion}
                    onChange={(e) => setMecAlineacion(e.target.checked)}
                    className="rounded text-[#91B146] w-4 h-4"
                  />
                  <span>Alineación computarizada y balanceo por impacto completado</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 2: Hojalatería */}
          {activeTab === 'hojalateria' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Hammer className="w-4 h-4 text-[#1B1B1B]" />
                Enderezado de Chasis, Banco de Estiraje y Soldadura
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hojalatero Responsable</label>
                  <input
                    type="text"
                    value={hojTecnico}
                    onChange={(e) => setHojTecnico(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Efectivas de Chapa</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hojHoras}
                    onChange={(e) => setHojHoras(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estatus Hojalatería</label>
                  <label className="flex items-center gap-2 mt-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hojCompletado}
                      onChange={(e) => setHojCompletado(e.target.checked)}
                      className="rounded text-[#91B146] w-4 h-4"
                    />
                    <span>Lámina Lista para Preparación</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hojBanco}
                      onChange={(e) => setHojBanco(e.target.checked)}
                      className="rounded text-[#91B146] w-4 h-4"
                    />
                    <span>Uso de banco de estiraje con gato hidráulico para descuadre</span>
                  </label>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hojSoldadura}
                      onChange={(e) => setHojSoldadura(e.target.checked)}
                      className="rounded text-[#91B146] w-4 h-4"
                    />
                    <span>Soldadura por puntos MIG / Arco con protección anticorrosiva</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Laboratorio de Color */}
          {activeTab === 'colorLab' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#91B146]" />
                Laboratorio de Colorimétrica y Báscula de Pesaje
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Color OEM</label>
                  <input
                    type="text"
                    value={colorCodigoOEM}
                    onChange={(e) => setColorCodigoOEM(e.target.value)}
                    placeholder="Ej. LC9A, 46G, NH-731P"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Línea / Marca de Pintura</label>
                  <select
                    value={colorMarca}
                    onChange={(e) => setColorMarca(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Axalta Cromax Pro">Axalta Cromax Pro Base Agua</option>
                    <option value="PPG Envirobase">PPG Envirobase High Performance</option>
                    <option value="Sherwin Williams Ultra">Sherwin Williams Ultra 7000</option>
                    <option value="Sikkens Autowave">Sikkens AkzoNobel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Colorista / Igualador</label>
                  <input
                    type="text"
                    value={colorIgualador}
                    onChange={(e) => setColorIgualador(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    Fórmula Pesada en Báscula
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={colorGramos}
                      onChange={(e) => setColorGramos(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                    <span className="font-bold text-slate-600">g</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merma Registrada</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={colorMerma}
                      onChange={(e) => setColorMerma(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-rose-600"
                    />
                    <span className="font-bold text-slate-600">g</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center">
                  <label className="flex items-center gap-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={colorCompletado}
                      onChange={(e) => setColorCompletado(e.target.checked)}
                      className="rounded text-[#91B146] w-4 h-4"
                    />
                    <span>Probeta e Igualación 100% Validada</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Cabina y Horneado */}
          {activeTab === 'cabina' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Cabina de Pintura Presurizada y Ciclo de Horneado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maestro Pintor</label>
                  <input
                    type="text"
                    value={cabPintor}
                    onChange={(e) => setCabPintor(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tiempo de Horneado (Minutos)
                  </label>
                  <input
                    type="number"
                    value={cabHorneadoMin}
                    onChange={(e) => setCabHorneadoMin(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                    Temperatura Cabina (°C)
                  </label>
                  <input
                    type="number"
                    value={cabTempC}
                    onChange={(e) => setCabTempC(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Barniz / Transparente Aplicado</label>
                <input
                  type="text"
                  value={cabTransparente}
                  onChange={(e) => setCabTransparente(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={cabPulido}
                    onChange={(e) => setCabPulido(e.target.checked)}
                    className="rounded text-[#91B146] w-4 h-4"
                  />
                  <span>Pulido, abrillantado y desmanchado de motas listo</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={cabCompletado}
                    onChange={(e) => setCabCompletado(e.target.checked)}
                    className="rounded text-[#91B146] w-4 h-4"
                  />
                  <span>Ciclo de Pintura y Secado Completado al 100%</span>
                </label>
              </div>
            </div>
          )}

          {/* Submit action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Bitácora Operativa
            </button>
          </div>

        </form>
      )}
    </div>
  );
};
