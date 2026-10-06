import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { ConsumibleInventario } from '../../types';
import { 
  Boxes, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  RefreshCw, 
  Tag, 
  TrendingDown, 
  Search,
  Filter
} from 'lucide-react';

export const InventarioConsumibles: React.FC = () => {
  const { consumibles, updateConsumibleStock, restockConsumible } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showRestockModal, setShowRestockModal] = useState<ConsumibleInventario | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);

  const categories = ['all', 'Masillas', 'Lijas', 'Primers / Fondos', 'Transparentes / Barnices', 'Thínners / Solventes', 'Pulimentos'];

  const filteredItems = consumibles.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || c.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  const lowStockCount = consumibles.filter(c => c.stockActual <= c.stockMinimo).length;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal) return;
    restockConsumible(showRestockModal.id, restockAmount);
    setShowRestockModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#91B146]" />
            Inventario Interno de Consumibles de Alta Rotación
          </h2>
          <p className="text-xs text-[#939395]">
            Control de stock en tiempo real de masillas, lijas granos 80 a 3000, fondos/primers, transparentes y solventes.
          </p>
        </div>

        {lowStockCount > 0 && (
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {lowStockCount} Insumos bajo punto de reorden
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar insumo químico, grano de lija o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Consumables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isLowStock = item.stockActual <= item.stockMinimo;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-xs flex flex-col justify-between ${
                isLowStock
                  ? 'border-amber-300 ring-2 ring-amber-400/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.categoria}
                  </span>
                  {isLowStock && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Reorden
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {item.nombre}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ubicación: <strong className="text-slate-600">{item.ubicacion}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Stock Actual</span>
                    <span className={`text-xl font-black ${
                      isLowStock ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {item.stockActual} <span className="text-xs font-medium text-slate-500">{item.unidad}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Mínimo</span>
                    <span className="text-xs font-bold text-slate-600">
                      {item.stockMinimo} {item.unidad}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowRestockModal(item);
                    setRestockAmount(10);
                  }}
                  className="w-full py-1.5 bg-slate-100 hover:bg-[#91B146] hover:text-white text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reabastecer</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#91B146]" />
                Reabastecer Consumible
              </h3>
              <button onClick={() => setShowRestockModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{showRestockModal.nombre}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Stock actual: {showRestockModal.stockActual} {showRestockModal.unidad} (Punto mínimo: {showRestockModal.stockMinimo})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cantidad a ingresar ({showRestockModal.unidad})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-center text-lg"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 25, 50].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setRestockAmount(quick)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                  >
                    +{quick}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
