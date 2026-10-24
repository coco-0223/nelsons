"use client";

import React, { useState, useEffect } from 'react';
import { UnitType } from '@/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface CatalogItem {
  name: string;
  unitType: UnitType;
  buyPrice: number;
  packageSize: number;
}

export default function AdminIngredients() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newItem, setNewItem] = useState<CatalogItem>({
    name: '',
    unitType: 'kg',
    buyPrice: 0,
    packageSize: 1
  });

  useEffect(() => {
    const stored = localStorage.getItem('coquetas_catalog');
    if (stored) {
      setCatalog(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const saveCatalog = (updated: CatalogItem[]) => {
    setCatalog(updated);
    localStorage.setItem('coquetas_catalog', JSON.stringify(updated));
  };

  const updateItem = (index: number, updates: Partial<CatalogItem>) => {
    const updated = [...catalog];
    updated[index] = { ...updated[index], ...updates };
    saveCatalog(updated);
  };

  const handleSaveItem = () => {
    if (!newItem.name.trim()) return;

    // Check if exists
    const exists = catalog.find(c => c.name.toLowerCase() === newItem.name.trim().toLowerCase());
    if (exists) {
      alert("Ya existe un ingrediente con ese nombre.");
      return;
    }

    const updated = [...catalog, { ...newItem, name: newItem.name.trim() }];
    saveCatalog(updated);
    setIsAdding(false);
    setNewItem({ name: '', unitType: 'kg', buyPrice: 0, packageSize: 1 });
  };

  const handleDelete = (name: string) => {
    if (!confirm(`¿Eliminar ${name} del catálogo maestro? Esto no afectará a las recetas que ya lo usen.`)) return;
    const updated = catalog.filter(c => c.name !== name);
    saveCatalog(updated);
  };

  if (!isLoaded) return <div className="text-gray-500">Cargando ingredientes...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo de Ingredientes</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--secondary)] transition-colors"
        >
          <Plus size={20} />
          Nuevo Ingrediente
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--primary)] p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Ingrediente Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
              <input 
                type="text"
                placeholder="Ej: Carne Picada"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medida</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-[var(--primary)] outline-none text-gray-900"
                value={newItem.unitType}
                onChange={e => setNewItem({...newItem, unitType: e.target.value as UnitType, packageSize: 1})}
              >
                <option value="kg">Kilo (kg)</option>
                <option value="lt">Litro (lt)</option>
                <option value="unid">Unidad/Paquete</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio Base</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input 
                  type="number"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                  value={newItem.buyPrice || ''}
                  onChange={e => setNewItem({...newItem, buyPrice: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          {newItem.unitType === 'unid' && (
            <div className="mb-4 md:w-1/4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidades por Paquete</label>
              <input 
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                value={newItem.packageSize || ''}
                onChange={e => setNewItem({...newItem, packageSize: Number(e.target.value)})}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveItem}
              disabled={!newItem.name.trim()}
              className="px-4 py-2 text-sm font-semibold bg-[var(--primary)] hover:bg-[var(--secondary)] disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Guardar Ingrediente
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-medium text-gray-600">Nombre</th>
              <th className="p-4 font-medium text-gray-600">Medida</th>
              <th className="p-4 font-medium text-gray-600">Precio Base</th>
              <th className="p-4 font-medium text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catalog.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  El catálogo está vacío. Crea ingredientes aquí o guarda nuevas recetas.
                </td>
              </tr>
            ) : (
              catalog.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--primary)] outline-none font-semibold text-gray-800 transition-colors"
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <select 
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--primary)] outline-none text-gray-600 transition-colors"
                        value={item.unitType}
                        onChange={(e) => updateItem(idx, { unitType: e.target.value as UnitType, packageSize: 1 })}
                      >
                        <option value="kg">Kilo (kg)</option>
                        <option value="lt">Litro (lt)</option>
                        <option value="unid">Unidad</option>
                      </select>
                      {item.unitType === 'unid' && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-sm">(</span>
                          <input 
                            type="number" 
                            className="w-12 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--primary)] outline-none text-sm text-gray-600 text-center"
                            value={item.packageSize}
                            onChange={(e) => updateItem(idx, { packageSize: Number(e.target.value) })}
                          />
                          <span className="text-gray-400 text-sm">u.)</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">$</span>
                      <input 
                        type="number"
                        className="w-24 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--primary)] outline-none font-medium text-[var(--primary)] transition-colors"
                        value={item.buyPrice}
                        onChange={(e) => updateItem(idx, { buyPrice: Number(e.target.value) })}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.name)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                      title="Eliminar del catálogo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
