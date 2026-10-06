import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { OrdenCompra } from '../../types';
import { 
  CreditCard, 
  Plus, 
  Truck, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  Search
} from 'lucide-react';

export const ProveedoresCxP: React.FC = () => {
  const { ordenesCompra, addOrdenCompra, updateOrdenCompra, addAuditLog, vehicles } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Pagada' | 'Vencida'>('all');
  const [showNewOCModal, setShowNewOCModal] = useState(false);

  // New OC Form
  const [proveedor, setProveedor] = useState('Autopartes Originales CDMX');
  const [expedienteVinculado, setExpedienteVinculado] = useState(vehicles[0]?.expediente || 'EXP-2026-001');
  const [piezaDesc, setPiezaDesc] = useState('');
  const [piezaCantidad, setPiezaCantidad] = useState(1);
  const [piezaPrecio, setPiezaPrecio] = useState(3500);
  const [diasCredito, setDiasCredito] = useState(30);
  const [numeroGuia, setNumeroGuia] = useState('');

  const filteredOCs = ordenesCompra.filter(o => {
    const matchSearch = 
      o.numeroOC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.expedienteVinculado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.estatusPago === statusFilter;
    return matchSearch && matchStatus;
  });

  // CxP Metrics
  const totalCxP = ordenesCompra.filter(o => o.estatusPago !== 'Pagada').reduce((acc, o) => acc + (o.total - o.montoPagado), 0);
  const totalPagado = ordenesCompra.reduce((acc, o) => acc + o.montoPagado, 0);
  const countPendientes = ordenesCompra.filter(o => o.estatusPago === 'Pendiente').length;

  const handleCreateOC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!piezaDesc) return;

    const fechaHoy = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + diasCredito);

    const targetVehicle = vehicles.find(v => v.expediente === expedienteVinculado);
    const numOC = `OC-2026-${Math.floor(100 + Math.random() * 900)}`;

    addOrdenCompra({
      numeroOC: numOC,
      proveedor,
      expedienteVinculado,
      siniestro: targetVehicle?.siniestro || 'SIN-ASIGNAR',
      fecha: fechaHoy.toISOString().slice(0, 10),
      piezas: [
        {
          descripcion: piezaDesc,
          cantidad: piezaCantidad,
          precioUnitario: piezaPrecio,
        }
      ],
      total: piezaCantidad * piezaPrecio,
      estatus: 'Emitida',
      numeroGuia: numeroGuia || 'PENDIENTE-GUIA',
      diasCredito,
      estatusPago: 'Pendiente',
      fechaVencimiento: dueDate.toISOString().slice(0, 10),
      montoPagado: 0
    });

    setShowNewOCModal(false);
    setPiezaDesc('');
  };

  const handlePayOC = (ocId: string, total: number) => {
    updateOrdenCompra(ocId, {
      estatusPago: 'Pagada',
      montoPagado: total
    });
    addAuditLog('Pago a Proveedor Realizado', `Liquidada OC ${ocId} por $${total.toLocaleString()} MXN`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#67A0CD]" />
            Proveedores y Cuentas por Pagar (CxP)
          </h2>
          <p className="text-xs text-[#939395]">
            Órdenes de compra, recepción física de autopartes vs. factura y calendario de pagos con condiciones de crédito.
          </p>
        </div>

        <button
          onClick={() => setShowNewOCModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Orden de Compra (OC)</span>
        </button>
      </div>

      {/* CxP Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Saldo Pendiente por Pagar (CxP)
          </span>
          <span className="text-xl font-black text-rose-600">
            ${totalCxP.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            {countPendientes} órdenes con saldo pendiente a proveedores
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Liquidado a Proveedores
          </span>
          <span className="text-xl font-black text-emerald-600">
            ${totalPagado.toLocaleString()} MXN
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Pagos conciliados con comprobante bancario
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Condiciones de Crédito Promedio
          </span>
          <span className="text-xl font-black text-slate-900">
            25 Días
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Plazos convenidos (15, 30 y 45 días)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de OC, proveedor o expediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'Pendiente', 'Pagada'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                <th className="py-3 px-4">No. OC / Fecha</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Expediente / Siniestro</th>
                <th className="py-3 px-4">Refacción Solicitada</th>
                <th className="py-3 px-4 text-center">No. Guía Paquetería</th>
                <th className="py-3 px-4 text-right">Importe Total</th>
                <th className="py-3 px-4 text-center">Estatus Pago</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOCs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron órdenes de compra registradas.
                  </td>
                </tr>
              ) : (
                filteredOCs.map((oc) => (
                  <tr key={oc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{oc.numeroOC}</span>
                      <span className="text-[10px] text-slate-400">{oc.fecha}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {oc.proveedor}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{oc.expedienteVinculado}</span>
                      <span className="text-[10px] text-slate-500">{oc.siniestro}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {oc.piezas.map(p => `${p.cantidad}x ${p.descripcion}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {oc.numeroGuia || 'Local'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ${oc.total.toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        oc.estatusPago === 'Pagada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {oc.estatusPago} (Vence {oc.fechaVencimiento})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {oc.estatusPago !== 'Pagada' && (
                        <button
                          onClick={() => handlePayOC(oc.id, oc.total)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs"
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New OC Modal */}
      {showNewOCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#91B146]" />
                Nueva Orden de Compra (OC)
              </h3>
              <button onClick={() => setShowNewOCModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOC} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proveedor</label>
                  <select
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="Autopartes Originales CDMX">Autopartes Originales CDMX</option>
                    <option value="Distribuidora Automotriz del Centro">Distribuidora Automotriz del Centro</option>
                    <option value="Pinturas y Recubrimientos PPG Pro">Pinturas y Recubrimientos PPG Pro</option>
                    <option value="Axalta Coating Systems México">Axalta Coating Systems México</option>
                    <option value="Cristales y Parabrisas de Oriente">Cristales y Parabrisas de Oriente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expediente Vinculado</label>
                  <select
                    value={expedienteVinculado}
                    onChange={(e) => setExpedienteVinculado(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.expediente}>
                        {v.expediente} ({v.placas}) - {v.marca}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción de la Autoparte / Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cofre OEM, Radiador de aluminio, Espejo eléctrico..."
                  value={piezaDesc}
                  onChange={(e) => setPiezaDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={piezaCantidad}
                    onChange={(e) => setPiezaCantidad(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={piezaPrecio}
                    onChange={(e) => setPiezaPrecio(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Días de Crédito</label>
                  <select
                    value={diasCredito}
                    onChange={(e) => setDiasCredito(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value={0}>0 días (Contado)</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                    <option value={45}>45 días</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Guía / Paquetería (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. FEDEX-9810234 o ESTAFETA-1124"
                  value={numeroGuia}
                  onChange={(e) => setNumeroGuia(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOCModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Emitir Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
