import React from 'react';
import { useCarbody } from '../context/CarbodyContext';
import { 
  Calendar, 
  ClipboardCheck, 
  MessageSquare, 
  Award, 
  Calculator, 
  Layers, 
  FileCheck, 
  Kanban, 
  Hammer, 
  ShieldCheck, 
  Package, 
  CreditCard, 
  Boxes, 
  Receipt, 
  TrendingUp, 
  UserCheck, 
  GitFork, 
  ChevronRight,
  Car
} from 'lucide-react';

interface ModuleItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onCloseMobile?: () => void }> = ({
  isOpen = true,
  onCloseMobile
}) => {
  const { currentRole, activeModule, setActiveModule, vehicles, citas, ordenesCompra, consumibles } = useCarbody();

  // Role specific menu configuration
  const getModulesForRole = (): ModuleItem[] => {
    switch (currentRole) {
      case 'recepcion':
        return [
          { id: 'citas', label: 'Agenda y Citas', icon: <Calendar className="w-4 h-4" />, badge: citas.filter(c => c.estatus === 'Programada').length },
          { id: 'recepcion', label: 'Recepción e Inventario', icon: <ClipboardCheck className="w-4 h-4" /> },
          { id: 'atencion', label: 'Atención e Información', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'entrega', label: 'Entrega y Postventa', icon: <Award className="w-4 h-4" /> },
          { id: 'flujo_global', label: 'Flujo del Taller', icon: <GitFork className="w-4 h-4" /> },
        ];
      case 'valuador':
        return [
          { id: 'valuacion', label: 'Presupuesto y Valuación', icon: <Calculator className="w-4 h-4" />, badge: vehicles.filter(v => v.currentWorkflowStage === 'valuacion_inspeccion').length },
          { id: 'calculo', label: 'Cálculo de Insumos', icon: <Layers className="w-4 h-4" /> },
          { id: 'autorizaciones', label: 'Gestión de Autorizaciones', icon: <FileCheck className="w-4 h-4" /> },
          { id: 'flujo_global', label: 'Flujo del Taller', icon: <GitFork className="w-4 h-4" /> },
        ];
      case 'taller':
        return [
          { id: 'kanban', label: 'Tablero de Producción', icon: <Kanban className="w-4 h-4" />, badge: vehicles.filter(v => v.currentWorkflowStage === 'taller_proceso').length },
          { id: 'operativo', label: 'Módulo Operativo', icon: <Hammer className="w-4 h-4" /> },
          { id: 'calidad', label: 'Control de Calidad', icon: <ShieldCheck className="w-4 h-4" />, badge: vehicles.filter(v => v.tallerSubEtapa === 'control_calidad').length },
          { id: 'flujo_global', label: 'Flujo del Taller', icon: <GitFork className="w-4 h-4" /> },
        ];
      case 'almacen':
        return [
          { id: 'refacciones', label: 'Asignación por Auto', icon: <Package className="w-4 h-4" /> },
          { id: 'cxp', label: 'Proveedores y CxP', icon: <CreditCard className="w-4 h-4" />, badge: ordenesCompra.filter(o => o.estatusPago === 'Pendiente').length },
          { id: 'inventario', label: 'Inventario Consumibles', icon: <Boxes className="w-4 h-4" />, badge: consumibles.filter(c => c.stockActual <= c.stockMinimo).length },
          { id: 'flujo_global', label: 'Flujo del Taller', icon: <GitFork className="w-4 h-4" /> },
        ];
      case 'admin':
      default:
        return [
          { id: 'resumen', label: 'Panel General', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'facturacion', label: 'Facturación y CxC', icon: <Receipt className="w-4 h-4" /> },
          { id: 'metricas', label: 'Métricas y Rentabilidad', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'auditoria', label: 'Permisos y Auditoría', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'flujo_global', label: 'Flujo del Taller', icon: <GitFork className="w-4 h-4" /> },
        ];
    }
  };

  const modules = getModulesForRole();

  const handleSelectModule = (modId: string) => {
    setActiveModule(modId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Workshop quick summary metrics
  const activeCount = vehicles.length;
  const inWorkshop = vehicles.filter(v => v.currentWorkflowStage === 'taller_proceso').length;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Role Profile Header in Sidebar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Car className="w-5 h-5 text-[#91B146]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#939395]">
              Módulo de Trabajo
            </p>
            <h2 className="text-xs font-bold text-[#1B1B1B] truncate">
              {currentRole === 'admin' 
                ? 'Jorge Bernal (Admin)' 
                : currentRole === 'recepcion'
                ? 'Asesoría y Recepción'
                : currentRole === 'valuador'
                ? 'Valuación Técnica'
                : currentRole === 'taller'
                ? 'Jefatura de Taller'
                : 'Almacén y Compras'
              }
            </h2>
          </div>
        </div>

        {/* Quick status bar */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px]">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[#939395] block text-[10px]">Expedientes</span>
            <span className="font-bold text-[#1B1B1B]">{activeCount}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[#939395] block text-[10px]">En Taller</span>
            <span className="font-bold text-[#91B146]">{inWorkshop}</span>
          </div>
        </div>
      </div>

      {/* Navigation items - Clean without redundant tabs */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Módulos Principales
        </p>
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectModule(m.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#1B1B1B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-[#91B146]' : 'text-slate-400'}>
                  {m.icon}
                </span>
                <span className="truncate">{m.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {m.badge !== undefined && m.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-[#91B146] text-[#1B1B1B]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#91B146]" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar bottom footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[11px] text-[#939395] flex items-center justify-between">
        <span>Carbody OS v2.4</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          En línea
        </span>
      </div>
    </aside>
  );
};
