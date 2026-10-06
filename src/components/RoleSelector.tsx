import React from 'react';
import { ROLES, Role } from '../types';
import { useCarbody } from '../context/CarbodyContext';
import { 
  ClipboardList, 
  Calculator, 
  Wrench, 
  PackageCheck, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

const roleIcons: Record<string, React.ReactNode> = {
  recepcion: <ClipboardList className="w-8 h-8 text-[#91B146]" />,
  valuador: <Calculator className="w-8 h-8 text-[#67A0CD]" />,
  taller: <Wrench className="w-8 h-8 text-[#1B1B1B]" />,
  almacen: <PackageCheck className="w-8 h-8 text-[#939395]" />,
  admin: <ShieldCheck className="w-8 h-8 text-[#91B146]" />,
};

export const RoleSelector: React.FC = () => {
  const { setCurrentRole } = useCarbody();

  const handleSelectRole = (roleId: Role) => {
    setCurrentRole(roleId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Full unencapsulated Carbody Logo on Home-Inicio above the role cards */}
        <div className="mb-8 sm:mb-12 flex justify-center items-center w-full">
          <img
            src="https://appdesignproyectos.com/carbodylogo.png"
            alt="Carbody"
            className="h-14 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[420px] object-contain select-none transition-transform hover:scale-105 duration-200"
          />
        </div>

        {/* Roles Grid: 2 columns mobile, 3 columns tablet, 5 columns desktop */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {ROLES.map((role, idx) => {
            const isLast = idx === ROLES.length - 1; // 5th card (Jorge Bernal)
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-xl hover:border-[#91B146] hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer min-h-[160px] sm:min-h-[190px] ${
                  isLast ? 'col-span-2 sm:col-span-1 max-w-[280px] sm:max-w-none mx-auto w-full' : ''
                }`}
              >
                {/* Subtle top indicator bar */}
                <div 
                  className="absolute top-0 left-6 right-6 h-1 rounded-b-md opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: role.color }}
                />

                <div className="mb-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:bg-[#91B146]/10 transition-all duration-200">
                  {roleIcons[role.id]}
                </div>

                {/* ONLY role name, no descriptions */}
                <span className="text-xs sm:text-sm font-bold text-[#1B1B1B] group-hover:text-[#91B146] transition-colors leading-snug">
                  {role.name}
                </span>

                <div className="mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-[#91B146] flex items-center gap-1">
                  <span>Ingresar</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
