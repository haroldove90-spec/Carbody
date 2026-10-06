import React, { useState, useRef } from 'react';
import { useCarbody } from '../../context/CarbodyContext';
import { VehicleRecord, Procedencia } from '../../types';
import { 
  ClipboardCheck, 
  Car, 
  Fuel, 
  CheckSquare, 
  AlertOctagon, 
  PenTool, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Camera,
  CheckCircle2
} from 'lucide-react';

const ZONAS_360 = [
  'Facia Delantera',
  'Cofre',
  'Salpicadera Delantera Izq',
  'Salpicadera Delantera Der',
  'Puerta Delantera Izq',
  'Puerta Delantera Der',
  'Puerta Trasera Izq',
  'Puerta Trasera Der',
  'Costado Trasero Izq',
  'Costado Trasero Der',
  'Toldo / Techo',
  'Parabrisas / Cristales',
  'Tapa Cajuela',
  'Facia Trasera',
  'Interiores / Tapicería'
];

const PERTENENCIAS_COMUNES = [
  'Llanta de refacción',
  'Gato hidráulico',
  'Llave de cruz / Birlo de seguridad',
  'Cables pasa corriente',
  'Triángulos de seguridad',
  'Extintor',
  'Manual de usuario y póliza',
  'Tapetes de piso completos',
  'Antena de radio'
];

const TESTIGOS_TABLERO = [
  'Check Engine',
  'Bolsa de Aire (Airbag)',
  'Frenos ABS',
  'Presión de Llantas (TPMS)',
  'Batería / Alternador',
  'Temperatura Motor',
  'Dirección Asistida'
];

