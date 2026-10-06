export type Role = 
  | 'recepcion' 
  | 'valuador' 
  | 'taller' 
  | 'almacen' 
  | 'admin';

export interface RoleInfo {
  id: Role;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

export const ROLES: RoleInfo[] = [
  {
    id: 'recepcion',
    name: 'Recepcionista / Asesor de Servicio',
    shortName: 'Recepción',
    icon: 'ClipboardList',
    color: '#91B146',
  },
  {
    id: 'valuador',
    name: 'Valuador / Estimador',
    shortName: 'Valuación',
    icon: 'Calculator',
    color: '#67A0CD',
  },
  {
    id: 'taller',
    name: 'Jefe de Taller / Operativos',
    shortName: 'Taller',
    icon: 'Wrench',
    color: '#1B1B1B',
  },
  {
    id: 'almacen',
    name: 'Almacén / Compras',
    shortName: 'Almacén',
    icon: 'PackageCheck',
    color: '#939395',
  },
  {
    id: 'admin',
    name: 'Administrador / Dueño (Jorge Bernal)',
    shortName: 'Administración',
    icon: 'ShieldCheck',
    color: '#91B146',
  },
];

export type Procedencia = 'Chubb' | 'GNP' | 'Renta de autos' | 'Lote' | 'Particular';

export type WorkflowStage =
  | 'cita_recepcion'
  | 'valuacion_inspeccion'
  | 'aprobacion_refacciones'
  | 'taller_proceso'
  | 'armado_calidad'
  | 'facturacion_entrega'
  | 'postventa_cierre';

export interface WorkflowStageInfo {
  id: WorkflowStage;
  stepNumber: number;
  label: string;
  shortLabel: string;
  color: string;
}

export const WORKFLOW_STAGES: WorkflowStageInfo[] = [
  { id: 'cita_recepcion', stepNumber: 1, label: '1. Cita y Recepción', shortLabel: 'Recepción', color: '#67A0CD' },
  { id: 'valuacion_inspeccion', stepNumber: 2, label: '2. Valuación e Inspección', shortLabel: 'Valuación', color: '#91B146' },
  { id: 'aprobacion_refacciones', stepNumber: 3, label: '3. Aprobación y Pedido de Refacciones', shortLabel: 'Refacciones', color: '#939395' },
  { id: 'taller_proceso', stepNumber: 4, label: '4. Taller (Mecánica ➔ Hojalatería ➔ Pintura)', shortLabel: 'Taller', color: '#1B1B1B' },
  { id: 'armado_calidad', stepNumber: 5, label: '5. Armado y Control de Calidad', shortLabel: 'Calidad', color: '#67A0CD' },
  { id: 'facturacion_entrega', stepNumber: 6, label: '6. Facturación, Cobro y Entrega', shortLabel: 'Facturación', color: '#91B146' },
  { id: 'postventa_cierre', stepNumber: 7, label: '7. Postventa y Cierre', shortLabel: 'Postventa', color: '#939395' },
];

export type TallerSubEtapa = 
  | 'en_espera'
  | 'mecanica'
  | 'hojalateria'
  | 'preparacion'
  | 'pintura'
  | 'armado'
  | 'detallado_lavado'
  | 'control_calidad';

export interface VehicleRecord {
  id: string;
  expediente: string; // EXP-2026-001
  siniestro: string; // e.g. "CHUBB-98421", "GNP-55410"
  poliza: string;
  procedencia: Procedencia;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string;
  marca: string;
  submarca: string;
  modeloAnio: number;
  color: string;
  codigoColorOEM?: string;
  placas: string;
  vin: string;
  kilometraje: number;
  
  // Workflow state
  currentWorkflowStage: WorkflowStage;
  tallerSubEtapa: TallerSubEtapa;
  fechaIngreso: string;
  fechaPromesaEntrega: string;
  fechaEntregaReal?: string;

  // Recepción checklist
  nivelGasolina: 'E' | '1/4' | '1/2' | '3/4' | 'F';
  pertenencias: string[];
  testigosTablero: string[];
  estadoLlantas: 'Excelente' | 'Bueno' | 'Regular' | 'Malo';
  danosPeritaje360: {
    zona: string;
    tipoDano: 'Golpe' | 'Rayón' | 'Abolladura' | 'Faltante' | 'Descuadre' | 'Ruptura';
    nota?: string;
  }[];
  firmaRecepcionCliente?: string; // Data URL or text
  firmaRecepcionAsesor?: string;
  firmaEntregaConformidad?: string;

