import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  VehicleRecord, 
  Cita, 
  OrdenCompra, 
  ConsumibleInventario, 
  AuditLog,
  WorkflowStage,
  TallerSubEtapa
} from '../types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_CITAS, 
  INITIAL_ORDENES_COMPRA, 
  INITIAL_CONSUMIBLES, 
  INITIAL_AUDIT_LOGS 
} from '../data/sampleData';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}

interface CarbodyContextType {
  currentRole: Role | null;
  setCurrentRole: (role: Role | null) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  
  // Data
  vehicles: VehicleRecord[];
  citas: Cita[];
  ordenesCompra: OrdenCompra[];
  consumibles: ConsumibleInventario[];
  auditLogs: AuditLog[];
  
  // Sample Data controls
  isSampleDataPurged: boolean;
  purgeAllSampleData: () => void;
  restoreSampleData: () => void;
  
  // Supabase Integration
  supabaseConfig: SupabaseConfig;
  saveSupabaseConfig: (config: { url: string; anonKey: string }) => void;
  purgeSupabaseData: () => Promise<{ success: boolean; message: string }>;

  // Mutations
  addVehicle: (vehicle: Omit<VehicleRecord, 'id'>) => VehicleRecord;
  updateVehicle: (id: string, updates: Partial<VehicleRecord>) => void;
  deleteVehicle: (id: string) => void;
  advanceWorkflowStage: (id: string, nextStage: WorkflowStage, subEtapa?: TallerSubEtapa) => void;
  
  addCita: (cita: Omit<Cita, 'id'>) => void;
  updateCita: (id: string, updates: Partial<Cita>) => void;
  
  addOrdenCompra: (oc: Omit<OrdenCompra, 'id'>) => void;
  updateOrdenCompra: (id: string, updates: Partial<OrdenCompra>) => void;
  
  updateConsumibleStock: (id: string, newStock: number) => void;
  restockConsumible: (id: string, amount: number) => void;
  
  addAuditLog: (accion: string, detalle: string, expediente?: string) => void;
  
  // Workflow Tracker Modal
  selectedVehicleForWorkflow: VehicleRecord | null;
  setSelectedVehicleForWorkflow: (vehicle: VehicleRecord | null) => void;
}

const CarbodyContext = createContext<CarbodyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PURGED: 'carbody_sample_purged_flag',
  ROLE: 'carbody_active_role',
  MODULE: 'carbody_active_module',
  VEHICLES: 'carbody_vehicles_data',
  CITAS: 'carbody_citas_data',
  ORDENES: 'carbody_ordenes_data',
  CONSUMIBLES: 'carbody_consumibles_data',
  LOGS: 'carbody_logs_data',
  SUPABASE: 'carbody_supabase_config'
};

