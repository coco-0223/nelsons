"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { PromoCoupon } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Tag, Plus, Check } from "lucide-react";

export function PublicCouponsSection() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicCoupons();
  }, []);

  const loadPublicCoupons = async () => {
    try {
      // Query active coupons that are NOT hidden
      const q = query(
        collection(db, "promo_coupons"),
        where("active", "==", true),
        where("isHidden", "==", false)
      );
      const snap = await getDocs(q);
      const loaded: PromoCoupon[] = [];
      snap.forEach(d => {
        const c = { id: d.id, ...d.data() } as PromoCoupon;
        // Verify day
        const today = new Date().getDay();
        if (c.validDays && c.validDays.length > 0 && !c.validDays.includes(today)) {
          return;
        }
        // Verify limits
        if (c.usageLimit !== -1 && c.usesCount >= c.usageLimit) {
          return;
        }
        loaded.push(c);
      });
      setCoupons(loaded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const claimCoupon = async (couponCode: string) => {
    if (!user) {
      alert("Debés iniciar sesión para guardar cupones.");
      return;
    }
    try {
      const activeCoupons = user.activePromoCoupons || [];
      if (activeCoupons.includes(couponCode)) return;

      const updatedUser = { ...user, activePromoCoupons: [...activeCoupons, couponCode] };
      await updateDoc(doc(db, "users", user.uid), { activePromoCoupons: updatedUser.activePromoCoupons });
      if (setUser) setUser(updatedUser);
      alert("¡Cupón guardado en tu billetera!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar cupón.");
    }
  };

  if (loading || coupons.length === 0) return null;

  return (
    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
      <h3 className="text-lg font-black text-purple-900 flex items-center gap-2 mb-4">
        <Tag size={20} /> Cupones del Día
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const hasIt = user?.activePromoCoupons?.includes(coupon.code);
          return (
            <div key={coupon.id} className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-between h-full">
              <div>
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded mb-2">
                  {coupon.type === 'fixed' ? `$${coupon.value} OFF` : 
                   coupon.type === 'percentage' ? `${coupon.value}% OFF` : 'REGALO'}
                </span>
                <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{coupon.description}</h4>
                <p className="text-xs text-gray-400 font-mono mb-4">CÓDIGO: {coupon.code}</p>
              </div>
              <button 
                onClick={() => claimCoupon(coupon.code)}
                disabled={hasIt}
                className={`w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${hasIt ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                {hasIt ? <><Check size={16} /> Guardado</> : <><Plus size={16} /> Obtener</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
