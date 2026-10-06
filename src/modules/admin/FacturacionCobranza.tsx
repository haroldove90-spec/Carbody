import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord } from '../../types';
import { 
  Receipt, 
  CreditCard, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2,
  Search
} from 'lucide-react';

export const FacturacionCobranza: React.FC = () => {
  const { vehicles, updateVehicle, addAuditLog } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState<VehicleRecord | null>(null);
  
  // Invoice form state
  const [folioCFDI, setFolioCFDI] = useState('');
  const [montoTotal, setMontoTotal] = useState(0);
  const [montoCobrado, setMontoCobrado] = useState(0);
  const [metodoPago, setMetodoPago] = useState<'Transferencia' | 'Efectivo' | 'Tarjeta TPV'>('Transferencia');

  const filteredVehicles = vehicles.filter(v =>
    v.placas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.siniestro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Financial aggregates
  const totalFacturado = vehicles.reduce((acc, v) => acc + (v.facturaEmitida?.montoTotal || 0), 0);
  const totalCobrado = vehicles.reduce((acc, v) => acc + (v.facturaEmitida?.montoCobrado || 0) + (v.deducibleCobrado ? v.deducible : 0), 0);
  const totalCxCPendiente = vehicles.reduce((acc, v) => {
    const totalFact = v.facturaEmitida?.montoTotal || v.totalPresupuesto || 0;
    const pagado = (v.facturaEmitida?.montoCobrado || 0) + (v.deducibleCobrado ? v.deducible : 0);
    return acc + Math.max(0, totalFact - pagado);
  }, 0);

  const handleOpenInvoiceModal = (veh: VehicleRecord) => {
    setShowInvoiceModal(veh);
    setFolioCFDI(veh.facturaEmitida?.folioCFDI || `CFDI-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setMontoTotal(veh.facturaEmitida?.montoTotal || veh.totalPresupuesto || 15000);
    setMontoCobrado(veh.facturaEmitida?.montoCobrado || veh.deducible || 0);
    setMetodoPago(veh.facturaEmitida?.metodoPago || 'Transferencia');
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInvoiceModal) return;

    const estatusCobro = montoCobrado >= montoTotal ? 'Cobrado' : montoCobrado > 0 ? 'Parcial' : 'Pendiente';

    updateVehicle(showInvoiceModal.id, {
      facturaEmitida: {
        folioCFDI,
        montoTotal,
        fechaEmision: new Date().toISOString().slice(0, 10),
        estatusCobro,
        montoCobrado,
        metodoPago
      },
      deducibleCobrado: true
    });

    addAuditLog(
      'CFDI y Cobro Registrado',
      `Factura ${folioCFDI} por $${montoTotal.toLocaleString()} MXN asociada al siniestro ${showInvoiceModal.siniestro}. Cobrado: $${montoCobrado.toLocaleString()} vía ${metodoPago}`,
      showInvoiceModal.expediente
    );

    setShowInvoiceModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#91B146]" />
            Facturación y Cuentas por Cobrar (CxC)
          </h2>
          <p className="text-xs text-[#939395]">
            Emisión de CFDI asociados al expediente o siniestro, control de saldos de aseguradoras (Chubb, GNP) y cobro de deducibles.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Saldo Pendiente por Cobrar (CxC)
          </span>
          <span className="text-xl font-black text-rose-600">
            ${totalCxCPendiente.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Saldos a recuperar de Chubb, GNP y créditos de flotilla
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Cobrado y Liquidado
          </span>
          <span className="text-xl font-black text-emerald-600">
            ${totalCobrado.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Deducibles cobrados + Pagos de aseguradora aplicados
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Facturación Total Emitida
          </span>
          <span className="text-xl font-black text-slate-900">
            ${totalFacturado.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            CFDI timbrados en el periodo
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar expediente, placa o número de siniestro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
        />
      </div>

      {/* Invoicing Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                <th className="py-3 px-4">Expediente / Siniestro</th>
                <th className="py-3 px-4">Vehículo / Cliente</th>
                <th className="py-3 px-4">Canal / Aseguradora</th>
                <th className="py-3 px-4 text-right">Deducible</th>
                <th className="py-3 px-4 text-center">Folio Factura CFDI</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-center">Estatus Cobro</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((v) => {
                const invoice = v.facturaEmitida;
                const status = invoice?.estatusCobro || (v.deducibleCobrado ? 'Parcial' : 'Pendiente');

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{v.expediente}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{v.siniestro}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {v.marca} {v.submarca} ({v.placas})
                      </span>
                      <span className="text-[11px] text-slate-400">{v.clienteNombre}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {v.procedencia}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      ${v.deducible.toLocaleString()} MXN
                      <span className={`block text-[10px] font-bold ${
                        v.deducibleCobrado ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {v.deducibleCobrado ? 'Liquidado' : 'Por cobrar'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {invoice?.folioCFDI || 'Sin Factura'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ${(invoice?.montoTotal || v.totalPresupuesto).toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        status === 'Cobrado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'Parcial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenInvoiceModal(v)}
                        className="px-3 py-1.5 bg-[#1B1B1B] hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition"
                      >
                        {invoice ? 'Gestionar Cobro' : 'Emitir Factura'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#91B146]" />
                Emisión de CFDI y Registro de Cobro
              </h3>
              <button onClick={() => setShowInvoiceModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] block">Expediente:</span>
                <span className="font-bold text-slate-900">
                  {showInvoiceModal.expediente} • {showInvoiceModal.marca} {showInvoiceModal.submarca} ({showInvoiceModal.placas})
                </span>
                <span className="text-slate-600 block text-[11px]">
                  Aseguradora: {showInvoiceModal.procedencia} (Siniestro {showInvoiceModal.siniestro})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Folio Fiscal CFDI</label>
                <input
                  type="text"
                  required
                  value={folioCFDI}
                  onChange={(e) => setFolioCFDI(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto Total Facturado ($)</label>
                  <input
                    type="number"
                    required
                    value={montoTotal}
                    onChange={(e) => setMontoTotal(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto Cobrado Hoy ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={montoCobrado}
                    onChange={(e) => setMontoCobrado(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Método de Cobro</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Transferencia', 'Efectivo', 'Tarjeta TPV'] as const).map((met) => (
                    <button
                      key={met}
                      type="button"
                      onClick={() => setMetodoPago(met)}
                      className={`p-2 rounded-lg border font-semibold text-center transition ${
                        metodoPago === met
                          ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {met}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Factura y Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