  // Valuación & Presupuesto
  piezasValuadas: {
    id: string;
    pieza: string;
    accion: 'Reparar' | 'Sustituir';
    tipoIntervencion: ('Desarme' | 'Armado' | 'Hojalatería' | 'Mecánica' | 'Pintura' | 'Pulido')[];
    horasHojalateria: number;
    horasMecanica: number;
    costoPintura: number;
    costoRefaccion: number;
    estatusRefaccion?: 'Pendiente' | 'Solicitada' | 'En Tránsito' | 'En Taller' | 'Instalada';
  }[];
  tabuladorAplicado: string;
  totalPresupuesto: number;
  presupuestoAutorizadoAseguradora?: number;
  deducible: number;
  deducibleCobrado: boolean;
  complementos: {
    id: string;
    fecha: string;
    descripcion: string;
    monto: number;
    aprobado: boolean;
  }[];

  // Taller Operativo
  operativoMecanica?: {
    tecnico: string;
    intervenciones: string[];
    horasEfectivas: number;
    alineacionRealizada: boolean;
    completado: boolean;
  };
  operativoHojalateria?: {
    tecnico: string;
    bancoEstirajeUsado: boolean;
    soldaduraAplicada: boolean;
    horasEfectivas: number;
    completado: boolean;
  };
  operativoColorLab?: {
    codigoOEM: string;
    marcaPintura: string; // Axalta, PPG, Sherwin Williams
    formulaGramos: number;
    mermaGramos: number;
    igualador: string;
    completado: boolean;
  };
  operativoCabina?: {
    pintor: string;
    tiempoHorneadoMinutos: number;
    temperaturaHornoC: number;
    tipoTransparente: string;
    pulidoListo: boolean;
    completado: boolean;
  };

  // Quality check
  calidadChecklist?: {
    ajusteLineas: boolean;
    tonoColorCorrecto: boolean;
    sinDefectosPintura: boolean;
    limpiezaInteriorExterior: boolean;
    torqueTuercas: boolean;
    aprobadoPorJefe: boolean;
    evidenciaFotografica: boolean;
    fechaLiberacion?: string;
  };

  // Facturación y CxC
  facturaEmitida?: {
    folioCFDI: string;
    montoTotal: number;
    fechaEmision: string;
    estatusCobro: 'Pendiente' | 'Parcial' | 'Cobrado';
    montoCobrado: number;
    metodoPago?: 'Transferencia' | 'Efectivo' | 'Tarjeta TPV';
  };

  // Postventa
  postventa?: {
    encuesta7DiasRealizada: boolean;
    calificacion7Dias?: number; // 1-5
    comentarios7Dias?: string;
    encuesta30DiasRealizada: boolean;
    calificacion30Dias?: number;
    comentarios30Dias?: string;
  };
}

export interface Cita {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  clienteNombre: string;
  telefono: string;
  email?: string;
  procedencia: Procedencia;
  vehiculoInfo: string; // "Mazda 3 2022"
  placas?: string;
  motivo: 'Ingreso por siniestro' | 'Valuación presencial' | 'Revisión de avance' | 'Entrega final';
  estatus: 'Programada' | 'Atendida' | 'Cancelada';
  notas?: string;
}

export interface OrdenCompra {
  id: string;
  numeroOC: string;
  proveedor: string;
  expedienteVinculado: string;
  siniestro: string;
  fecha: string;
  piezas: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    numeroParte?: string;
  }[];
  total: number;
  estatus: 'Emitida' | 'En tránsito' | 'Recibida Parcial' | 'Recibida Completa';
  numeroGuia?: string;
  diasCredito: number; // e.g. 15, 30, 0
  estatusPago: 'Pendiente' | 'Vencida' | 'Pagada';
  fechaVencimiento: string;
  montoPagado: number;
}

export interface ConsumibleInventario {
  id: string;
  nombre: string;
  categoria: 'Masillas' | 'Lijas' | 'Primers / Fondos' | 'Transparentes / Barnices' | 'Thínners / Solventes' | 'Pulimentos';
  stockActual: number;
  stockMinimo: number;
  unidad: 'pz' | 'litro' | 'galón' | 'kg' | 'pliego';
  precioUnitario: number;
  ubicacion: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  rol: string;
  accion: string;
  detalle: string;
  expediente?: string;
}
