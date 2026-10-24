"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, CartItem, PromoCoupon } from "@/types";
import { X, Star, CreditCard, Ticket, Tag, CalendarDays, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

interface Props {
  cart: CartItem[];
  cartTotal: number;
  settings: Partial<Settings>;
  onClose: () => void;
  onCheckoutSuccess: () => void;
}

export function CheckoutModal({ cart, cartTotal, settings, onClose, onCheckoutSuccess }: Props) {
  const { user } = useAuth();
  
  // Points logic
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Prize Coupon logic (bought with points)
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");

  // Promo Coupon logic (independent)
  const [promoCoupons, setPromoCoupons] = useState<PromoCoupon[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>("");

  // Customer Form
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerAddress, setCustomerAddress] = useState(user?.address || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayItems = cart.filter((item) => !item.isForFutureDate);
  const futureItems = cart.filter((item) => item.isForFutureDate);
  const hasFutureItems = futureItems.length > 0;
  const hasTodayItems = todayItems.length > 0;

  useEffect(() => {
    if (user?.activePromoCoupons && user.activePromoCoupons.length > 0) {
      loadPromoCoupons(user.activePromoCoupons);
    }
  }, [user]);

  const loadPromoCoupons = async (codes: string[]) => {
    try {
      const q = query(collection(db, "promo_coupons"), where("code", "in", codes));
      const snap = await getDocs(q);
      const loaded: PromoCoupon[] = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() } as PromoCoupon));
      setPromoCoupons(loaded);
    } catch (err) {
      console.error(err);
    }
  };

  const pointsValue = settings.marketing_loyaltyPointsValue || 0;
  
  // Calculate max points they can use
  const maxPointsNeeded = pointsValue > 0 ? Math.ceil(cartTotal / pointsValue) : 0;
  const maxPointsAvailable = user?.points || 0;
  const maxPointsToUse = Math.min(maxPointsNeeded, maxPointsAvailable);

  const pointsDiscount = usePoints ? (pointsToUse * pointsValue) : 0;
  
  const selectedCoupon = user?.coupons?.find(c => c.id === selectedCouponId && !c.isUsed);
  let prizeDiscount = 0;
  let prizeError = "";

  if (selectedCoupon) {
    const today = new Date().getDay(); 
    const validDays = selectedCoupon.validDays || [];
    
    if (validDays.length > 0 && !validDays.includes(today)) {
      prizeError = "El premio no es válido para usar hoy.";
    } else {
      if (selectedCoupon.rewardType === "discount_fixed") {
        prizeDiscount = Number(selectedCoupon.rewardValue);
      } else if (selectedCoupon.rewardType === "discount_percentage") {
        const percent = Number(selectedCoupon.rewardValue);
        prizeDiscount = (cartTotal * percent) / 100;
      } else if (selectedCoupon.rewardType === "free_item") {
        const productId = String(selectedCoupon.rewardValue);
        const cartItem = cart.find(item => item.product.id === productId);
        if (cartItem) {
          prizeDiscount = cartItem.isForFutureDate ? 
            (cartItem.product.priceOffer || cartItem.product.priceScheduled) : 
            (cartItem.product.priceOffer || cartItem.product.priceToday);
        } else {
          prizeError = "Debés agregar el ítem de regalo a tu pedido.";
        }
      }
    }
  }

  // Promo Coupon Logic
  const selectedPromo = promoCoupons.find(c => c.code === selectedPromoCode);
  let promoDiscount = 0;
  let promoError = "";

  if (selectedPromo) {
    const today = new Date().getDay();
    if (selectedPromo.validDays && selectedPromo.validDays.length > 0 && !selectedPromo.validDays.includes(today)) {
      promoError = "El cupón no es válido para usar hoy.";
    } else if (!selectedPromo.active) {
      promoError = "El cupón ya no está activo.";
    } else if (selectedPromo.usageLimit !== -1 && selectedPromo.usesCount >= selectedPromo.usageLimit) {
      promoError = "El cupón alcanzó su límite de usos.";
    } else {
      let applicableTotal = cartTotal;
      if (selectedPromo.targetProducts && selectedPromo.targetProducts.length > 0) {
        applicableTotal = cart.reduce((sum, item) => {
          if (selectedPromo.targetProducts!.includes(item.product.id!)) {
            const price = item.isForFutureDate ? (item.product.priceOffer || item.product.priceScheduled) : (item.product.priceOffer || item.product.priceToday);
            return sum + (price * item.quantity);
          }
          return sum;
        }, 0);

        if (applicableTotal === 0) {
          promoError = "El cupón no aplica a los productos de tu carrito.";
        }
      }

      if (!promoError) {
        if (selectedPromo.type === "fixed") {
          promoDiscount = Math.min(applicableTotal, selectedPromo.value);
        } else if (selectedPromo.type === "percentage") {
          let calculatedDiscount = (applicableTotal * selectedPromo.value) / 100;
          if (selectedPromo.maxDiscount && selectedPromo.maxDiscount > 0) {
            calculatedDiscount = Math.min(calculatedDiscount, selectedPromo.maxDiscount);
          }
          promoDiscount = calculatedDiscount;
        } else if (selectedPromo.type === "free_product") {
          if (selectedPromo.targetProducts && selectedPromo.targetProducts.length > 0) {
             const cartItem = cart.find(item => selectedPromo.targetProducts!.includes(item.product.id!));
             if (cartItem) {
               promoDiscount = cartItem.isForFutureDate ? 
                  (cartItem.product.priceOffer || cartItem.product.priceScheduled) : 
                  (cartItem.product.priceOffer || cartItem.product.priceToday);
             }
          }
        }
      }
    }
  }

  const finalTotal = Math.max(0, cartTotal - pointsDiscount - prizeDiscount - promoDiscount);

  const handleCheckout = async () => {
    if (!customerName || !customerAddress || !customerPhone || !paymentMethod) {
      alert("Por favor completá tus datos de entrega y el método de pago.");
      return;
    }
    if (hasFutureItems && !deliveryDate) {
      alert("Tenés productos programados para otro día. Por favor indicá para qué fecha querés recibirlos.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user?.uid || null,
        customerName,
        customerAddress,
        customerPhone,
        items: cart,
        subtotal: cartTotal,
        discount: cartTotal - finalTotal,
        total: finalTotal,
        paymentMethod,
        deliveryDate,
        deliveryTime,
        status: "Pendiente",
        createdAt: Date.now()
      };
      
      const existingOrders = JSON.parse(localStorage.getItem("coquetas_orders") || "[]");
      localStorage.setItem("coquetas_orders", JSON.stringify([{ id: Date.now().toString(), ...orderData }, ...existingOrders]));

      try {
        await addDoc(collection(db, "orders"), orderData);
      } catch {
        // Fallback if Firebase is not configured in local dev
      }
      onCheckoutSuccess();
      onClose();
      alert("¡Pedido en NELSON'S confirmado con éxito! 🍕🫓");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#24598d] text-white">
          <div className="flex items-center gap-4">
            <img src="/nelsons-logo.png" alt="NELSON'S" className="h-10 w-auto rounded-none object-contain" />
            <div>
              <h3 className="font-archivo text-xl text-[#FFC71F]">FINALIZAR PEDIDO</h3>
              <p className="text-xs text-white/85">Pizzas y Focaccias Gourmet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[78vh] overflow-y-auto">
          
          <div className="space-y-4">
            <h4 className="font-archivo text-gray-900 border-b pb-2 uppercase">1. Tus Datos de Entrega</h4>
            <input type="text" placeholder="Nombre completo" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] bg-white" />
            <input type="text" placeholder="Dirección de entrega" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] bg-white" />
            <input type="text" placeholder="Teléfono / WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] bg-white" />
            
            <h4 className="font-archivo text-gray-900 border-b pb-2 pt-3 uppercase">2. Pago y Fecha</h4>
            
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] bg-white font-semibold">
              <option value="">Seleccionar Método de Pago...</option>
              <option value="Efectivo">Efectivo al recibir</option>
              <option value="Transferencia / Alias">Transferencia / Alias</option>
              {settings.paymentMethods?.filter(p => p.active).map(pm => (
                <option key={pm.id} value={pm.name}>{pm.name}</option>
              ))}
            </select>

            {hasFutureItems && (
              <div className="p-4 rounded-2xl bg-[#FFC71F]/25 border-2 border-[#FFC71F] space-y-3">
                <div className="font-archivo text-sm text-[#0f2540] flex items-center gap-2 uppercase">
                  <CalendarDays size={18} />
                  <span>¿Para qué fecha querés los productos programados?</span>
                </div>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full p-3 border-2 border-[#0f2540]/20 rounded-xl outline-none focus:border-[#0f2540] bg-white font-bold text-[#0f2540]"
                />
                <input
                  type="text"
                  placeholder="Franja horaria preferida (Ej: 20:30 hs)"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0f2540] bg-white text-sm"
                />
              </div>
            )}

            {!hasFutureItems && settings.deliveryDays && settings.deliveryDays.some(d => d.active) && (
              <select value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] bg-white">
                <option value="">Entrega Hoy (Lo antes posible)</option>
                {settings.deliveryDays?.filter(d => d.active).map(d => (
                  <option key={d.dayOfWeek} value={d.dayOfWeek}>{DAYS_OF_WEEK[d.dayOfWeek]}</option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h4 className="font-archivo text-gray-900 border-b pb-2 uppercase">Resumen del Pedido</h4>

              {/* BLOQUE 1: ENTREGA HOY */}
              {hasTodayItems && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 p-3.5 space-y-2">
                  <div className="font-archivo text-xs uppercase text-emerald-900 flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>🟢 Entrega Hoy</span>
                  </div>
                  {todayItems.map((item, idx) => {
                    const price = item.product.priceOffer || item.product.priceToday;
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-xl border border-emerald-100">
                        <span className="font-bold text-gray-800">{item.quantity}x {item.product.name}</span>
                        <span className="font-archivo text-emerald-700">${(price * item.quantity).toLocaleString("es-AR")}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BLOQUE 2: ENTREGA FUTURA (OTRO DÍA) */}
              {hasFutureItems && (
                <div className="rounded-2xl bg-[#FFC71F]/25 border-2 border-[#FFC71F] p-3.5 space-y-2">
                  <div className="font-archivo text-xs uppercase text-[#0f2540] flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    <span>🟡 Entrega Futura (Otro Día)</span>
                  </div>
                  {futureItems.map((item, idx) => {
                    const price = item.product.priceOffer || item.product.priceScheduled;
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-xl border border-[#FFC71F]/50">
                        <span className="font-bold text-gray-800">{item.quantity}x {item.product.name}</span>
                        <span className="font-archivo text-[#0f2540]">${(price * item.quantity).toLocaleString("es-AR")}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-archivo text-lg">${cartTotal.toLocaleString("es-AR")}</span>
              </div>
            
              {/* POINTS SECTION */}
              {user && settings.marketing_allowCheckoutDiscount && maxPointsAvailable > 0 && pointsValue > 0 && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (e.target.checked) setPointsToUse(maxPointsToUse);
                      }}
                      className="mt-1 w-5 h-5 accent-[var(--primary)] cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" /> Usar mis puntos
                      </div>
                      <div className="text-sm text-gray-500">Tenés {maxPointsAvailable} pts (Equivalen a ${maxPointsAvailable * pointsValue})</div>
                    </div>
                  </label>

                  {usePoints && (
                    <div className="pl-8 flex items-center gap-2">
                      <input 
                        type="number"
                        min={1}
                        max={maxPointsToUse}
                        value={pointsToUse || ''}
                        onChange={(e) => {
                          const val = Math.min(maxPointsToUse, Math.max(0, parseInt(e.target.value) || 0));
                          setPointsToUse(val);
                        }}
                        className="w-24 p-2 border border-gray-300 rounded-lg text-center font-bold focus:border-[var(--primary)] outline-none"
                      />
                      <span className="text-sm font-bold text-green-600">
                        - ${pointsDiscount} de descuento
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* PRIZE SECTION (Bought with points) */}
              {user && user.coupons && user.coupons.filter(c => !c.isUsed).length > 0 && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    <Ticket size={16} className="text-blue-600" /> Aplicar Premio (Por Puntos)
                  </div>
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl font-bold focus:border-[var(--primary)] outline-none text-gray-900 bg-white"
                  >
                    <option value="">No usar premio</option>
                    {user.coupons.filter(c => !c.isUsed).map(c => (
                      <option key={c.id} value={c.id}>{c.couponName}</option>
                    ))}
                  </select>

                  {selectedCouponId && prizeError && (
                    <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg">
                      {prizeError}
                    </div>
                  )}

                  {selectedCouponId && !prizeError && prizeDiscount > 0 && (
                    <div className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                      - ${prizeDiscount} de descuento (Premio)
                    </div>
                  )}
                </div>
              )}

              {/* PROMO COUPONS SECTION */}
              {promoCoupons.length > 0 && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    <Tag size={16} className="text-purple-600" /> Aplicar Cupón Promocional
                  </div>
                  <select
                    value={selectedPromoCode}
                    onChange={(e) => setSelectedPromoCode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl font-bold focus:border-purple-500 outline-none text-gray-900 bg-white"
                  >
                    <option value="">No usar cupón promocional</option>
                    {promoCoupons.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.code}>{c.code} - {c.description}</option>
                    ))}
                  </select>

                  {selectedPromoCode && promoError && (
                    <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg">
                      {promoError}
                    </div>
                  )}

                  {selectedPromoCode && !promoError && promoDiscount > 0 && (
                    <div className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                      - ${promoDiscount} de descuento (Cupón)
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-archivo text-lg text-gray-900 uppercase">Total a Pagar</span>
                <span className="font-archivo text-2xl text-[var(--primary)]">${finalTotal.toLocaleString("es-AR")}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="font-archivo w-full mt-4 bg-[#FFC71F] text-[#0f2540] py-4 rounded-xl text-lg hover:bg-[#ffcf3d] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Procesando..." : <><CreditCard size={20} /> CONFIRMAR PEDIDO</>}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
