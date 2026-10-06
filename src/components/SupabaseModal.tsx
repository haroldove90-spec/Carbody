import React, { useState } from 'react';
import { Database, Trash2, CheckCircle2, AlertTriangle, X, RefreshCw, Key, Globe, Copy, Check } from 'lucide-react';
import { useCarbody } from '../context/CarbodyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    isSampleDataPurged, 
    purgeAllSampleData, 
    restoreSampleData, 
    supabaseConfig, 
    saveSupabaseConfig, 
    purgeSupabaseData 
  } = useCarbody();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isPurgingSupabase, setIsPurgingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({ url, anonKey });
    setSupabaseStatusMsg({
      type: 'success',
      text: 'Configuración de Supabase guardada correctamente en el almacenamiento local seguro.'
    });
  };

  const handlePurgeLocal = () => {
    if (window.confirm('¿Confirmas que deseas BORRAR TODOS los datos de muestra? El sistema quedará en blanco para capturar expedientes reales y el navegador NO volverá a precargar datos muestra.')) {
      purgeAllSampleData();
      setSupabaseStatusMsg({
        type: 'success',
        text: 'Datos de muestra eliminados por completo. El navegador operará en modo limpio sin precargas.'
      });
    }
  };

  const handleRestoreLocal = () => {
    restoreSampleData();
    setSupabaseStatusMsg({
      type: 'info',
      text: 'Datos de muestra restaurados para propósitos de prueba.'
    });
  };

  const handlePurgeRemoteSupabase = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      setSupabaseStatusMsg({
        type: 'error',
        text: 'Primero ingresa y guarda tu URL de Supabase y tu Anon Key pública.'
      });
      return;
    }

    if (window.confirm('¿Confirmas que deseas vaciar todas las tablas de Carbody en tu proyecto de Supabase? Esta acción no se puede deshacer.')) {
      setIsPurgingSupabase(true);
      const res = await purgeSupabaseData();
      setIsPurgingSupabase(false);
      setSupabaseStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Esquema SQL oficial para Carbody en Supabase
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  expediente TEXT NOT NULL,
  siniestro TEXT,
  poliza TEXT,
  procedencia TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_email TEXT,
  marca TEXT NOT NULL,
  submarca TEXT NOT NULL,
  modelo_anio INT,
  color TEXT,
  codigo_color_oem TEXT,
  placas TEXT NOT NULL,
  vin TEXT,
  kilometraje INT,
  current_workflow_stage TEXT,
  taller_sub_etapa TEXT,
  fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
  fecha_promesa_entrega TIMESTAMPTZ,
  fecha_entrega_real TIMESTAMPTZ,
  nivel_gasolina TEXT,
  pertenencias JSONB,
  testigos_tablero JSONB,
  estado_llantas TEXT,
  danos_peritaje_360 JSONB,
  firma_recepcion_cliente TEXT,
  firma_recepcion_asesor TEXT,
  piezas_valuadas JSONB,
  tabulador_aplicado TEXT,
  total_presupuesto NUMERIC,
  presupuesto_autorizado_aseguradora NUMERIC,
  deducible NUMERIC,
  deducible_cobrado BOOLEAN DEFAULT FALSE,
  complementos JSONB,
  operativo_mecanica JSONB,
  operativo_hojalateria JSONB,
  operativo_color_lab JSONB,
  operativo_cabina JSONB,
  calidad_checklist JSONB,
  factura_emitida JSONB,
  postventa JSONB
);

CREATE TABLE IF NOT EXISTS citas (
  id TEXT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  procedencia TEXT,
  vehiculo_info TEXT,
  placas TEXT,
  motivo TEXT,
  estatus TEXT,
  notas TEXT
);

CREATE TABLE IF NOT EXISTS ordenes_compra (
  id TEXT PRIMARY KEY,
  numero_oc TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  expediente_vinculado TEXT,
  siniestro TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  piezas JSONB,
  total NUMERIC,
  estatus TEXT,
  numero_guia TEXT,
  dias_credito INT DEFAULT 0,
  estatus_pago TEXT,
  fecha_vencimiento DATE,
  monto_pagado NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS consumibles (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  stock_actual NUMERIC DEFAULT 0,
  stock_minimo NUMERIC DEFAULT 0,
  unidad TEXT,
  precio_unitario NUMERIC DEFAULT 0,
  ubicacion TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  usuario TEXT,
  rol TEXT,
  accion TEXT,
  detalle TEXT,
  expediente TEXT
);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#91B146]/10 text-[#91B146]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B1B1B]">Gestión de Datos y Supabase</h3>
              <p className="text-xs text-[#939395]">Control de datos de muestra y sincronización en la nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Status Message */}
          {supabaseStatusMsg && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              supabaseStatusMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : supabaseStatusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {supabaseStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{supabaseStatusMsg.text}</span>
            </div>
          )}

          {/* Section 1: Borrar datos de muestra locales */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Estado de Datos de Muestra en el Navegador
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {isSampleDataPurged ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                      • Sistema en limpio: No se precargan datos muestra. Listo para producción.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      • Actualmente se están visualizando los datos de demostración (Chubb, GNP, etc.).
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSampleDataPurged ? (
                  <button
                    onClick={handleRestoreLocal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restaurar datos demo
                  </button>
                ) : (
                  <button
                    onClick={handlePurgeLocal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Borrar datos de muestra
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Conexión Supabase */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#67A0CD]" />
                Conectar con Supabase (Base de Datos en la Nube)
              </h4>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                supabaseConfig.connected 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {supabaseConfig.connected ? 'Configurado' : 'Sin vincular'}
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supabase Anon Public API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={copySqlSchema}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSchema ? '¡Esquema SQL copiado!' : 'Copiar tablas SQL para Supabase'}
                </button>

                <div className="flex items-center gap-2">
                  {supabaseConfig.connected && (
                    <button
                      type="button"
                      onClick={handlePurgeRemoteSupabase}
                      disabled={isPurgingSupabase}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isPurgingSupabase ? 'Borrando...' : 'Vaciar registros en Supabase'}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#67A0CD] hover:bg-[#5287b0] rounded-lg shadow-xs"
                  >
                    Guardar Credenciales
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