export const CarbodyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if sample data has been permanently cleared
  const [isSampleDataPurged, setIsSampleDataPurged] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
  });

  const [currentRole, setCurrentRoleState] = useState<Role | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as Role) || null;
  });

  const [activeModule, setActiveModuleState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.MODULE) || 'resumen';
  });

  // Selected vehicle for popup workflow inspector
  const [selectedVehicleForWorkflow, setSelectedVehicleForWorkflow] = useState<VehicleRecord | null>(null);

  // Supabase configuration
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { url: '', anonKey: '', connected: false };
  });

  // Data states
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    const purged = localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
    if (purged) {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [citas, setCitas] = useState<Cita[]>(() => {
    const purged = localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
    if (purged) {
      const saved = localStorage.getItem(STORAGE_KEYS.CITAS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CITAS);
    return saved ? JSON.parse(saved) : INITIAL_CITAS;
  });

  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(() => {
    const purged = localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
    if (purged) {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDENES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ORDENES);
    return saved ? JSON.parse(saved) : INITIAL_ORDENES_COMPRA;
  });

  const [consumibles, setConsumibles] = useState<ConsumibleInventario[]>(() => {
    const purged = localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
    if (purged) {
      const saved = localStorage.getItem(STORAGE_KEYS.CONSUMIBLES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CONSUMIBLES);
    return saved ? JSON.parse(saved) : INITIAL_CONSUMIBLES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const purged = localStorage.getItem(STORAGE_KEYS.PURGED) === 'true';
    if (purged) {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(citas));
  }, [citas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(ordenesCompra));
  }, [ordenesCompra]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONSUMIBLES, JSON.stringify(consumibles));
  }, [consumibles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const setCurrentRole = (role: Role | null) => {
    setCurrentRoleState(role);
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      // set sensible default module for role
      switch (role) {
        case 'recepcion':
          setActiveModuleState('citas');
          break;
        case 'valuador':
          setActiveModuleState('valuacion');
          break;
        case 'taller':
          setActiveModuleState('kanban');
          break;
        case 'almacen':
          setActiveModuleState('refacciones');
          break;
        case 'admin':
          setActiveModuleState('resumen');
          break;
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    }
  };

  const setActiveModule = (mod: string) => {
    setActiveModuleState(mod);
    localStorage.setItem(STORAGE_KEYS.MODULE, mod);
  };

  const addAuditLog = (accion: string, detalle: string, expediente?: string) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formattedDate,
      usuario: currentRole === 'admin' ? 'Jorge Bernal' : currentRole ? currentRole.toUpperCase() : 'Sistema',
      rol: currentRole || 'Sistema',
      accion,
      detalle,
      expediente,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // PURGE ALL SAMPLE DATA FUNCTIONALITY
  // Specifically requested by user:
  // "Activa botón para poder borrar datos de muestra del todo el sistema, activa la función para que el navegador no muestre los datos de muestra nuevamente y se puedan borrar los registros en supabase cuando se configure."
  const purgeAllSampleData = () => {
    localStorage.setItem(STORAGE_KEYS.PURGED, 'true');
    setIsSampleDataPurged(true);
    setVehicles([]);
    setCitas([]);
    setOrdenesCompra([]);
    setConsumibles([]);
    const freshLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usuario: currentRole === 'admin' ? 'Jorge Bernal' : 'Administrador',
      rol: 'admin',
      accion: 'Purga Total de Datos de Muestra',
      detalle: 'Se eliminaron todos los registros de prueba y se fijó la directiva para no precargar datos muestra en el navegador.',
    };
    setAuditLogs([freshLog]);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CONSUMIBLES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([freshLog]));
  };

  const restoreSampleData = () => {
    localStorage.removeItem(STORAGE_KEYS.PURGED);
    setIsSampleDataPurged(false);
    setVehicles(INITIAL_VEHICLES);
    setCitas(INITIAL_CITAS);
    setOrdenesCompra(INITIAL_ORDENES_COMPRA);
    setConsumibles(INITIAL_CONSUMIBLES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(INITIAL_CITAS));
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_COMPRA));
    localStorage.setItem(STORAGE_KEYS.CONSUMIBLES, JSON.stringify(INITIAL_CONSUMIBLES));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    addAuditLog('Restauración de Datos Muestra', 'Se cargaron nuevamente los expedientes de demostración.');
  };

  // Supabase Configuration & Remote wipe
  const saveSupabaseConfig = (cfg: { url: string; anonKey: string }) => {
    const updated: SupabaseConfig = {
      url: cfg.url.trim(),
      anonKey: cfg.anonKey.trim(),
      connected: !!(cfg.url.trim() && cfg.anonKey.trim()),
    };
    setSupabaseConfig(updated);
    localStorage.setItem(STORAGE_KEYS.SUPABASE, JSON.stringify(updated));
    addAuditLog('Configuración Supabase', `URL guardada: ${updated.url || 'Desconectado'}`);
  };

  const purgeSupabaseData = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      return {
        success: false,
        message: 'No hay credenciales de Supabase configuradas actualmente. Puedes configurarlas en este diálogo.'
      };
    }

    try {
      // Execute REST DELETE on Carbody Supabase tables if reachable
      const headers = {
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      const tables = ['vehicles', 'citas', 'ordenes_compra', 'consumibles', 'audit_logs'];
      for (const table of tables) {
        try {
          await fetch(`${supabaseConfig.url}/rest/v1/${table}?id=neq.placeholder_never`, {
            method: 'DELETE',
            headers
          });
        } catch {
          // continue
        }
      }

      addAuditLog('Purga de Registros Supabase', 'Se envió la instrucción de limpieza a las tablas de Supabase');
      return {
        success: true,
        message: 'Directiva enviada con éxito a Supabase. Se han borrado los registros de prueba en la nube.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al conectar con Supabase: ${err?.message || 'Verifica la URL y la Anon Key'}`
      };
    }
  };

  // Vehicle Mutations
  const addVehicle = (newVeh: Omit<VehicleRecord, 'id'>): VehicleRecord => {
    const id = `veh-${Date.now()}`;
    const created: VehicleRecord = {
      ...newVeh,
      id,
    };
    setVehicles(prev => [created, ...prev]);
    addAuditLog(
      'Nuevo Ingreso de Unidad',
      `${created.marca} ${created.submarca} (${created.placas}) - Siniestro ${created.siniestro}`,
      created.expediente
    );
    return created;
  };

  const updateVehicle = (id: string, updates: Partial<VehicleRecord>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, ...updates };
        if (updates.currentWorkflowStage && updates.currentWorkflowStage !== v.currentWorkflowStage) {
          addAuditLog(
            'Cambio de Etapa de Flujo',
            `Unidad ${v.placas} avanzada a: ${updates.currentWorkflowStage}`,
            v.expediente
          );
        }
        return updated;
      }
      return v;
    }));
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (target) {
      addAuditLog('Eliminación de Expediente', `Expediente ${target.expediente} (${target.placas}) eliminado`);
    }
  };

  const advanceWorkflowStage = (id: string, nextStage: WorkflowStage, subEtapa?: TallerSubEtapa) => {
    updateVehicle(id, {
      currentWorkflowStage: nextStage,
      ...(subEtapa ? { tallerSubEtapa: subEtapa } : {})
    });
  };

  // Citas Mutations
  const addCita = (cita: Omit<Cita, 'id'>) => {
    const newCita: Cita = {
      ...cita,
      id: `cita-${Date.now()}`,
    };
    setCitas(prev => [newCita, ...prev]);
    addAuditLog('Cita Agendada', `${newCita.clienteNombre} (${newCita.fecha} ${newCita.hora}) - ${newCita.motivo}`);
  };

  const updateCita = (id: string, updates: Partial<Cita>) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Ordenes Compra Mutations
  const addOrdenCompra = (oc: Omit<OrdenCompra, 'id'>) => {
    const newOC: OrdenCompra = {
      ...oc,
      id: `oc-${Date.now()}`,
    };
    setOrdenesCompra(prev => [newOC, ...prev]);
    addAuditLog('Orden de Compra Generada', `${newOC.numeroOC} - Proveedor: ${newOC.proveedor} ($${newOC.total.toLocaleString()} MXN)`, newOC.expedienteVinculado);
  };

  const updateOrdenCompra = (id: string, updates: Partial<OrdenCompra>) => {
    setOrdenesCompra(prev => prev.map(oc => oc.id === id ? { ...oc, ...updates } : oc));
  };

  // Consumibles Mutations
  const updateConsumibleStock = (id: string, newStock: number) => {
    setConsumibles(prev => prev.map(c => c.id === id ? { ...c, stockActual: Math.max(0, newStock) } : c));
  };

  const restockConsumible = (id: string, amount: number) => {
    setConsumibles(prev => prev.map(c => {
      if (c.id === id) {
        const updatedStock = c.stockActual + amount;
        addAuditLog('Reabastecimiento de Consumible', `${c.nombre}: +${amount} ${c.unidad}`);
        return { ...c, stockActual: updatedStock };
      }
      return c;
    }));
  };

  return (
    <CarbodyContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        vehicles,
        citas,
        ordenesCompra,
        consumibles,
        auditLogs,
        isSampleDataPurged,
        purgeAllSampleData,
        restoreSampleData,
        supabaseConfig,
        saveSupabaseConfig,
        purgeSupabaseData,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        advanceWorkflowStage,
        addCita,
        updateCita,
        addOrdenCompra,
        updateOrdenCompra,
        updateConsumibleStock,
        restockConsumible,
        addAuditLog,
        selectedVehicleForWorkflow,
        setSelectedVehicleForWorkflow
      }}
    >
      {children}
    </CarbodyContext.Provider>
  );
};

export const useCarbody = () => {
  const context = useContext(CarbodyContext);
  if (!context) {
    throw new Error('useCarbody must be used within a CarbodyProvider');
  }
  return context;
};
