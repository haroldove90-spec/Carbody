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
  LayoutDashboard
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { currentRole, activeModule, setActiveModule } = useCarbody();

  // Pick top 4-5 navigation items for the active role
  const getBottomBarItems = () => {
    switch (currentRole) {
      case 'recepcion':
        return [
          { id: 'citas', label: 'Citas', icon: <Calendar className="w-5 h-5" /> },
          { id: 'recepcion', label: 'Recepción', icon: <ClipboardCheck className="w-5 h-5" /> },
          { id: 'atencion', label: 'Avisos', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'entrega', label: 'Entrega', icon: <Award className="w-5 h-5" /> },
          { id: 'flujo_global', label: 'Flujo', icon: <GitFork className="w-5 h-5" /> },
        ];
      case 'valuador':
        return [
          { id: 'valuacion', label: 'Valuación', icon: <Calculator className="w-5 h-5" /> },
          { id: 'calculo', label: 'Insumos', icon: <Layers className="w-5 h-5" /> },
          { id: 'autorizaciones', label: 'Autoriza', icon: <FileCheck className="w-5 h-5" /> },
          { id: 'flujo_global', label: 'Flujo', icon: <GitFork className="w-5 h-5" /> },
        ];
      case 'taller':
        return [
          { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-5 h-5" /> },
          { id: 'operativo', label: 'Operativo', icon: <Hammer className="w-5 h-5" /> },
          { id: 'calidad', label: 'Calidad', icon: <ShieldCheck className="w-5 h-5" /> },
          { id: 'flujo_global', label: 'Flujo', icon: <GitFork className="w-5 h-5" /> },
        ];
      case 'almacen':
        return [
          { id: 'refacciones', label: 'Refacciones', icon: <Package className="w-5 h-5" /> },
          { id: 'cxp', label: 'CxP', icon: <CreditCard className="w-5 h-5" /> },
          { id: 'inventario', label: 'Stock', icon: <Boxes className="w-5 h-5" /> },
          { id: 'flujo_global', label: 'Flujo', icon: <GitFork className="w-5 h-5" /> },
        ];
      case 'admin':
      default:
        return [
          { id: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'facturacion', label: 'Facturación', icon: <Receipt className="w-5 h-5" /> },
          { id: 'metricas', label: 'Métricas', icon: <TrendingUp className="w-5 h-5" /> },
          { id: 'auditoria', label: 'Auditoría', icon: <UserCheck className="w-5 h-5" /> },
          { id: 'flujo_global', label: 'Flujo', icon: <GitFork className="w-5 h-5" /> },
        ];
    }
  };

  const items = getBottomBarItems();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg safe-bottom">
      {items.map((item) => {
        const isActive = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px] ${
              isActive
                ? 'text-[#91B146] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${
              isActive ? 'scale-110 bg-[#91B146]/10' : ''
            }`}>
              {item.icon}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
