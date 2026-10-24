'use client';
import React, { useState, useEffect } from 'react';
import { EnhancedRecipe } from '../../types';

export default function AdminRecipePanel() {
  const [recipes, setRecipes] = useState<EnhancedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-primary">Gestión de Recetario</h2>
        <div className="animate-pulse flex space-x-4 bg-accent/20 p-4 rounded-lg">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-accent rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-accent rounded"></div>
              <div className="h-4 bg-accent rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">Gestión de Recetario</h2>
      <div className="bg-white p-4 shadow-sm rounded-lg border border-accent">
        <h3 className="font-semibold text-secondary text-lg">Recetas Configuradas</h3>
        <p className="text-sm text-foreground mt-1 mb-4">
          Seleccione una receta para ver el desglose de costos y ajustar el margen de ganancia para calcular su precio sugerido.
        </p>
        {/* Futura lista interactiva de recetas */}
        <div className="text-center py-8 text-foreground/60 italic">
          No hay recetas cargadas actualmente.
        </div>
      </div>
    </div>
  );
}
