'use client';
import React, { useState } from 'react';
import { createSecretCode } from '../../services/codesService';

export default function AdminSecretCodes() {
  const [message, setMessage] = useState('');

  const handleGenerate = () => {
    // Generar un código secreto con 500 puntos de premio y límite de 10 usos
    const newCode = createSecretCode('points', 500, 10);
    setMessage(`¡Código ${newCode.code} generado exitosamente!`);
    
    // Toast cleanup
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">Administrar Códigos Secretos</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-accent">
        <p className="text-foreground mb-4">
          Genera nuevos códigos para que los usuarios los canjeen por recompensas.
        </p>
        <button 
          onClick={handleGenerate}
          className="bg-gold text-gold-foreground font-bold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Generar Código Automático
        </button>
        
        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md shadow-sm transition-all">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
