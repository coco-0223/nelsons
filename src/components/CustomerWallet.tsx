"use client";

import { useAuth } from "@/context/AuthContext";
import { Star, Ticket, Sparkles, Plus } from "lucide-react";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";

export function CustomerWallet() {
  const { user, setUser } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  if (!user) return null;

  const claimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, "promo_coupons"), where("code", "==", code.toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("El código ingresado no existe o expiró.");
        setLoading(false);
        return;
      }

      const couponDoc = snap.docs[0];
      const coupon = couponDoc.data();

      if (!coupon.active) {
        alert("Este cupón ya no está activo.");
        setLoading(false);
        return;
      }

      if (coupon.usageLimit !== -1 && coupon.usesCount >= coupon.usageLimit) {
        alert("Este cupón alcanzó su límite de usos.");
        setLoading(false);
        return;
      }

      const activeCoupons = user.activePromoCoupons || [];
      if (activeCoupons.includes(coupon.code)) {
        alert("Ya tenés este cupón en tu billetera.");
        setLoading(false);
        return;
      }

      const updatedUser = { ...user, activePromoCoupons: [...activeCoupons, coupon.code] };
      await updateDoc(doc(db, "users", user.uid), { activePromoCoupons: updatedUser.activePromoCoupons });
      if (setUser) setUser(updatedUser);
      
      alert("¡Cupón agregado con éxito!");
      setCode("");
    } catch (err) {
      console.error(err);
      alert("Error al validar el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[var(--primary)] to-amber-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 p-8 opacity-20 pointer-events-none transform rotate-12">
        <Sparkles size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-lg font-bold opacity-90">Tu Billetera Coqueta</h3>
          <div className="flex items-center gap-3 mt-2">
            <Star className="text-yellow-300 fill-yellow-300" size={32} />
            <span className="text-5xl font-black">{user.points || 0} <span className="text-xl font-bold opacity-80">Pts</span></span>
          </div>
          <p className="text-sm mt-2 opacity-90 max-w-xs">Acumulá puntos con tus compras y canjealos por descuentos o premios exclusivos.</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full md:w-64 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={20} className="text-yellow-300" />
            <h4 className="font-bold">Mis Cupones</h4>
          </div>
          
          {(!user.coupons || user.coupons.length === 0) ? (
            <p className="text-sm opacity-70 italic">No tenés cupones activos.</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {user.coupons.filter(c => !c.isUsed).map(coupon => (
                <div key={coupon.id} className="bg-white text-[var(--primary)] rounded-lg p-2 text-sm font-bold flex flex-col gap-1 shadow-sm">
                  <span className="truncate">{coupon.prizeName} (Premio)</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono text-center border border-gray-200">{coupon.code}</span>
                </div>
              ))}
              {(user.activePromoCoupons || []).map(code => (
                <div key={code} className="bg-white text-[var(--primary)] rounded-lg p-2 text-sm font-bold flex flex-col gap-1 shadow-sm border border-[var(--primary)]">
                  <span className="truncate text-center">Cupón Promocional</span>
                  <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded text-xs font-mono text-center">{code}</span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={claimCode} className="mt-3 flex gap-2">
            <input 
              type="text" 
              placeholder="¿Tenés un código?"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-sm outline-none placeholder:text-white/60 focus:bg-white text-gray-900 focus:placeholder:text-gray-400 transition-colors"
            />
            <button disabled={loading || !code.trim()} type="submit" className="bg-white text-[var(--primary)] p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
