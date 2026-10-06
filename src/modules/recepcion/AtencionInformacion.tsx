import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { WORKFLOW_STAGES, VehicleRecord } from '../../types';
import { 
  MessageSquare, 
  Search, 
  Car, 
  Phone, 
  Share2, 
  Check, 
  Send, 
  Clock, 
  Shield, 
  Copy,
  ExternalLink
} from 'lucide-react';

export const AtencionInformacion: React.FC = () => {
  const { vehicles, setSelectedVehicleForWorkflow, addAuditLog } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(vehicles[0] || null);
  const [msgTemplateType, setMsgTemplateType] = useState<
    'ingreso' | 'valuacion' | 'taller' | 'calidad' | 'entrega'
  >('ingreso');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const filteredVehicles = vehicles.filter(v => 
    v.placas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.siniestro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Active target vehicle
  const currentVeh = selectedVehicle || vehicles[0];

  // Generate dynamic message content
  const generateMessage = () => {
    if (!currentVeh) return '';
    const cleanPhone = currentVeh.clienteTelefono.replace(/\D/g, '');
    const vehName = `${currentVeh.marca} ${currentVeh.submarca} (${currentVeh.placas})`;

    switch (msgTemplateType) {
      case 'ingreso':
        return `Hola estimado(a) ${currentVeh.clienteNombre}, le saludamos de Carbody Hojalatería y Pintura. Le informamos que su vehículo ${vehName} con número de siniestro ${currentVeh.siniestro} (${currentVeh.procedencia}) ha ingresado exitosamente a nuestras instalaciones y se ha completado el inventario de recepción. En breve nuestro valuador comenzará el peritaje técnico. Cualquier duda estamos a sus órdenes.`;
      case 'valuacion':
        return `Estimado(a) ${currentVeh.clienteNombre}, le notificamos que el presupuesto de reparación para su ${vehName} (Siniestro: ${currentVeh.siniestro}) ha sido concluido y enviado a ${currentVeh.procedencia} para su respectiva autorización de refacciones y mano de obra. Le mantendremos informado de la confirmación.`;
      case 'taller':
        return `Actualización Carbody: Su vehículo ${vehName} se encuentra en etapa activa de taller (${currentVeh.tallerSubEtapa.toUpperCase()}). Los técnicos especializados se encuentran trabajando en el enderezado y preparación de piezas para garantizar los acabados de fábrica. Fecha estimada de entrega: ${currentVeh.fechaPromesaEntrega}.`;
      case 'calidad':
        return `Estimado(a) ${currentVeh.clienteNombre}, su vehículo ${vehName} ha pasado al área de Control de Calidad y Detallado final. Estamos verificando tolerancias milimétricas de ensambles y tono de pintura para garantizar un acabado impecable.`;
      case 'entrega':
        return `¡Excelentes noticias ${currentVeh.clienteNombre}! Su vehículo ${vehName} está 100% terminado, pulido y listo para entrega en Carbody. Puede pasar a recogerlo en nuestro horario de servicio. Deducible pactado: $${currentVeh.deducible.toLocaleString()} MXN. ¡Le esperamos!`;
    }
  };

  const currentMsg = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!currentVeh) return;
    const cleanPhone = currentVeh.clienteTelefono.replace(/\D/g, '');
    const url = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(currentMsg)}`;
    window.open(url, '_blank');
    addAuditLog('Aviso WhatsApp Enviado', `Plantilla: ${msgTemplateType} a ${currentVeh.clienteNombre} (${currentVeh.placas})`, currentVeh.expediente);
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#67A0CD]" />
          Atención e Información al Cliente / Ajustador
        </h2>
        <p className="text-xs text-[#939395]">
          Consulta instantánea del estatus de la unidad y envío de notificaciones automáticas por WhatsApp / SMS sobre el avance del vehículo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left column: Vehicle selector and search */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa, cliente o siniestro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
            />
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredVehicles.map((v) => {
              const isSelected = currentVeh?.id === v.id;
              const currentStage = WORKFLOW_STAGES.find(s => s.id === v.currentWorkflowStage);

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white border-[#91B146] shadow-sm ring-2 ring-[#91B146]/20'
                      : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {v.placas}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {v.procedencia}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 truncate">
                    {v.marca} {v.submarca} {v.modeloAnio}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {v.clienteNombre} • {v.clienteTelefono}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Siniestro: {v.siniestro}</span>
                    <span className="font-bold text-[#91B146]">
                      {currentStage?.shortLabel || 'En Taller'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Status Display & WhatsApp Generator */}
        <div className="lg:col-span-7 space-y-4">
          {currentVeh ? (
            <>
              {/* Unit Status Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Expediente {currentVeh.expediente}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentVeh.marca} {currentVeh.submarca} {currentVeh.modeloAnio}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedVehicleForWorkflow(currentVeh)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold self-start"
                  >
                    <span>Ver Línea de 7 Pasos</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Siniestro / Póliza</span>
                    <span className="font-bold text-slate-900">{currentVeh.siniestro}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Canal / Aseguradora</span>
                    <span className="font-bold text-slate-900">{currentVeh.procedencia}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Sub-etapa Producción</span>
                    <span className="font-bold text-[#91B146] uppercase">{currentVeh.tallerSubEtapa}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Promesa de Entrega</span>
                    <span className="font-bold text-slate-900">{currentVeh.fechaPromesaEntrega}</span>
                  </div>
                </div>
              </div>

              {/* Automated Notification Generator */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#91B146]" />
                    Generador de Avisos Automatizados
                  </h4>

                  {sentNotice && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ¡Mensaje enviado!
                    </span>
                  )}
                </div>

                {/* Template Selector */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'ingreso', label: '1. Ingreso e Inventario' },
                    { id: 'valuacion', label: '2. Valuación Concluida' },
                    { id: 'taller', label: '3. En Proceso de Taller' },
                    { id: 'calidad', label: '4. Control de Calidad' },
                    { id: 'entrega', label: '5. ¡Listo para Entrega!' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setMsgTemplateType(tpl.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                        msgTemplateType === tpl.id
                          ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Message preview textarea */}
                <div className="relative">
                  <textarea
                    rows={5}
                    readOnly
                    value={currentMsg}
                    className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl font-mono leading-relaxed"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Send triggers */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Destinatario: <strong className="text-slate-800">{currentVeh.clienteTelefono}</strong>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSendWhatsApp}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Selecciona una unidad de la lista izquierda para consultar su estatus y generar avisos.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
