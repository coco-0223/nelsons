
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-amber-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">🥟 EmpanadaMaster</span>
            <span className="bg-amber-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Costos</span>
          </div>
          <nav>
             <span className="text-sm font-medium opacity-90">Calculadora de Producción</span>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} EmpanadaMaster Pro - Gestión de Costos Eficiente
      </footer>
    </div>
  );
};
