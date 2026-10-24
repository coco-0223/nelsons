"use client";

import { useState, useEffect } from "react";
import { CouponTemplate, UserCoupon } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Star, Search } from "lucide-react";

export function CouponCatalog() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<CouponTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for specific code redemption
  const [specificCodeInput, setSpecificCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, "coupons"));
      const loaded: CouponTemplate[] = [];
      snap.forEach(doc => {
        loaded.push({ id: doc.id, ...doc.data() } as CouponTemplate);
      });
      setCoupons(loaded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const redeemCoupon = async (coupon: CouponTemplate) => {
    if (!user) {
      alert("Debés iniciar sesión para conseguir cupones.");
      return;
    }
    
    if (user.points < coupon.pointsCost) {
      alert("No tenés suficientes puntos para canjear este cupón.");
      return;
    }

    // Determine the user's specific code or generate a random one
    const userCode = coupon.requiresSpecificCode && coupon.specificCode 
      ? coupon.specificCode 
      : "COQ-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if user already has it (especially if it requires specific code to avoid duplicating unlimited uses)
    if (coupon.requiresSpecificCode) {
      const alreadyHas = user.coupons?.find(c => c.couponTemplateId === coupon.id && !c.isUsed);
      if (alreadyHas) {
        alert("Ya tenés este cupón en tu billetera.");
        return;
      }
    }

    let confirmMsg = `¿Obtener ${coupon.name} por ${coupon.pointsCost} puntos?`;
    if (coupon.pointsCost === 0) {
      confirmMsg = `¿Añadir ${coupon.name} a tu billetera gratis?`;
    }

    if (confirm(confirmMsg)) {
      try {
        const newPoints = user.points - coupon.pointsCost;
        
        const newCoupon: UserCoupon = {
          id: Math.random().toString(36).substring(7),
          couponTemplateId: coupon.id,
          couponName: coupon.name,
          code: userCode,
          isUsed: false,
          acquiredAt: Date.now(),
          // snapshot info for checkout
          validDays: coupon.validDays || [],
          rewardType: coupon.rewardType,
          rewardValue: coupon.rewardValue
        };

        const updatedCoupons = [...(user.coupons || []), newCoupon];

        const updatedUser = {
          ...user,
          points: newPoints,
          coupons: updatedCoupons
        };

        await setDoc(doc(db, "users", user.uid), updatedUser);
        
        alert("¡Cupón adquirido con éxito! Actualizá la página para verlo en tu billetera.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Hubo un error al adquirir el cupón.");
      }
    }
  };

  const handleSpecificCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!specificCodeInput.trim()) return;

    const matchedCoupon = coupons.find(c => 
      c.requiresSpecificCode && 
      c.specificCode.toUpperCase() === specificCodeInput.trim().toUpperCase()
    );

    if (matchedCoupon) {
      redeemCoupon(matchedCoupon);
      setSpecificCodeInput("");
    } else {
      setErrorMsg("Código inválido o expirado.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando catálogo de cupones...</div>;
  if (coupons.length === 0) return null;

  // Filter public coupons (those that do NOT require a specific code)
  const publicCoupons = coupons.filter(c => !c.requiresSpecificCode);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-8">
      
      {/* SECCIÓN DE INGRESAR CÓDIGO */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2">
              <Ticket size={20} /> ¿Tenés un código especial?
            </h3>
            <p className="text-sm text-blue-700">Ingresá tu código promocional para añadir el cupón a tu billetera.</p>
          </div>
          <form onSubmit={handleSpecificCodeSubmit} className="flex-1 w-full relative">
            <input 
              type="text" 
              value={specificCodeInput}
              onChange={(e) => setSpecificCodeInput(e.target.value)}
              placeholder="Ej: INVIERNO2026"
              className="w-full pl-4 pr-32 py-3 rounded-xl border border-blue-200 uppercase font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white font-bold px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
            {errorMsg && <p className="text-red-500 text-xs font-bold mt-2 absolute -bottom-5 left-2">{errorMsg}</p>}
          </form>
        </div>
      </div>

      {/* CATÁLOGO PÚBLICO */}
      {publicCoupons.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Search className="text-[var(--primary)]" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Catálogo de Cupones</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicCoupons.map(coupon => (
              <div key={coupon.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                {coupon.isWelcomeCoupon && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                    BIENVENIDA
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{coupon.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{coupon.description}</p>
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Costo</span>
                    <span className="flex items-center gap-1 font-black text-xl text-[var(--primary)]">
                      <Star className="text-yellow-500 fill-yellow-500" size={20} />
                      {coupon.pointsCost}
                    </span>
                  </div>
                  <button 
                    onClick={() => redeemCoupon(coupon)}
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[var(--secondary)] transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Ticket size={16} /> Obtener
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
