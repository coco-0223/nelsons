"use client";

import React, { useState, useEffect } from 'react';
import { Recipe, CostIngredient, UnitType, CostBreakdown } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#78350f', '#92400e'];

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Partial<Recipe> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [catalog, setCatalog] = useState<{name: string; unitType: UnitType; buyPrice: number; packageSize: number}[]>([]);

  useEffect(() => {
    const storedRecipes = localStorage.getItem('coquetas_recipes');
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }
    const storedCatalog = localStorage.getItem('coquetas_catalog');
    if (storedCatalog) {
      setCatalog(JSON.parse(storedCatalog));
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (updated: Recipe[]) => {
    setRecipes(updated);
    localStorage.setItem('coquetas_recipes', JSON.stringify(updated));
  };

  const calculateBreakdown = (recipe: Recipe): CostBreakdown => {
    let totalBatchCost = 0;
    const ingredientBreakdown = recipe.ingredients.map(ing => {
      const unitCost = ing.unitType === 'unid' 
        ? ing.buyPrice / (ing.packageSize || 1) 
        : ing.buyPrice;
      
      const totalCost = unitCost * ing.quantityUsed;
      totalBatchCost += totalCost;

      let unitMeasure: string = ing.unitType;
      let unitQuantity = ing.quantityUsed / recipe.yield;

      if (ing.unitType === 'kg' && unitQuantity < 1) {
        unitQuantity *= 1000;
        unitMeasure = 'gr';
      } else if (ing.unitType === 'lt' && unitQuantity < 1) {
        unitQuantity *= 100;
        unitMeasure = 'cl';
      }

      return {
        name: ing.name,
        totalCost,
        unitCost: totalCost / recipe.yield,
        unitQuantity,
        unitMeasure
      };
    });

    return {
      totalBatchCost,
      costPerEmpanada: totalBatchCost / recipe.yield || 0,
      ingredientBreakdown
    };
  };

  const handleCreateNew = () => {
    setActiveRecipe({
      name: '',
      ingredients: [],
      yield: 12,
    });
    setIsEditing(true);
  };

  const handleSaveRecipe = () => {
    if (!activeRecipe?.name || !activeRecipe?.ingredients?.length) return;
    
    const recipeData: Recipe = {
      id: activeRecipe.id || crypto.randomUUID(),
      name: activeRecipe.name,
      ingredients: activeRecipe.ingredients as CostIngredient[],
      yield: activeRecipe.yield || 12,
      createdAt: activeRecipe.createdAt || Date.now()
    };

    let updated;
    if (activeRecipe.id) {
      updated = recipes.map(r => r.id === activeRecipe.id ? recipeData : r);
    } else {
      updated = [recipeData, ...recipes];
    }
    
    // Update catalog with NEW ingredients or RENAMES
    const updatedCatalog = [...catalog];
    let catalogChanged = false;
    
    activeRecipe.ingredients.forEach(ing => {
      const currentName = ing.name.trim();
      if (!currentName) return;

      // Handle renames
      if (ing.originalName && ing.originalName !== currentName) {
        const catalogItem = updatedCatalog.find(c => c.name.toLowerCase() === ing.originalName!.toLowerCase());
        if (catalogItem) {
          catalogItem.name = currentName;
          catalogChanged = true;
        }
      }

      // Handle new items
      const exists = updatedCatalog.find(c => c.name.toLowerCase() === currentName.toLowerCase());
      if (!exists) {
        updatedCatalog.push({
          name: currentName,
          unitType: ing.unitType,
          buyPrice: ing.buyPrice,
          packageSize: ing.packageSize
        });
        catalogChanged = true;
      }
    });

    if (catalogChanged) {
      setCatalog(updatedCatalog);
      localStorage.setItem('coquetas_catalog', JSON.stringify(updatedCatalog));
    }
    
    saveToStorage(updated);
    setIsEditing(false);
    setActiveRecipe(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta receta?')) return;
    const updated = recipes.filter(r => r.id !== id);
    saveToStorage(updated);
  };

  const handleAddIngredient = () => {
    const newIng: CostIngredient = {
      id: crypto.randomUUID(),
      name: '',
      unitType: 'kg',
      buyPrice: 0,
      packageSize: 1,
      quantityUsed: 0
    };
    setActiveRecipe(prev => ({
      ...prev,
      ingredients: [...(prev?.ingredients || []), newIng]
    }));
  };

  const updateIngredient = (id: string, updates: Partial<CostIngredient>) => {
    setActiveRecipe(prev => {
      if (!prev) return prev;
      
      let newUpdates = { ...updates };
      
      if (updates.name !== undefined) {
        const found = catalog.find(c => c.name.toLowerCase() === updates.name!.trim().toLowerCase());
        if (found) {
          newUpdates.unitType = found.unitType;
          newUpdates.buyPrice = found.buyPrice;
          newUpdates.packageSize = found.packageSize;
          newUpdates.originalName = found.name;
        }
      }

      return {
        ...prev,
        ingredients: prev.ingredients?.map(ing => ing.id === id ? { ...ing, ...newUpdates } : ing)
      };
    });
  };

  const removeIngredient = (id: string) => {
    setActiveRecipe(prev => ({
      ...prev,
      ingredients: prev?.ingredients?.filter(ing => ing.id !== id)
    }));
  };

  if (!isLoaded) return <div className="text-gray-500">Cargando recetario...</div>;

  return (
    <div>
      {!isEditing ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Recetario y Costos</h1>
            <button 
              onClick={handleCreateNew}
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--secondary)] transition-colors"
            >
              <Plus size={20} />
              Nueva Receta
            </button>
          </div>

          {recipes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-medium text-gray-600">No tienes recetas aún</h3>
              <p className="text-gray-400 mt-2 mb-6">Empieza creando tu primer tipo de empanada para calcular costos.</p>
              <button 
                onClick={handleCreateNew}
                className="text-[var(--primary)] font-semibold hover:underline"
              >
                Crear mi primera receta &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {recipes.map(recipe => {
                const breakdown = calculateBreakdown(recipe);
                return (
                  <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
                          <p className="text-sm text-gray-500">Producción: {recipe.yield} unidades</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-medium uppercase">Costo Batch</p>
                          <p className="text-2xl font-black text-[var(--primary)]">${breakdown.totalBatchCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 mb-6 flex justify-around">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase font-bold">Por unidad</p>
                          <p className="text-lg font-bold text-gray-700">${breakdown.costPerEmpanada.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="border-r border-gray-200" />
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase font-bold">Ingredientes</p>
                          <p className="text-lg font-bold text-gray-700">{recipe.ingredients.length}</p>
                        </div>
                      </div>

                      {showBreakdown === recipe.id && (
                        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                          <h4 className="text-sm font-bold text-gray-700">📊 Desglose por empanada:</h4>
                          <div className="space-y-2">
                            {breakdown.ingredientBreakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.name} <span className="text-xs text-gray-400">({item.unitQuantity.toFixed(1)} {item.unitMeasure})</span></span>
                                <span className="font-medium text-gray-700">${item.unitCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="h-48 mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={breakdown.ingredientBreakdown}
                                  dataKey="totalCost"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                >
                                  {breakdown.ingredientBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-between gap-2">
                      <button 
                        onClick={() => setShowBreakdown(showBreakdown === recipe.id ? null : recipe.id)}
                        className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex justify-center items-center gap-1"
                      >
                        {showBreakdown === recipe.id ? <><ChevronUp size={16}/> Ocultar</> : <><ChevronDown size={16}/> Ver Desglose</>}
                      </button>
                      <button 
                        onClick={() => {
                          setActiveRecipe({
                            ...recipe,
                            ingredients: recipe.ingredients.map(ing => ({...ing, originalName: ing.name}))
                          });
                          setIsEditing(true);
                        }}
                        className="px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(recipe.id)}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
          <div className="bg-[var(--primary)] p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gestionar Receta</h2>
              <p className="opacity-90 text-sm mt-1">Define tus costos de producción paso a paso.</p>
            </div>
            <button onClick={() => setIsEditing(false)} className="hover:bg-black/20 p-2 rounded-full transition-colors">
               ✕
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Empanada</label>
                <input 
                  type="text"
                  placeholder="Ej: Carne Suave, Jamón y Queso..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all text-gray-900"
                  value={activeRecipe?.name}
                  onChange={e => setActiveRecipe(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Empanadas Producidas (Batch)</label>
                <input 
                  type="number"
                  placeholder="Ej: 24"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all text-gray-900"
                  value={activeRecipe?.yield || ''}
                  onChange={e => setActiveRecipe(prev => ({ ...prev, yield: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ingredientes</h3>

              <div className="space-y-4">
                {activeRecipe?.ingredients?.map((ing) => (
                  <div key={ing.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                    <button 
                      onClick={() => removeIngredient(ing.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Ingrediente</label>
                        <input 
                          type="text"
                          list="ingredients-catalog"
                          placeholder="Ej: Cebolla"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                          value={ing.name}
                          onChange={e => updateIngredient(ing.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidad de Medida</label>
                        <select 
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-[var(--primary)] outline-none text-gray-900"
                          value={ing.unitType}
                          onChange={e => updateIngredient(ing.id, { unitType: e.target.value as UnitType, packageSize: 1 })}
                        >
                          <option value="kg">Kilogramos (kg)</option>
                          <option value="lt">Litros (lt)</option>
                          <option value="unid">Unidad/Paquete</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cant. Usada en receta</label>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                          value={ing.quantityUsed || ''}
                          onChange={e => updateIngredient(ing.id, { quantityUsed: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Precio de Compra (Por {ing.unitType === 'unid' ? 'Paquete' : (ing.unitType === 'kg' ? 'Kilo' : 'Litro')})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                            value={ing.buyPrice || ''}
                            onChange={e => updateIngredient(ing.id, { buyPrice: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      {ing.unitType === 'unid' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidades por Paquete</label>
                          <input 
                            type="number"
                            placeholder="Ej: 12"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[var(--primary)] outline-none text-gray-900"
                            value={ing.packageSize || ''}
                            onChange={e => updateIngredient(ing.id, { packageSize: Number(e.target.value) })}
                          />
                        </div>
                      )}

                      <div className="text-right ml-auto">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Costo Imputado a Receta</p>
                        <p className="text-xl font-black text-gray-700">
                          ${((ing.unitType === 'unid' ? ing.buyPrice / (ing.packageSize || 1) : ing.buyPrice) * ing.quantityUsed).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleAddIngredient}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:bg-gray-50 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  <span>Añadir Ingrediente</span>
                </button>

                <datalist id="ingredients-catalog">
                  {catalog.map((cat, idx) => (
                    <option key={idx} value={cat.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="bg-gray-50 p-6 -mx-8 -mb-8 mt-8 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setActiveRecipe(null);
                }}
                className="text-gray-500 font-medium hover:text-gray-700 px-4 py-2"
              >
                Cancelar
              </button>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase">Costo Total Batch</p>
                  <p className="text-3xl font-black text-[var(--primary)]">
                    ${activeRecipe?.ingredients?.reduce((acc, ing) => {
                      const unitPrice = ing.unitType === 'unid' ? (ing.buyPrice / (ing.packageSize || 1)) : ing.buyPrice;
                      return acc + (unitPrice * ing.quantityUsed);
                    }, 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
                <button 
                  onClick={handleSaveRecipe}
                  disabled={!activeRecipe?.name || !activeRecipe?.ingredients?.length}
                  className="bg-[var(--primary)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[var(--primary)]/30 transition-all"
                >
                  Guardar Receta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
