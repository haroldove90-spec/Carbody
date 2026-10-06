import React, { useState } from 'react';
import { useCarbody } from '../context/CarbodyContext';
import { ROLES } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { SupabaseModal } from './SupabaseModal';
import { 
  LogOut, 
  ChevronDown, 
  Database, 
  Menu, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert,
  Layers
} from 'lucide-react';

interface Props {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<Props> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    isSampleDataPurged, 
    purgeAllSampleData,
    supabaseConfig 
  } = useCarbody();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const activeRoleInfo = ROLES.find(r => r.id === currentRole) || ROLES[0];

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const handleQuickPurge = () => {
    if (window.confirm('¿Deseas BORRAR TODOS los datos de muestra del sistema? El navegador no volverá a mostrar datos muestra.')) {
      purgeAllSampleData();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile sidebar toggle + Full-Size Brand Logo (NOT ENCAPSULATED) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* UNENCAPSULATED FULL SIZE LOGO */}
            <div className="flex items-center">
              <img
                src="https://appdesignproyectos.com/carbodylogo.png"
                alt="Carbody"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain select-none"
              />
            </div>
          </div>

          {/* Right: Actions, Role Selector, PWA Install & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Supabase / Data Purge Control */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              title="Gestión de datos de muestra y conexión Supabase"
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isSampleDataPurged 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#67A0CD]" />
              <span className="hidden md:inline">
                {isSampleDataPurged ? 'Datos limpios' : 'Datos muestra'}
              </span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Active Role Indicator & Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" 
                  style={{ backgroundColor: activeRoleInfo.color }}
                />
                <div className="hidden sm:block">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                    Rol Activo
                  </p>
                  <p className="text-xs font-bold text-[#1B1B1B] truncate max-w-[140px] md:max-w-[180px] leading-tight">
                    {activeRoleInfo.name}
                  </p>
                </div>
                <div className="sm:hidden text-xs font-bold text-[#1B1B1B]">
                  {activeRoleInfo.shortName}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsRoleDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                    <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Cambiar de Rol
                    </p>
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setCurrentRole(r.id);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition ${
                          r.id === currentRole 
                            ? 'bg-[#91B146]/10 font-bold text-[#1B1B1B]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: r.color }} 
                          />
                          <span>{r.name}</span>
                        </div>
                        {r.id === currentRole && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#91B146]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión / Volver a selección de roles"
              className="p-2 sm:px-3 sm:py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* Supabase & Sample Data Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </>
  );
};
