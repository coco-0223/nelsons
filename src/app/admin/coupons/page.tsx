"use client";

import { useState, useEffect } from "react";
import { PromoCoupon, Product } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { Plus, Save, Trash2, Ticket, Send, EyeOff } from "lucide-react";

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const snapC = await getDocs(collection(db, "promo_coupons"));
      const loadedC: PromoCoupon[] = [];
      snapC.forEach(doc => {
        loadedC.push({ id: doc.id, ...doc.data() } as PromoCoupon);
      });
      setCoupons(loadedC);

      const snapP = await getDocs(collection(db, "products"));
      const loadedP: Product[] = [];
      snapP.forEach(doc => {
        loadedP.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(loadedP);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = () => {
    const newCoupon: PromoCoupon = {
      id: "temp_" + Date.now().toString(),
      code: "PROMO" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      description: "",
      type: "percentage",
      value: 10,
      usageLimit: -1,
      usesCount: 0,
      validDays: [],
      isHidden: false,
      active: true
    };
    setCoupons([newCoupon, ...coupons]);
  };

  const updateCoupon = (index: number, field: keyof PromoCoupon, value: any) => {
    const updated = [...coupons];
    updated[index] = { ...updated[index], [field]: value };
    setCoupons(updated);
  };

  const saveCoupon = async (coupon: PromoCoupon) => {
    try {
      const isNew = coupon.id.startsWith("temp_");
      const finalId = isNew ? Date.now().toString() : coupon.id;
      const dataToSave = { ...coupon, id: finalId };
      await setDoc(doc(db, "promo_coupons", finalId), dataToSave);
      
      setCoupons(prev => prev.map(c => c.id === coupon.id ? dataToSave : c));
      alert("Cupón guardado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el cupón");
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (couponId.startsWith("temp_")) {
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      return;
    }
    
    if (confirm("¿Estás seguro de eliminar este cupón?")) {
      try {
        await deleteDoc(doc(db, "promo_coupons", couponId));
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      } catch (err) {
        console.error(err);
        alert("Error al eliminar");
      }
    }
  };

  const sendToAll = async (coupon: PromoCoupon) => {
    if (!confirm(`¿Querés enviar el código ${coupon.code} a todos los clientes registrados? Aparecerá en sus billeteras automáticamente.`)) return;

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const batch: Promise<void>[] = [];
      
      usersSnap.forEach(userDoc => {
        const userData = userDoc.data();
        const activeCoupons = userData.activePromoCoupons || [];
        if (!activeCoupons.includes(coupon.code)) {
          batch.push(updateDoc(doc(db, "users", userDoc.id), {
            activePromoCoupons: [...activeCoupons, coupon.code]
          }));
        }
      });
      
      await Promise.all(batch);
      alert("¡Cupón enviado a todos los clientes con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al enviar masivamente.");
    }
  };

  const toggleDay = (index: number, dayNumber: number) => {
    const coupon = coupons[index];
    let newDays = [...coupon.validDays];
    if (newDays.includes(dayNumber)) {
      newDays = newDays.filter(d => d !== dayNumber);
    } else {
      newDays.push(dayNumber);
    }
    updateCoupon(index, 'validDays', newDays);
  };

  const daysOfWeek = [
    { num: 1, label: 'L' }, { num: 2, label: 'M' }, { num: 3, label: 'X' },
    { num: 4, label: 'J' }, { num: 5, label: 'V' }, { num: 6, label: 'S' }, { num: 0, label: 'D' }
  ];

  if (loading) return <div className="p-8">Cargando cupones...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="text-[var(--primary)]" />
            Gestor de Cupones (Independientes)
          </h1>
          <p className="text-gray-500 mt-1">Creá descuentos exclusivos para promocionar en redes o regalar directo a clientes sin usar puntos.</p>
        </div>
        <button onClick={addCoupon} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--secondary)] transition-colors shadow-sm">
          <Plus size={20} /> Nuevo Cupón
        </button>
      </div>

      <div className="space-y-6">
        {coupons.map((coupon, idx) => (
          <div key={coupon.id} className={`bg-white border-2 ${coupon.active ? 'border-gray-200' : 'border-red-100 opacity-60'} rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative group`}>
            
            <div className="absolute top-6 right-6 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => sendToAll(coupon)}
                disabled={coupon.id.startsWith("temp_")}
                title="Enviar a todos los clientes"
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
              <button 
                onClick={() => deleteCoupon(coupon.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={coupon.code}
                  onChange={e => updateCoupon(idx, 'code', e.target.value.toUpperCase())}
                  className="text-3xl font-black font-mono tracking-widest text-[var(--primary)] bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-[var(--primary)] outline-none pb-1 text-gray-900"
                  placeholder="CÓDIGO"
                />
                <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1 rounded-lg">
                  <input type="checkbox" checked={coupon.active} onChange={e => updateCoupon(idx, 'active', e.target.checked)} className="accent-[var(--primary)]" />
                  <span className="text-sm font-bold text-gray-700">Activo</span>
                </label>
              </div>
              
              <input 
                type="text" 
                value={coupon.description}
                onChange={e => updateCoupon(idx, 'description', e.target.value)}
                className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-[var(--primary)] outline-none"
                placeholder="Descripción visible para el cliente (Ej: 20% OFF en Empanadas los Martes)"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Descuento</label>
                  <select 
                    value={coupon.type}
                    onChange={e => updateCoupon(idx, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                    <option value="free_product">Producto Gratis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valor</label>
                  <div className="flex items-center gap-2">
                    {coupon.type === 'fixed' && <span className="font-bold text-gray-500">$</span>}
                    <input 
                      type="number" 
                      value={coupon.value}
                      onChange={e => updateCoupon(idx, 'value', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-lg font-bold outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                    />
                    {coupon.type === 'percentage' && <span className="font-bold text-gray-500">%</span>}
                  </div>
                </div>

                {coupon.type === 'percentage' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tope Máx. (Opcional)</label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-500">$</span>
                      <input 
                        type="number" 
                        value={coupon.maxDiscount || ''}
                        onChange={e => updateCoupon(idx, 'maxDiscount', parseInt(e.target.value) || undefined)}
                        placeholder="Sin tope"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Límite de Usos Global</label>
                  <input 
                    type="number" 
                    value={coupon.usageLimit}
                    onChange={e => updateCoupon(idx, 'usageLimit', parseInt(e.target.value) || -1)}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">-1 = Infinito. Usado: {coupon.usesCount} veces.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                    Días Válidos
                    {coupon.validDays.length === 0 && <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded">TODOS</span>}
                  </label>
                  <div className="flex gap-1 justify-between">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.num}
                        onClick={() => toggleDay(idx, day.num)}
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${coupon.validDays.includes(day.num) ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={coupon.isHidden}
                    onChange={e => updateCoupon(idx, 'isHidden', e.target.checked)}
                    className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <EyeOff size={16} /> Cupón Oculto
                    </span>
                    <span className="text-xs text-gray-500 block max-w-xs">No aparecerá públicamente. Solo aplicable si escriben el código en el carrito.</span>
                  </div>
                </label>

                <button 
                  onClick={() => saveCoupon(coupon)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors"
                >
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Aún no hay cupones promocionales</h3>
            <p className="text-gray-500 mt-2">Creá un descuento para compartir en Instagram o regalar a clientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
