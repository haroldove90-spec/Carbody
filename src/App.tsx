/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CarbodyProvider, useCarbody } from './context/CarbodyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { RoleSelector } from './components/RoleSelector';
import { WorkflowTrackerModal } from './components/WorkflowTrackerModal';

// Recepción modules
import { AgendaCitas } from './modules/recepcion/AgendaCitas';
import { RecepcionInventario } from './modules/recepcion/RecepcionInventario';
import { AtencionInformacion } from './modules/recepcion/AtencionInformacion';
import { EntregaPostventa } from './modules/recepcion/EntregaPostventa';

// Valuación modules
import { PresupuestoValuacion } from './modules/valuacion/PresupuestoValuacion';
import { CalculoInsumos } from './modules/valuacion/CalculoInsumos';
import { GestionAutorizaciones } from './modules/valuacion/GestionAutorizaciones';

// Taller modules
import { KanbanTaller } from './modules/taller/KanbanTaller';
import { ModuloOperativo } from './modules/taller/ModuloOperativo';
import { ControlCalidad } from './modules/taller/ControlCalidad';

// Almacén modules
import { AsignacionRefacciones } from './modules/almacen/AsignacionRefacciones';
import { ProveedoresCxP } from './modules/almacen/ProveedoresCxP';
import { InventarioConsumibles } from './modules/almacen/InventarioConsumibles';

// Admin modules
import { ResumenGeneral } from './modules/admin/ResumenGeneral';
import { FacturacionCobranza } from './modules/admin/FacturacionCobranza';
import { MetricasRentabilidad } from './modules/admin/MetricasRentabilidad';
import { AuditoriaPermisos } from './modules/admin/AuditoriaPermisos';
import { FlujoTallerGlobal } from './modules/admin/FlujoTallerGlobal';

const DashboardContent: React.FC = () => {
  const { currentRole, activeModule } = useCarbody();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If no role is selected, show the clean initial Role Selector
  // Requirement: "Acceso por Roles en Inicio (Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio): Selector limpio con tarjetas independientes para cada rol. Sin header, sin descripciones, solo nombre del rol."
  if (!currentRole) {
    return <RoleSelector />;
  }

  // Active module view routing
  const renderModuleView = () => {
    switch (activeModule) {
      // Recepción
      case 'citas':
        return <AgendaCitas />;
      case 'recepcion':
        return <RecepcionInventario />;
      case 'atencion':
        return <AtencionInformacion />;
      case 'entrega':
        return <EntregaPostventa />;

      // Valuación
      case 'valuacion':
        return <PresupuestoValuacion />;
      case 'calculo':
        return <CalculoInsumos />;
      case 'autorizaciones':
        return <GestionAutorizaciones />;

      // Taller
      case 'kanban':
        return <KanbanTaller />;
      case 'operativo':
        return <ModuloOperativo />;
      case 'calidad':
        return <ControlCalidad />;

      // Almacén
      case 'refacciones':
        return <AsignacionRefacciones />;
      case 'cxp':
        return <ProveedoresCxP />;
      case 'inventario':
        return <InventarioConsumibles />;

      // Admin & Flujo General
      case 'resumen':
        return <ResumenGeneral />;
      case 'facturacion':
        return <FacturacionCobranza />;
      case 'metricas':
        return <MetricasRentabilidad />;
      case 'auditoria':
        return <AuditoriaPermisos />;
      case 'flujo_global':
        return <FlujoTallerGlobal />;

      default:
        return <ResumenGeneral />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Institutional Unified Header */}
      <Header 
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)} 
        isSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (docked on desktop lg screens) */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Tablet Slide-over Drawer (toggled by hamburger on tablet) */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace without repetitive tabs */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderModuleView()}
          </div>
        </main>
      </div>

      {/* Touch-optimized fixed bottom bar for mobile */}
      <BottomBar />

      {/* Global 7-step pipeline interactive modal */}
      <WorkflowTrackerModal />
    </div>
  );
};

export default function App() {
  return (
    <CarbodyProvider>
      <DashboardContent />
    </CarbodyProvider>
  );
}
