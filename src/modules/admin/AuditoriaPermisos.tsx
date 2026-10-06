import React, { useState } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { AuditLog, ROLES } from '../../types';
import { 
  UserCheck, 
  ShieldCheck, 
  Users, 
  Clock, 
  Key, 
  Search, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface UserPermission {
  id: string;
  nombre: string;
  rol: string;
  email: string;
  ultimoAcceso: string;
  activo: boolean;
}

export const AuditoriaPermisos: React.FC = () => {
  const { auditLogs } = useCarbody();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'auditoria' | 'usuarios'>('auditoria');

  const [usuarios, setUsuarios] = useState<UserPermission[]>([
    { id: 'u1', nombre: 'Jorge Bernal', rol: 'Administrador / Dueño', email: 'jorge.bernal@carbody.com', ultimoAcceso: 'Hace 5 min', activo: true },
    { id: 'u2', nombre: 'Lic. Laura Treviño', rol: 'Recepcionista / Asesor', email: 'recepcion@carbody.com', ultimoAcceso: 'Hace 12 min', activo: true },
    { id: 'u3', nombre: 'Ernesto Valenzuela', rol: 'Valuador / Estimador', email: 'valuacion@carbody.com', ultimoAcceso: 'Hace 45 min', activo: true },
    { id: 'u4', nombre: 'Mateo González', rol: 'Jefe de Taller', email: 'taller@carbody.com', ultimoAcceso: 'Hace 1 hora', activo: true },
    { id: 'u5', nombre: 'Rodrigo Vega', rol: 'Almacén / Compras', email: 'almacen@carbody.com', ultimoAcceso: 'Hace 2 horas', activo: true },
  ]);

  const filteredLogs = auditLogs.filter(log =>
    log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.expediente && log.expediente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#91B146]" />
            Permisos de Usuario y Bitácora de Auditoría
          </h2>
          <p className="text-xs text-[#939395]">
            Control de accesos y trazabilidad en tiempo real de cada movimiento realizado en el sistema Carbody.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('auditoria')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'auditoria' ? 'bg-white text-[#1B1B1B] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Bitácora de Auditoría ({auditLogs.length})
          </button>
          <button
            onClick={() => setTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'usuarios' ? 'bg-white text-[#1B1B1B] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Usuarios y Roles ({usuarios.length})
          </button>
        </div>
      </div>

      {tab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar bitácora por acción, usuario o expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91B146]/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Usuario / Rol</th>
                  <th className="py-2.5 px-3">Acción Registrada</th>
                  <th className="py-2.5 px-3">Detalle del Movimiento</th>
                  <th className="py-2.5 px-3 text-right">Expediente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{log.usuario}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{log.rol}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {log.accion}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-md">
                      {log.detalle}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] font-bold text-slate-700">
                      {log.expediente || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((u) => (
              <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{u.nombre}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[#91B146] font-bold">{u.rol}</p>
                <p className="text-slate-500">{u.email}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Último acceso:</span>
                  <span className="font-semibold text-slate-700">{u.ultimoAcceso}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