export const RecepcionInventario: React.FC = () => {
  const { addVehicle, setActiveModule } = useCarbody();

  // Step tabs
  const [tab, setTab] = useState<'ficha' | 'peritaje360' | 'pertenencias' | 'firma'>('ficha');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [procedencia, setProcedencia] = useState<Procedencia>('Chubb');
  const [siniestro, setSiniestro] = useState('CHUBB-' + Math.floor(100000 + Math.random() * 900000));
  const [poliza, setPoliza] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [marca, setMarca] = useState('Volkswagen');
  const [submarca, setSubmarca] = useState('Jetta');
  const [modeloAnio, setModeloAnio] = useState(2023);
  const [color, setColor] = useState('Blanco Puro');
  const [placas, setPlacas] = useState('');
  const [vin, setVin] = useState('');
  const [kilometraje, setKilometraje] = useState(45000);
  const [fechaPromesaEntrega, setFechaPromesaEntrega] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    return d.toISOString().slice(0, 10);
  });

  // Checklist 360 damages
  const [danos, setDanos] = useState<{ zona: string; tipoDano: 'Golpe' | 'Rayón' | 'Abolladura' | 'Faltante'; nota?: string }[]>([]);
  const [selectedZona, setSelectedZona] = useState(ZONAS_360[0]);
  const [tipoDano, setTipoDano] = useState<'Golpe' | 'Rayón' | 'Abolladura' | 'Faltante'>('Golpe');
  const [notaDano, setNotaDano] = useState('');

  // Fuel, belongings & tires
  const [nivelGasolina, setNivelGasolina] = useState<'E' | '1/4' | '1/2' | '3/4' | 'F'>('1/2');
  const [selectedPertenencias, setSelectedPertenencias] = useState<string[]>([
    'Llanta de refacción',
    'Gato hidráulico',
    'Llave de cruz / Birlo de seguridad'
  ]);
  const [selectedTestigos, setSelectedTestigos] = useState<string[]>([]);
  const [estadoLlantas, setEstadoLlantas] = useState<'Excelente' | 'Bueno' | 'Regular' | 'Malo'>('Bueno');

  // Signatures
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [asesorNombre, setAsesorNombre] = useState('Lic. Laura Treviño');

  const addDanoZona = () => {
    setDanos(prev => [...prev, { zona: selectedZona, tipoDano, nota: notaDano.trim() }]);
    setNotaDano('');
  };

  const removeDano = (index: number) => {
    setDanos(prev => prev.filter((_, idx) => idx !== index));
  };

  const togglePertenencia = (item: string) => {
    setSelectedPertenencias(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleTestigo = (item: string) => {
    setSelectedTestigos(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1B1B1B';

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveExpediente = () => {
    if (!clienteNombre || !placas || !marca) {
      alert('Por favor captura el nombre del cliente, las placas y la marca del vehículo.');
      setTab('ficha');
      return;
    }

    const expNumber = `EXP-2026-${Math.floor(100 + Math.random() * 900)}`;

    addVehicle({
      expediente: expNumber,
      siniestro,
      poliza: poliza || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      procedencia,
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      marca,
      submarca,
      modeloAnio,
      color,
      placas: placas.toUpperCase(),
      vin: vin.toUpperCase() || 'VIN-NO-PROPORCIONADO',
      kilometraje,
      currentWorkflowStage: 'valuacion_inspeccion',
      tallerSubEtapa: 'en_espera',
      fechaIngreso: new Date().toISOString().slice(0, 10),
      fechaPromesaEntrega,
      nivelGasolina,
      pertenencias: selectedPertenencias,
      testigosTablero: selectedTestigos,
      estadoLlantas,
      danosPeritaje360: danos,
      firmaRecepcionCliente: hasSignature ? 'Firma digital registrada en canvas' : 'Firma presencial en papel',
      firmaRecepcionAsesor: asesorNombre,
      piezasValuadas: [],
      tabuladorAplicado: `Tabulador ${procedencia}`,
      totalPresupuesto: 0,
      deducible: 0,
      deducibleCobrado: false,
      complementos: []
    });

    setSavedSuccess(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1B1B1B] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#91B146]" />
            Recepción e Inventario de Entrada (Peritaje 360°)
          </h2>
          <p className="text-xs text-[#939395]">
            Ficha técnica, peritaje 360°, nivel de fluidos, inventario de pertenencias y firma digital de conformidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ¡Expediente Creado!
              </span>
              <button
                onClick={() => setActiveModule('atencion')}
                className="px-3 py-1.5 bg-[#1B1B1B] text-white text-xs font-semibold rounded-xl"
              >
                Ver en Avisos
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveExpediente}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Ingreso de Unidad</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress navigation steps */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        {[
          { id: 'ficha', label: '1. Ficha Técnica y Póliza' },
          { id: 'peritaje360', label: '2. Peritaje Daños 360°' },
          { id: 'pertenencias', label: '3. Gasolina e Inventario' },
          { id: 'firma', label: '4. Firma Digital Recepción' }
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id as any)}
            className={`py-2.5 px-2 rounded-xl transition border ${
              tab === s.id
                ? 'bg-[#1B1B1B] text-[#91B146] border-[#1B1B1B] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Ficha Técnica */}
      {tab === 'ficha' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Datos del Siniestro y Vehículo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Procedencia / Canal</label>
              <select
                value={procedencia}
                onChange={(e) => setProcedencia(e.target.value as Procedencia)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="Chubb">Chubb Seguros</option>
                <option value="GNP">GNP Seguros</option>
                <option value="Renta de autos">Renta de autos (Flotilla)</option>
                <option value="Lote">Lote Seminuevos</option>
                <option value="Particular">Particular / Taller Libre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Siniestro / Reporte</label>
              <input
                type="text"
                value={siniestro}
                onChange={(e) => setSiniestro(e.target.value)}
                placeholder="Ej. CHUBB-902148"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Póliza o Inciso</label>
              <input
                type="text"
                value={poliza}
                onChange={(e) => setPoliza(e.target.value)}
                placeholder="Ej. POL-99812-B"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Cliente</label>
              <input
                type="text"
                required
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Ej. Juan Carlos Lozano"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp)</label>
              <input
                type="tel"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                placeholder="Ej. 55 4123 9081"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
            Identificación de la Unidad
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Mazda, VW, Nissan"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Submarca / Versión</label>
              <input
                type="text"
                value={submarca}
                onChange={(e) => setSubmarca(e.target.value)}
                placeholder="Ej. CX-5 Grand Touring"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Modelo / Año</label>
              <input
                type="number"
                value={modeloAnio}
                onChange={(e) => setModeloAnio(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color de Carrocería</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Rojo Diamante Tricapa"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Placas de Circulación</label>
              <input
                type="text"
                required
                value={placas}
                onChange={(e) => setPlacas(e.target.value.toUpperCase())}
                placeholder="Ej. NXX-492-B"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número de Serie (VIN - 17 caracteres)</label>
              <input
                type="text"
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Ej. 3VWD17AJ7PM019284"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kilometraje Actual</label>
              <input
                type="number"
                value={kilometraje}
                onChange={(e) => setKilometraje(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setTab('peritaje360')}
              className="px-6 py-2.5 bg-[#1B1B1B] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Continuar a Peritaje 360° →
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Peritaje 360° */}
      {tab === 'peritaje360' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Inspección y Peritaje Fotográfico 360°
            </h3>
            <p className="text-xs text-slate-500">
              Selecciona las zonas de la carrocería afectadas para registrar los daños previos al desmontaje.
            </p>
          </div>

          {/* Damage Registration Panel */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zona Afectada</label>
              <select
                value={selectedZona}
                onChange={(e) => setSelectedZona(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl bg-white font-medium"
              >
                {ZONAS_360.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Daño</label>
              <select
                value={tipoDano}
                onChange={(e) => setTipoDano(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-xl bg-white font-medium"
              >
                <option value="Golpe">Golpe / Deformación</option>
                <option value="Rayón">Rayón / Tallón</option>
                <option value="Abolladura">Abolladura Leve</option>
                <option value="Faltante">Pieza Rota o Faltante</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nota o Detalle</label>
              <input
                type="text"
                value={notaDano}
                onChange={(e) => setNotaDano(e.target.value)}
                placeholder="Ej. Invasión de descuadre, grapa rota..."
                className="w-full p-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addDanoZona}
                className="w-full py-2 bg-[#67A0CD] hover:bg-[#5287b0] text-white font-bold rounded-xl transition"
              >
                + Registrar Daño
              </button>
            </div>
          </div>

          {/* Visual Damage Badges list */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Daños Registrados en Inventario ({danos.length})
            </h4>
            {danos.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Aún no has agregado zonas con daño. Agrega las partes dañadas arriba.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {danos.map((d, index) => (
                  <div
                    key={index}
                    className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{d.zona}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                        {d.tipoDano}
                      </span>
                      {d.nota && <p className="text-slate-600 mt-1 italic text-[11px]">"{d.nota}"</p>}
                    </div>
                    <button
                      onClick={() => removeDano(index)}
                      className="text-slate-400 hover:text-rose-600 font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setTab('ficha')}
              className="px-5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
            >
              ← Volver a Ficha
            </button>
            <button
              onClick={() => setTab('pertenencias')}
              className="px-6 py-2.5 bg-[#1B1B1B] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Continuar a Gasolina e Inventario →
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Gasolina e Inventario */}
      {tab === 'pertenencias' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          {/* Fuel Level Gauge */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#91B146]" />
              Nivel de Combustible en Tanque
            </label>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {(['E', '1/4', '1/2', '3/4', 'F'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setNivelGasolina(level)}
                  className={`py-3 rounded-xl font-bold border transition ${
                    nivelGasolina === level
                      ? 'bg-[#91B146] text-white border-[#91B146] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level === 'E' ? 'Vacío (E)' : level === 'F' ? 'Lleno (F)' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Tire Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              Estado de los Neumáticos
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(['Excelente', 'Bueno', 'Regular', 'Malo'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setEstadoLlantas(est)}
                  className={`py-2 rounded-xl font-semibold border transition ${
                    estadoLlantas === est
                      ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {/* Belongings Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#67A0CD]" />
              Pertenencias e Inventario a Bordo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PERTENENCIAS_COMUNES.map((item) => {
                const isSelected = selectedPertenencias.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePertenencia(item)}
                    className={`p-3 rounded-xl text-left border text-xs font-medium flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#67A0CD] text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item}</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-[#67A0CD] text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning Lights / Testigos encendidos */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-500" />
              Testigos de Avería Encendidos en Tablero al Recibir
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TESTIGOS_TABLERO.map((t) => {
                const isSelected = selectedTestigos.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTestigo(t)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition text-center ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setTab('peritaje360')}
              className="px-5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
            >
              ← Volver a Peritaje 360°
            </button>
            <button
              onClick={() => setTab('firma')}
              className="px-6 py-2.5 bg-[#1B1B1B] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Continuar a Firma Digital →
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Firma Digital de Recepción */}
      {tab === 'firma' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#91B146]" />
              Firma Digital de Conformidad de Inventario
            </h3>
            <p className="text-xs text-slate-500">
              El cliente valida las condiciones iniciales, pertenencias y nivel de gasolina de la unidad al ingresar al taller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Pad */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Firma del Cliente: {clienteNombre || 'Cliente'}
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpiar trazo
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden touch-none">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Firma con tu dedo o mouse dentro del recuadro superior
              </p>
            </div>

            {/* Asesor info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <span className="text-xs font-bold text-slate-800 block">
                Asesor de Servicio Responsable
              </span>
              <div>
                <label className="block text-slate-600 mb-1">Nombre del Asesor</label>
                <input
                  type="text"
                  value={asesorNombre}
                  onChange={(e) => setAsesorNombre(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Garantía Carbody
                </p>
                <p>
                  Al guardar, este inventario quedará vinculado al expediente y pasará automáticamente al módulo de Valuación e Inspección.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setTab('pertenencias')}
              className="px-5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
            >
              ← Volver a Inventario
            </button>
            <button
              onClick={handleSaveExpediente}
              className="px-6 py-2.5 bg-[#91B146] hover:bg-[#7e9c3b] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar y Finalizar Recepción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
