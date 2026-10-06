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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Container with specified grid: 2 columns mobile, 4 columns desktop */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-xl hover:border-[#91B146] hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer min-h-[160px] sm:min-h-[200px]"
            >
              {/* Subtle top indicator bar */}
              <div 
                className="absolute top-0 left-6 right-6 h-1 rounded-b-md opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: role.color }}
              />

              <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:bg-[#91B146]/10 transition-all duration-200">
                {roleIcons[role.id]}
              </div>

              {/* ONLY role name, no descriptions */}
              <span className="text-sm sm:text-base font-bold text-[#1B1B1B] group-hover:text-[#91B146] transition-colors leading-snug">
                {role.name}
              </span>

              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-[#91B146] flex items-center gap-1">
                <span>Ingresar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
