'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecretCodeInput() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 0) return;
    
    setStatus('loading');
    
    // Simulate validation delay
    setTimeout(() => {
      if (code.toUpperCase() === 'ERROR') {
        setStatus('error');
      } else {
        setStatus('success');
      }
      
      // Reset after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="p-6 bg-accent/30 rounded-xl shadow-sm border border-accent max-w-md mx-auto my-8">
      <h3 className="text-xl font-bold text-primary mb-3">¿Tienes un Código Secreto?</h3>
      <p className="text-sm text-foreground mb-4">Ingresa tu código para ganar puntos y beneficios exclusivos.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          type="text" 
          value={code} 
          onChange={(e) => setCode(e.target.value)}
          className="border border-secondary/40 focus:border-gold outline-none rounded-md px-4 py-3 text-foreground bg-white uppercase font-mono tracking-widest transition-colors"
          placeholder="Ej: NAVIDAD2026"
          disabled={status === 'loading'}
        />
        <motion.button 
          whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
          whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
          className={`font-bold py-3 rounded-md transition-colors ${
            status === 'loading' 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gold text-gold-foreground hover:bg-yellow-500 shadow-md'
          }`}
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Validando...' : 'Canjear Código'}
        </motion.button>
      </form>
      
      <AnimatePresence>
        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="p-3 bg-green-100 text-green-800 font-semibold rounded-md border border-green-200 text-center"
          >
            ¡Código canjeado con éxito! 🎉
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="p-3 bg-red-100 text-red-800 font-semibold rounded-md border border-red-200 text-center"
          >
            Código inválido o expirado.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
