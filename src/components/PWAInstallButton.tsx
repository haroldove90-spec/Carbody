import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone mode, do not show button
  if (isInstalled) {
    return (
      <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
        <Check className="w-3.5 h-3.5 text-[#91B146]" />
        App Instalada
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar Carbody en este dispositivo"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#91B146] hover:bg-[#7e9c3b] active:scale-95 transition-all rounded-lg shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar</span> Carbody
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-left relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://appdesignproyectos.com/carbodyicono.png"
                alt="Carbody"
                className="w-12 h-12 rounded-xl shadow-xs"
              />
              <div>
                <h3 className="text-base font-bold text-[#1B1B1B]">Instalar Carbody</h3>
                <p className="text-xs text-[#939395]">Acceso directo sin barras de navegador</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#67A0CD]" />
                  Instrucciones para iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>
                    Presiona el botón <strong>Compartir</strong> (icono con flecha hacia arriba) en la barra inferior de Safari.
                  </li>
                  <li>
                    Desliza hacia abajo en el menú y selecciona <strong>"Agregar al inicio"</strong>.
                  </li>
                  <li>
                    Confirma presionando <strong>"Agregar"</strong> en la esquina superior derecha.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#91B146]" />
                  Instrucciones para Android / Chrome / Edge:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>
                    Haz clic en los <strong>tres puntos (⋮)</strong> en la esquina superior derecha del navegador.
                  </li>
                  <li>
                    Selecciona <strong>"Instalar Carbody"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                  </li>
                  <li>
                    Confirma la instalación y ábrela como una app nativa en tu pantalla de inicio o escritorio.
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 px-4 bg-[#1B1B1B] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
