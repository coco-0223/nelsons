import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Recipe, Ingredient, UnitType, CostBreakdown } from './types';
import { suggestRecipeIngredients } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#78350f', '#92400e'];

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Partial<Recipe> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

  // Initialize with real-time data from Firestore
  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes(recipeList);
    });
    return () => unsubscribe();
  }, []);

  const calculateBreakdown = (recipe: Recipe): CostBreakdown => {
    let totalBatchCost = 0;
    const ingredientBreakdown = recipe.ingredients.map(ing => {
      const unitCost = ing.unitType === 'unid' 
        ? ing.buyPrice / ing.packageSize 
        : ing.buyPrice;
      
      const totalCost = unitCost * ing.quantityUsed;
      totalBatchCost += totalCost;

      // Formatting for single unit breakdown
      // Fix: Explicitly type unitMeasure as string to prevent it from being inferred as UnitType,
      // which allows assigning 'gr' and 'cl' later.
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

  const handleSaveRecipe = async () => {
    if (!activeRecipe?.name || !activeRecipe?.ingredients?.length) return;
    
    const recipeData = {
      name: activeRecipe.name,
      ingredients: activeRecipe.ingredients,
      yield: activeRecipe.yield,
      createdAt: Date.now()
    };

    if (activeRecipe.id) {
      await updateDoc(doc(db, 'recipes', activeRecipe.id), recipeData);
    } else {
      await addDoc(collection(db, 'recipes'), recipeData);
    }
    
    setIsEditing(false);
    setActiveRecipe(null);
  };

  const handleAddIngredient = () => {
    const newIng: Ingredient = {
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

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setActiveRecipe(prev => ({
      ...prev,
      ingredients: prev?.ingredients?.map(ing => ing.id === id ? { ...ing, ...updates } : ing)
    }));
  };

  const removeIngredient = (id: string) => {
    setActiveRecipe(prev => ({
      ...prev,
      ingredients: prev?.ingredients?.filter(ing => ing.id !== id)
    }));
  };

  const handleAISuggestion = async () => {
    if (!activeRecipe?.name) return alert("Por favor ingresa un nombre para la empanada (ej. Carne Suave)");
    setIsLoadingSuggestion(true);
    const suggestion = await suggestRecipeIngredients(activeRecipe.name);
    if (suggestion) {
      setActiveRecipe(prev => ({
        ...prev,
        ingredients: suggestion.map((s: any) => ({
          ...s,
          id: crypto.randomUUID(),
          buyPrice: 0 // User must fill prices
        }))
      }));
    }
    setIsLoadingSuggestion(false);
  };

  return (
    <Layout>
      {!isEditing ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Mis Recetas</h1>
            <button 
              onClick={handleCreateNew}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Nueva Empanada</span>
            </button>
          </div>

          {recipes.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-medium text-slate-600">No tienes recetas aún</h3>
              <p className="text-slate-400 mt-2 mb-6">Empieza creando tu primer tipo de empanada para calcular costos.</p>
              <button 
                onClick={handleCreateNew}
                className="text-amber-600 font-semibold hover:underline"
              >
                Crear mi primera receta &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map(recipe => {
                const breakdown = calculateBreakdown(recipe);
                return (
                  <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{recipe.name}</h3>
                          <p className="text-sm text-slate-500">Producción: {recipe.yield} unidades</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-medium uppercase">Costo Total</p>
                          <p className="text-2xl font-black text-amber-600">${breakdown.totalBatchCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 mb-6 flex justify-around">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 uppercase font-bold">Por unidad</p>
                          <p className="text-lg font-bold text-slate-700">${breakdown.costPerEmpanada.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="border-r border-slate-200" />
                        <div className="text-center">
                          <p className="text-xs text-slate-400 uppercase font-bold">Ingredientes</p>
                          <p className="text-lg font-bold text-slate-700">{recipe.ingredients.length}</p>
                        </div>
                      </div>

                      {showBreakdown === recipe.id && (
                        <div className="mt-4 border-t pt-4 space-y-3">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                            <span>📊 Desglose por empanada:</span>
                          </h4>
                          <div className="space-y-2">
                            {breakdown.ingredientBreakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name} <span className="text-xs text-slate-400">({item.unitQuantity.toFixed(1)} {item.unitMeasure})</span></span>
                                <span className="font-medium text-slate-700">${item.unitCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="h-48 mt-4">
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
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 border-t border-slate-200 p-3 flex justify-between space-x-2">
                      <button 
                        onClick={() => setShowBreakdown(showBreakdown === recipe.id ? null : recipe.id)}
                        className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors"
                      >
                        {showBreakdown === recipe.id ? 'Ocultar Detalle' : 'Ver Detalle'}
                      </button>
                      <button 
                        onClick={() => {
                          setActiveRecipe(recipe);
                          setIsEditing(true);
                        }}
                        className="px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-100 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('¿Borrar receta?')) {
                            await deleteDoc(doc(db, 'recipes', recipe.id));
                          }
                        }}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto">
          <div className="bg-amber-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Gestionar Receta</h2>
            <p className="opacity-90">Define tus costos de producción paso a paso.</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Header Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Empanada</label>
                <input 
                  type="text"
                  placeholder="Ej: Carne Suave, Jamón y Queso..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  value={activeRecipe?.name}
                  onChange={e => setActiveRecipe(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Empanadas Producidas (Batch)</label>
                <input 
                  type="number"
                  placeholder="Ej: 24"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  value={activeRecipe?.yield}
                  onChange={e => setActiveRecipe(prev => ({ ...prev, yield: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <h3 className="text-lg font-bold text-slate-800">Ingredientes</h3>
              <button 
                onClick={handleAISuggestion}
                disabled={isLoadingSuggestion}
                className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all flex items-center space-x-1"
              >
                <span>✨ {isLoadingSuggestion ? 'Sugiriendo...' : 'Sugerir con IA'}</span>
              </button>
            </div>

            {/* Ingredients List */}
            <div className="space-y-4">
              {activeRecipe?.ingredients?.map((ing) => (
                <div key={ing.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 relative">
                  <button 
                    onClick={() => removeIngredient(ing.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                      <input 
                        type="text"
                        placeholder="Ingrediente..."
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
                        value={ing.name}
                        onChange={e => updateIngredient(ing.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidad</label>
                      <select 
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm bg-white"
                        value={ing.unitType}
                        onChange={e => updateIngredient(ing.id, { unitType: e.target.value as UnitType, packageSize: 1 })}
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="lt">Litros (lt)</option>
                        <option value="unid">Unidad/Paquete</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad Usada</label>
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
                        value={ing.quantityUsed || ''}
                        onChange={e => updateIngredient(ing.id, { quantityUsed: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-3 rounded-lg border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Costo por {ing.unitType === 'unid' ? 'Paquete' : (ing.unitType === 'kg' ? 'Kilo' : 'Litro')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input 
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 rounded-md border border-slate-300 text-sm"
                          value={ing.buyPrice || ''}
                          onChange={e => updateIngredient(ing.id, { buyPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {ing.unitType === 'unid' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidades/Paquete</label>
                        <input 
                          type="number"
                          placeholder="Ej: 12"
                          className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
                          value={ing.packageSize || ''}
                          onChange={e => updateIngredient(ing.id, { packageSize: Number(e.target.value) })}
                        />
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Costo Utilizado</p>
                      <p className="text-lg font-black text-slate-700">
                        ${((ing.unitType === 'unid' ? ing.buyPrice / (ing.packageSize || 1) : ing.buyPrice) * ing.quantityUsed).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={handleAddIngredient}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>+ Añadir Item</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-6 flex justify-between items-center">
            <button 
              onClick={() => {
                setIsEditing(false);
                setActiveRecipe(null);
              }}
              className="text-slate-500 font-bold hover:text-slate-700"
            >
              Cancelar
            </button>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase">Total Estimado</p>
                <p className="text-2xl font-black text-amber-600">
                  ${activeRecipe?.ingredients?.reduce((acc, ing) => {
                    const unitPrice = ing.unitType === 'unid' ? (ing.buyPrice / (ing.packageSize || 1)) : ing.buyPrice;
                    return acc + (unitPrice * ing.quantityUsed);
                  }, 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <button 
                onClick={handleSaveRecipe}
                disabled={!activeRecipe?.name || !activeRecipe?.ingredients?.length}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all"
              >
                Guardar Receta
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;