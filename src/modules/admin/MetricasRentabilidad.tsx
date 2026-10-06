import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Percent, 
  Car, 
  BarChart3, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const MetricasRentabilidad: React.FC = () => {
  const { vehicles } = useCarbody();
  const [selectedProcedencia, setSelectedProcedencia] = useState<string>('all');

  const filteredVehicles = vehicles.filter(v =>
    selectedProcedencia === 'all' || v.procedencia === selectedProcedencia
  );

  // Financial margin calculations
  const calculateVehicleFinancials = (v: typeof vehicles[0]) => {
    const revenue = v.facturaEmitida?.montoTotal || v.totalPresupuesto || 0;
    const costoRefacciones = v.piezasValuadas.reduce((a, b) => a + (b.costoRefaccion || 0), 0);
    const costoPintura = v.piezasValuadas.reduce((a, b) => a + (b.costoPintura || 0), 0);
    const horasTotales = v.piezasValuadas.reduce((a, b) => a + b.horasHojalateria + b.horasMecanica, 0);
    // Average internal labor technician cost $180/hr
    const costoManoObraInterna = horasTotales * 180;
    const costoTotal = costoRefacciones + costoPintura + costoManoObraInterna;
    const margen = revenue - costoTotal;
    const margenPorcentaje = revenue > 0 ? ((margen / revenue) * 100).toFixed(1) : '0';

    // Cycle time calculation
    const ingreso = new Date(v.fechaIngreso);
    const entrega = v.fechaEntregaReal ? new Date(v.fechaEntregaReal) : new Date();
    const diffTime = Math.abs(entrega.getTime() - ingreso.getTime());
    const diasEstancia = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      revenue,
      costoRefacciones,
      costoPintura,
      costoManoObraInterna,
      costoTotal,
      margen,
      margenPorcentaje,
      diasEstancia
    };
  };

  const totalRevenue = filteredVehicles.reduce((acc, v) => acc + calculateVehicleFinancials(v).revenue, 0);
  const totalCosts = filteredVehicles.reduce((acc, v) => acc + calculateVehicleFinancials(v).costoTotal, 0);
  const totalMargin = totalRevenue - totalCosts;
  const overallMarginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : '0';

  const avgCycleDays = filteredVehicles.length > 0
    ? (filteredVehicles.reduce((acc, v) => acc + calculateVehicleFinancials(v).diasEstancia, 0) / filteredVehicles.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#91B146]" />
            Métricas de Rentabilidad y Tiempos de Ciclo
          </h2>
          <p className="text-xs text-[#939395]">
            Margen neto por siniestro (Importe cobrado vs. Refacciones + Pintura + Mano de obra) y días de estancia en taller.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Chubb', 'GNP', 'Renta de autos', 'Particular'].map((proc) => (
            <button
              key={proc}
              onClick={() => setSelectedProcedencia(proc)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                selectedProcedencia === proc
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {proc === 'all' ? 'Todos' : proc}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Ingresos Totales Valuados
          </span>
          <span className="text-xl font-black text-slate-900">
            ${totalRevenue.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Facturado y por cobrar</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Costo Directo Operativo
          </span>
          <span className="text-xl font-black text-slate-700">
            ${totalCosts.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Refacciones + Químicos + Nómina técnica</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Margen Bruto de Ganancia
          </span>
          <span className="text-xl font-black text-[#91B146]">
            ${totalMargin.toLocaleString()} MXN ({overallMarginPercent}%)
          </span>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Saludable (+35% meta)</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Tiempo de Ciclo Promedio
          </span>
          <span className="text-xl font-black text-[#67A0CD]">
            {avgCycleDays} Días
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Días estancia ingreso a entrega</p>
        </div>
      </div>

      {/* Per-Car Profitability Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Rentabilidad Individual por Expediente y Siniestro
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {filteredVehicles.length} unidades analizadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase bg-slate-50/50">
                <th className="py-3 px-4">Vehículo / Placas</th>
                <th className="py-3 px-4">Aseguradora / Siniestro</th>
                <th className="py-3 px-4 text-center">Días de Estancia</th>
                <th className="py-3 px-4 text-right">Costo Refacciones</th>
                <th className="py-3 px-4 text-right">Costo Pintura</th>
                <th className="py-3 px-4 text-right">Costo Mano Obra</th>
                <th className="py-3 px-4 text-right">Importe Facturado</th>
                <th className="py-3 px-4 text-right">Margen Neto ($)</th>
                <th className="py-3 px-4 text-center">Margen (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((v) => {
                const fin = calculateVehicleFinancials(v);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{v.marca} {v.submarca}</span>
                      <span className="font-mono text-[11px] text-slate-500">{v.placas}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{v.procedencia}</span>
                      <span className="text-[11px] text-slate-400">{v.siniestro}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {fin.diasEstancia} días
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      ${fin.costoRefacciones.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      ${fin.costoPintura.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      ${fin.costoManoObraInterna.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${fin.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#91B146]">
                      ${fin.margen.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {fin.margenPorcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
