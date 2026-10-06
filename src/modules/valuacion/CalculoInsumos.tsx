import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { Layers, Droplets, Wrench, Shield, CheckCircle2, RefreshCw } from 'lucide-react';

export const CalculoInsumos: React.FC = () => {
  const { vehicles } = useCarbody();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  
  // Custom interactive calculation parameters
  const [numPanelesPintura, setNumPanelesPintura] = useState(3);
  const [tipoPintura, setTipoPintura] = useState<'Bicapa' | 'Tricapa Perlado' | 'Monocapa'>('Bicapa');
  const [horasHojalateriaTotal, setHorasHojalateriaTotal] = useState(8);
  const [horasMecanicaTotal, setHorasMecanicaTotal] = useState(2);
  const [costoHoraManoObra, setCostoHoraManoObra] = useState(380);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Material estimations per panel formulas
  const factorPintura = tipoPintura === 'Tricapa Perlado' ? 1.4 : tipoPintura === 'Bicapa' ? 1.0 : 0.8;
  const litrosFondoPrimer = (numPanelesPintura * 0.25).toFixed(2);
  const gramosBaseColor = Math.round(numPanelesPintura * 180 * factorPintura);
  const litrosTransparenteClear = (numPanelesPintura * 0.30).toFixed(2);
  const litrosThinnerDiluyente = (numPanelesPintura * 0.40).toFixed(2);
  const pliegosLijasVarias = numPanelesPintura * 4;

  const costoMaterialesEstimado = Math.round(
    (Number(litrosFondoPrimer) * 590) +
    (gramosBaseColor * 1.8) +
    (Number(litrosTransparenteClear) * 890) +
    (Number(litrosThinnerDiluyente) * 95) +
    (pliegosLijasVarias * 20)
  );

  const costoManoObraEstimado = (horasHojalateriaTotal + horasMecanicaTotal) * costoHoraManoObra;
  const totalEstimado = costoMaterialesEstimado + costoManoObraEstimado;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#91B146]" />
          Cálculo de Insumos y Mano de Obra Técnica
        </h2>
        <p className="text-xs text-[#939395]">
          Estimación volumétrica de materiales de pintura (fondo, base color, transparente, diluyentes) y horas hombre de hojalatería y mecánica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Input controls */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Variables de Estimación del Siniestro
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expediente / Vehículo Base:
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placas} - {v.marca} {v.submarca} ({v.procedencia})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número de Paneles a Pintar
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={numPanelesPintura}
                  onChange={(e) => setNumPanelesPintura(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-center"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Acabado de Pintura OEM
                </label>
                <select
                  value={tipoPintura}
                  onChange={(e) => setTipoPintura(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Bicapa">Bicapa Convencional</option>
                  <option value="Tricapa Perlado">Tricapa Perlado / Candy</option>
                  <option value="Monocapa">Monocapa Sólido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Horas de Hojalatería (Enderezado/Armado)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={horasHojalateriaTotal}
                  onChange={(e) => setHorasHojalateriaTotal(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Horas de Mecánica Ligera / Alineación
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={horasMecanicaTotal}
                  onChange={(e) => setHorasMecanicaTotal(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tabulador de Mano de Obra ($/Hora Convenida)
              </label>
              <input
                type="number"
                value={costoHoraManoObra}
                onChange={(e) => setCostoHoraManoObra(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-[#67A0CD]"
              />
            </div>
          </div>
        </div>

        {/* Right: Technical Output & Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Insumos Pintura card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#67A0CD]" />
              Insumos de Pintura Calculados ({numPanelesPintura} Paneles • {tipoPintura})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Primer / Fondo 2K</span>
                <span className="font-bold text-slate-900">{litrosFondoPrimer} Lts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Base Color OEM</span>
                <span className="font-bold text-[#91B146]">{gramosBaseColor} Gramos</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Transparente Clear 2K</span>
                <span className="font-bold text-slate-900">{litrosTransparenteClear} Lts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Thínner Fino Diluyente</span>
                <span className="font-bold text-slate-900">{litrosThinnerDiluyente} Lts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-2">
                <span className="text-slate-400 text-[10px] block">Abrasivos / Lijas (P80 a P2500)</span>
                <span className="font-bold text-slate-900">{pliegosLijasVarias} Pliegos / Discos</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Subtotal Estimado en Químicos:</span>
              <span className="font-bold text-slate-900">${costoMaterialesEstimado.toLocaleString()} MXN</span>
            </div>
          </div>

          {/* Mano de Obra Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#1B1B1B]" />
              Resumen de Mano de Obra
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Total Horas Hombre</span>
                <span className="font-bold text-slate-900 text-sm">
                  {horasHojalateriaTotal + horasMecanicaTotal} Horas
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Importe Mano de Obra</span>
                <span className="font-bold text-slate-900 text-sm">
                  ${costoManoObraEstimado.toLocaleString()} MXN
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Presupuesto Técnico Sugerido
                </span>
                <span className="text-lg font-black text-[#91B146]">
                  ${totalEstimado.toLocaleString()} MXN
                </span>
              </div>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-medium text-slate-300">
                Sin IVA / Sin Refacciones
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
