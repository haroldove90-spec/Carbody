import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { Cita, Procedencia } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User, 
  Phone, 
  Car, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  ShieldAlert
} from 'lucide-react';

export const AgendaCitas: React.FC = () => {
  const { citas, addCita, updateCita, setActiveModule } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedencia, setSelectedProcedencia] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    hora: '10:00',
    clienteNombre: '',
    telefono: '',
    email: '',
    procedencia: 'Chubb' as Procedencia,
    vehiculoInfo: '',
    placas: '',
    motivo: 'Ingreso por siniestro' as Cita['motivo'],
    notas: ''
  });

  const filteredCitas = citas.filter((c) => {
    const matchSearch = 
      c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehiculoInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.placas && c.placas.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchProc = selectedProcedencia === 'all' || c.procedencia === selectedProcedencia;
    return matchSearch && matchProc;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteNombre || !formData.telefono || !formData.vehiculoInfo) {
      alert('Por favor completa el nombre del cliente, teléfono y datos del vehículo.');
      return;
    }

    addCita({
      ...formData,
      estatus: 'Programada'
    });

    setShowNewModal(false);
    setFormData({
      fecha: new Date().toISOString().slice(0, 10),
      hora: '10:00',
      clienteNombre: '',
      telefono: '',
      email: '',
      procedencia: 'Chubb',
      vehiculoInfo: '',
      placas: '',
      motivo: 'Ingreso por siniestro',
      notas: ''
    });
  };

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B]">Agenda y Citas de Ingreso</h2>
          <p className="text-xs text-[#939395]">
            Agendamiento de citas de ingreso, valuación y canal de procedencia (Chubb, GNP, Renta de autos, Lote o Particular).
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, placas o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden lg:inline">Procedencia:</span>
          {['all', 'Chubb', 'GNP', 'Renta de autos', 'Lote', 'Particular'].map((proc) => (
            <button
              key={proc}
              onClick={() => setSelectedProcedencia(proc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedProcedencia === proc
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {proc === 'all' ? 'Todas' : proc}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment cards list */}
      {filteredCitas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No hay citas registradas</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Utiliza el botón superior para agendar una nueva cita de ingreso o valuación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCitas.map((cita) => {
            const isToday = cita.fecha === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={cita.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3.5 relative overflow-hidden"
              >
                {/* Accent top stripe */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    backgroundColor: 
                      cita.procedencia === 'Chubb' ? '#67A0CD' :
                      cita.procedencia === 'GNP' ? '#91B146' :
                      cita.procedencia === 'Renta de autos' ? '#939395' : '#1B1B1B'
                  }}
                />

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {cita.procedencia}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {cita.clienteNombre}
                    </h3>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    cita.estatus === 'Programada'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : cita.estatus === 'Atendida'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {cita.estatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{cita.fecha}</span>
                    <span className="text-slate-400">•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{cita.hora} hrs</span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 rounded">HOY</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{cita.vehiculoInfo}</span>
                    {cita.placas && (
                      <span className="font-mono text-[11px] font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">
                        {cita.placas}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cita.telefono}</span>
                  </div>
                </div>

                {cita.notas && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/60 border border-amber-200/50 p-2 rounded-lg">
                    "{cita.notas}"
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Motivo: <strong className="text-slate-700">{cita.motivo}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {cita.estatus === 'Programada' && (
                      <>
                        <button
                          onClick={() => {
                            updateCita(cita.id, { estatus: 'Atendida' });
                            setActiveModule('recepcion');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-[#91B146] hover:bg-[#7e9c3b] rounded-lg transition"
                          title="Marcar como atendida y pasar a Recepción e Inventario"
                        >
                          Recibir Auto
                        </button>
                        <button
                          onClick={() => updateCita(cita.id, { estatus: 'Cancelada' })}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Cancelar cita"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#1B1B1B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#91B146]" />
                Agendar Cita de Ingreso / Valuación
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Canal de Procedencia</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chubb', 'GNP', 'Renta de autos', 'Lote', 'Particular'] as Procedencia[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setFormData({ ...formData, procedencia: p })}
                      className={`p-2 rounded-lg border font-semibold text-center transition ${
                        formData.procedencia === p
                          ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente / Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={formData.clienteNombre}
                    onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 55 4920 1823"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehículo (Marca, Submarca, Año)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. VW Jetta 2023 Blanco"
                    value={formData.vehiculoInfo}
                    onChange={(e) => setFormData({ ...formData, vehiculoInfo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placas (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. NXX-492-B"
                    value={formData.placas}
                    onChange={(e) => setFormData({ ...formData, placas: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo de la Cita</label>
                <select
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Ingreso por siniestro">Ingreso por siniestro</option>
                  <option value="Valuación presencial">Valuación presencial con ajustador</option>
                  <option value="Revisión de avance">Revisión de avance con cliente</option>
                  <option value="Entrega final">Entrega final del vehículo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Siniestro o Póliza</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del golpe, número de reporte o póliza de aseguradora..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
