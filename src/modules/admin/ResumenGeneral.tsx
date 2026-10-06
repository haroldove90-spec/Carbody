import React from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { 
  TrendingUp, 
  Car, 
  Receipt, 
  CreditCard, 
  Package, 
  Kanban, 
  ClipboardCheck, 
  Calculator, 
  Award,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ResumenGeneral: React.FC = () => {
  const { 
    vehicles, 
    citas, 
    ordenesCompra, 
    setActiveModule, 
    setSelectedVehicleForWorkflow,
    setCurrentRole 
  } = useCarbody();

  const activeVehicles = vehicles.length;
  const inWorkshop = vehicles.filter(v => v.currentWorkflowStage === 'taller_proceso').length;
  const inValuation = vehicles.filter(v => v.currentWorkflowStage === 'valuacion_inspeccion').length;
  const inQuality = vehicles.filter(v => v.currentWorkflowStage === 'armado_calidad' || v.tallerSubEtapa === 'control_calidad').length;
  const scheduledCitas = citas.filter(c => c.estatus === 'Programada').length;
  
  const totalFacturado = vehicles.reduce((a, v) => a + (v.facturaEmitida?.montoTotal || v.totalPresupuesto || 0), 0);
  const pendingCxC = vehicles.reduce((acc, v) => {
    const totalFact = v.facturaEmitida?.montoTotal || v.totalPresupuesto || 0;
    const pagado = (v.facturaEmitida?.montoCobrado || 0) + (v.deducibleCobrado ? v.deducible : 0);
    return acc + Math.max(0, totalFact - pagado);
  }, 0);
  const pendingCxP = ordenesCompra.filter(o => o.estatusPago !== 'Pagada').reduce((a, o) => a + (o.total - o.montoPagado), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#1B1B1B] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle accent blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#91B146]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#91B146] text-[#1B1B1B]">
              Director General
            </span>
            <span className="text-xs text-slate-300">Carbody Taller de Colisión</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Panel Ejecutivo • Jorge Bernal
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Control integral del taller: flujo de 7 pasos, facturación a aseguradoras (Chubb, GNP), control de almacén y rentabilidad neta por auto.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setActiveModule('flujo_global')}
            className="px-4 py-2.5 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
          >
            <span>Ver Flujo de 7 Pasos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div 
          onClick={() => setActiveModule('kanban')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#91B146] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-bold text-[10px] uppercase tracking-wider">En Taller Activo</span>
            <Car className="w-4 h-4 text-[#91B146]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {inWorkshop}
          </span>
          <span className="text-[11px] text-[#91B146] font-semibold mt-1 block">
            De {activeVehicles} unidades en sistema
          </span>
        </div>

        <div 
          onClick={() => setActiveModule('citas')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#67A0CD] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-bold text-[10px] uppercase tracking-wider">Citas Programadas</span>
            <ClipboardCheck className="w-4 h-4 text-[#67A0CD]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
            {scheduledCitas}
          </span>
          <span className="text-[11px] text-[#67A0CD] font-semibold mt-1 block">
            Ingresos y valuaciones pendientes
          </span>
        </div>

        <div 
          onClick={() => setActiveModule('facturacion')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-bold text-[10px] uppercase tracking-wider">CxC Pendientes</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 block truncate">
            ${pendingCxC.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Por cobrar a aseguradoras
          </span>
        </div>

        <div 
          onClick={() => setActiveModule('cxp')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-bold text-[10px] uppercase tracking-wider">CxP Proveedores</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-800 block truncate">
            ${pendingCxP.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Refacciones por pagar
          </span>
        </div>
      </div>

      {/* Operational Quick Switch Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Módulos Operativos de Acceso Directo
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'citas', role: 'recepcion', label: 'Recepción & Citas', desc: 'Peritaje 360° y agenda', icon: <ClipboardCheck className="w-5 h-5 text-[#91B146]" /> },
            { id: 'valuacion', role: 'valuador', label: 'Valuación & Paneles', desc: 'Tabuladores Chubb/GNP', icon: <Calculator className="w-5 h-5 text-[#67A0CD]" /> },
            { id: 'kanban', role: 'taller', label: 'Kanban de Producción', desc: 'Control de etapas taller', icon: <Kanban className="w-5 h-5 text-[#1B1B1B]" /> },
            { id: 'refacciones', role: 'almacen', label: 'Almacén & Refacciones', desc: 'OC y stock consumibles', icon: <Package className="w-5 h-5 text-[#939395]" /> },
          ].map((card) => (
            <button
              key={card.id}
              onClick={() => {
                setCurrentRole(card.role as any);
                setActiveModule(card.id);
              }}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:shadow-md hover:border-slate-300 transition group"
            >
              <div className="p-2 rounded-xl bg-slate-50 w-fit mb-2 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#91B146] transition-colors">
                {card.label}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Vehicles Pipeline Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Expedientes Recientes en Proceso
          </h3>
          <button
            onClick={() => setActiveModule('flujo_global')}
            className="text-xs font-bold text-[#91B146] hover:underline flex items-center gap-1"
          >
            <span>Ver todos ({vehicles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {vehicles.slice(0, 5).map((v) => (
            <div
              key={v.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold font-mono text-xs text-slate-800 shrink-0">
                  {v.placas.slice(0, 3)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900">
                      {v.marca} {v.submarca} {v.modeloAnio}
                    </h4>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {v.placas}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-blue-50 text-blue-700">
                      {v.procedencia}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cliente: {v.clienteNombre} • Siniestro: <strong className="text-slate-700">{v.siniestro}</strong> • Ingreso: {v.fechaIngreso}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-900 block">
                    ${v.totalPresupuesto.toLocaleString()} MXN
                  </span>
                  <span className="text-[10px] font-semibold text-[#91B146] uppercase">
                    Etapa: {v.tallerSubEtapa}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedVehicleForWorkflow(v)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Ver línea de 7 pasos"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
