'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockRewards = [
  { id: '1', name: 'Empanada de Carne Gratis', points: 150, type: 'Producto' },
  { id: '2', name: 'Envío Bonificado', points: 200, type: 'Servicio' },
  { id: '3', name: 'Suscripción Mensual (Club)', points: 5000, type: 'Suscripción' },
];

export default function RewardsCatalog() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Catálogo de Recompensas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockRewards.map((reward) => (
          <motion.div 
            key={reward.id}
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 border-2 border-gold rounded-xl shadow-md cursor-pointer bg-white flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 block">
                {reward.type}
              </span>
              <h3 className="font-bold text-xl text-foreground mb-2">{reward.name}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-accent flex justify-between items-center">
              <span className="text-gold font-black text-lg">{reward.points} pts</span>
              <button className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-semibold">
                Canjear
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
