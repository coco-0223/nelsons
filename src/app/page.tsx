"use client";

import { useState, useEffect, useRef } from "react";
import { Product, Settings, CartItem } from "@/types";
import { ShoppingBag, Star, Clock, CalendarDays, User, Gift, X, RotateCcw, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CouponCatalog } from "@/components/CouponCatalog";
import { CustomerWallet } from "@/components/CustomerWallet";
import { DailyRewardAnimation } from "@/components/DailyRewardAnimation";
import { ReferralDashboard } from "@/components/ReferralDashboard";
import { PublicCouponsSection } from "@/components/PublicCouponsSection";
import { NelsonsSplitMenu } from "@/components/NelsonsSplitMenu";

// Exclusivamente colores oficiales de la marca NELSON'S para los recuadros de productos inferiores
const BRAND_PRODUCT_CARD_STYLES = [
  { bg: "#FFC71F", text: "#0f2540", priceColor: "#24598d", border: "#FFC71F" }, // Amarillo Nelson's
  { bg: "#0f2540", text: "#FFFFFF", priceColor: "#FFC71F", border: "#FFC71F" }, // Azul Marino Profundo Nelson's con borde Amarillo
];

// Catálogo inicial de Nelson's: Pizzas y Focaccias Gourmet con múltiples imágenes para el carrusel
export const INITIAL_NELSONS_PRODUCTS: Product[] = [
  {
    id: "nelson-pizza-1",
    name: "Margarita",
    description: "Salsa de tomates italianos San Marzano, abundante mozzarella fior di latte, hojas de albahaca fresca recién cortada y aceite de oliva virgen extra.",
    priceToday: 11500,
    priceScheduled: 10200,
    stock: 20,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-pizza-2",
    name: "Fugazzeta Rellena",
    description: "Doble masa gourmet rellena con mucha mozzarella y queso cuartirot, cubierta con cebollas dulces caramelizadas, orégano y olivas negras.",
    priceToday: 13800,
    priceScheduled: 12400,
    stock: 15,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-pizza-3",
    name: "Napolitana con Ajo",
    description: "Base de mozzarella gratinada, rodajas de tomate fresco seleccionado, provenzal casero con ajo confitado en oliva y aceitunas verdes.",
    priceToday: 12200,
    priceScheduled: 10900,
    stock: 18,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-pizza-4",
    name: "Pepperoni & Miel",
    description: "Salsa de tomate, mozzarella fundida, doble capa de pepperoni crujiente y un toque final de miel infusionada con peperoncino.",
    priceToday: 13500,
    priceScheduled: 12000,
    priceOffer: 11900,
    stock: 12,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-pizza-5",
    name: "Cuatro Quesos",
    description: "Combinación cremosa de mozzarella, gorgonzola suave, provolone estacionado y parmesano reggiano gratinado.",
    priceToday: 13200,
    priceScheduled: 11800,
    stock: 10,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-pizza-6",
    name: "Rúcula & Crudo",
    description: "Mozzarella fior di latte, jamón crudo serrano en fetas finas, colchón de rúcula selvática fresca, escamas de parmesano y reducción de aceto.",
    priceToday: 14500,
    priceScheduled: 13000,
    stock: 0,
    category: "pizza",
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
    isAvailable: false,
    createdAt: Date.now()
  },
  {
    id: "nelson-focaccia-1",
    name: "Romero & Olivas",
    description: "Focaccia gourmet aireada y dorada con aceite de oliva extra virgen, romero fresco, aceitunas negras y escamas de sal marina.",
    priceToday: 8900,
    priceScheduled: 7900,
    stock: 16,
    category: "focaccia",
    images: [
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-focaccia-2",
    name: "Cherrys & Albahaca",
    description: "Focaccia esponjosa con tomates cherry dulces confitados al ajo, hojas de albahaca fresca y lluvia de oliva.",
    priceToday: 9600,
    priceScheduled: 8600,
    stock: 14,
    category: "focaccia",
    images: [
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-focaccia-3",
    name: "Mortadela & Stracciatella",
    description: "Focaccia tibia rellena con mortadela con pistachos, corazón cremoso de burrata/stracciatella y pesto artesanal de albahaca.",
    priceToday: 12500,
    priceScheduled: 11200,
    priceOffer: 10900,
    stock: 10,
    category: "focaccia",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  },
  {
    id: "nelson-focaccia-4",
    name: "Cebolla & Parmesano",
    description: "Focaccia dorada con plumas de cebolla morada caramelizada, tomillo fresco y costra crujiente de queso parmesano estacionado.",
    priceToday: 9500,
    priceScheduled: 8500,
    stock: 12,
    category: "focaccia",
    images: [
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=1000&q=80"
    ],
    imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80",
    isAvailable: true,
    createdAt: Date.now()
  }
];

// Silueta exacta de la Patita Roja adjunta por el usuario para integrarse limpia sobre el azul de Nelson's
function NelsonsRedPaw({ className = "w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block select-none shrink-0 drop-shadow-md`}
      aria-label="Patita Nelson's"
    >
      {/* Dedo izquierdo exterior */}
      <ellipse cx="22" cy="54" rx="13" ry="17" transform="rotate(-22 22 54)" fill="#E4312C" />
      {/* Dedo central izquierdo */}
      <ellipse cx="44" cy="28" rx="13.5" ry="19" transform="rotate(-8 44 28)" fill="#E4312C" />
      {/* Dedo central derecho */}
      <ellipse cx="75" cy="28" rx="13.5" ry="19" transform="rotate(10 75 28)" fill="#E4312C" />
      {/* Dedo derecho exterior */}
      <ellipse cx="98" cy="54" rx="13" ry="17" transform="rotate(24 98 54)" fill="#E4312C" />
      {/* Almohadilla central acorazonada invertida (igual a la imagen adjunta) */}
      <path
        d="M60 49C45 49 38 61 30 72C23 81 25 96 38 98C47 99.5 53 94 60 94C67 94 73 99.5 82 98C95 96 97 81 90 72C82 61 75 49 60 49Z"
        fill="#E4312C"
      />
    </svg>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronized category & selected product across both Menu sections (Hoy & Programados)
  const [activeCategory, setActiveCategory] = useState<"pizza" | "focaccia">("pizza");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Marketing & Settings
  const [settings, setSettings] = useState<Partial<Settings>>({});
  
  // Out of stock interaction state
  const [outOfStockProduct, setOutOfStockProduct] = useState<Product | null>(null);

  // Popups for Scheduled Orders & Mixed Orders
  const [orderNoticePopup, setOrderNoticePopup] = useState<{
    type: "scheduled_only" | "mixed_order";
    message: string;
  } | null>(null);
  const [hasShownScheduledOnlyNotice, setHasShownScheduledOnlyNotice] = useState(false);
  const [hasShownMixedOrderNotice, setHasShownMixedOrderNotice] = useState(false);

  // Auth & Marketing Modals
  const { user, openAuth } = useAuth();
  const [showDailyPromo, setShowDailyPromo] = useState(false);
  const [showCheckoutIntercept, setShowCheckoutIntercept] = useState(false);

  // Cart & Animation
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [showCartWidget, setShowCartWidget] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [flyingItems, setFlyingItems] = useState<{id: string, icon: string, x: number, y: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, cp3x: number, cp3y: number}[]>([]);

  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
  };

  const resetCollapseTimer = () => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsCartExpanded(false);
    }, 4500);
  };

  const smoothScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Load Settings
    const storedSettings = localStorage.getItem("coquetas_settings");
    if (storedSettings) setSettings(JSON.parse(storedSettings));

    // Load Products and ensure Nelson's Pizzas & Focaccias exist
    const storedProducts = localStorage.getItem("coquetas_products");
    if (storedProducts) {
      const parsed = JSON.parse(storedProducts);
      const hasPizzasOrFocaccias = Array.isArray(parsed) && parsed.some((p: any) => p.category === "pizza" || p.category === "focaccia");
      if (!hasPizzasOrFocaccias) {
        setProducts(INITIAL_NELSONS_PRODUCTS);
        localStorage.setItem("coquetas_products", JSON.stringify(INITIAL_NELSONS_PRODUCTS));
      } else {
        const migrated = parsed.map((p: any) => {
          const base = 'price' in p ? { ...p, priceToday: p.price, priceScheduled: p.price } : p;
          const imgs = Array.isArray(base.images) && base.images.length > 0
            ? base.images
            : base.imageUrl ? [base.imageUrl] : [];
          return {
            ...base,
            category: base.category === "focaccia" ? "focaccia" : "pizza",
            images: imgs,
            imageUrl: imgs[0] || base.imageUrl
          };
        });
        setProducts(migrated);
      }
    } else {
      setProducts(INITIAL_NELSONS_PRODUCTS);
      localStorage.setItem("coquetas_products", JSON.stringify(INITIAL_NELSONS_PRODUCTS));
    }
    
    setIsLoaded(true);

    // Marketing Daily Promo Check
    const checkDailyPromo = () => {
      if (!localStorage.getItem("coquetas_uid")) {
        const lastSeen = localStorage.getItem("coquetas_last_promo_seen");
        const now = Date.now();
        if (!lastSeen || now - parseInt(lastSeen) > 24 * 60 * 60 * 1000) {
          setTimeout(() => setShowDailyPromo(true), 2500);
        }
      }
    };
    checkDailyPromo();
  }, []);

  useEffect(() => {
    if (user && showDailyPromo) {
      setShowDailyPromo(false);
    }
  }, [user, showDailyPromo]);

  const handleCloseDailyPromo = () => {
    localStorage.setItem("coquetas_last_promo_seen", Date.now().toString());
    setShowDailyPromo(false);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowCheckoutIntercept(true);
    } else {
      setShowCheckoutModal(true);
    }
  };

  const getProductDisplayInfo = (product: Product, variant: "today" | "scheduled") => {
    if (variant === 'scheduled') {
      return {
        price: product.priceOffer || product.priceScheduled,
        originalPrice: (product.priceOffer || product.priceScheduled) < product.priceToday ? product.priceToday : null,
        isAvailable: true,
        statusText: "Stock Ilimitado",
      };
    } else {
      const available = product.stock > 0;
      return {
        price: product.priceOffer || product.priceToday,
        originalPrice: product.priceOffer ? product.priceToday : null,
        isAvailable: available,
        statusText: available ? `Quedan ${product.stock}` : "Sin Stock para hoy",
      };
    }
  };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.isForFutureDate 
      ? (item.product.priceOffer || item.product.priceScheduled) 
      : (item.product.priceOffer || item.product.priceToday);
    return acc + price * item.quantity;
  }, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const todayCartItems = cart.filter((item) => !item.isForFutureDate);
  const futureCartItems = cart.filter((item) => item.isForFutureDate);

  const addToCart = (product: Product, event: React.MouseEvent, isForFutureDate: boolean) => {
    const hadTodayItems = cart.some((item) => !item.isForFutureDate);
    const hadFutureItems = cart.some((item) => item.isForFutureDate);

    const willHaveTodayItems = hadTodayItems || !isForFutureDate;
    const willHaveFutureItems = hadFutureItems || isForFutureDate;

    // Popup Rules:
    if (willHaveTodayItems && willHaveFutureItems && !hasShownMixedOrderNotice) {
      setOrderNoticePopup({
        type: "mixed_order",
        message:
          "⚠️ ATENCIÓN: Estás haciendo un pedido para hoy y también para otro día. Una vez termines de cargar tu pedido, te vamos a preguntar para qué fecha querés los productos programados.",
      });
      setHasShownMixedOrderNotice(true);
    } else if (isForFutureDate && !willHaveTodayItems && !hadFutureItems && !hasShownScheduledOnlyNotice) {
      setOrderNoticePopup({
        type: "scheduled_only",
        message:
          "Estás por encargar para otro día. Una vez termines de cargar tu pedido, te vamos a preguntar para qué fecha lo querés.",
      });
      setHasShownScheduledOnlyNotice(true);
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.isForFutureDate === isForFutureDate);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, isForFutureDate }];
    });

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    const endX = window.innerWidth - 120 - rect.left;
    const endY = window.innerHeight - 120 - rect.top;
    
    const cp1x = endX * 0.2 + (Math.random() * 200 - 100);
    const cp1y = endY * 0.1 - (Math.random() * 200 + 100);

    const cp2x = endX * 0.5 + (Math.random() * 300 - 150);
    const cp2y = endY * 0.4 + (Math.random() * 200 - 100);
    
    const cp3x = endX * 0.8 + (Math.random() * 200 - 100);
    const cp3y = endY * 0.7 - (Math.random() * 150 + 50);

    const newFlying = { 
      id: Math.random().toString(), 
      icon: product.category === "focaccia" ? "🫓" : "🍕",
      x: rect.left, 
      y: rect.top,
      cp1x, cp1y, cp2x, cp2y, cp3x, cp3y
    };
    setFlyingItems(prev => [...prev, newFlying]);
    
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(f => f.id !== newFlying.id));
    }, 2500);

    setShowCartWidget(true);
    setIsCartExpanded(true);
    resetCollapseTimer();
  };

  const updateCartQuantity = (product: Product, isForFuture: boolean, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === product.id && item.isForFutureDate === isForFuture) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleCategoryBoxClick = (category: "pizza" | "focaccia") => {
    setActiveCategory(category);
    const firstMatch = products.find((p) =>
      category === "focaccia" ? p.category === "focaccia" : p.category !== "focaccia"
    );
    if (firstMatch?.id) {
      setSelectedProductId(firstMatch.id);
    }
    smoothScrollToSection("menu");
  };

  const handleProductRectangleClick = (product: Product) => {
    const cat = product.category === "focaccia" ? "focaccia" : "pizza";
    setActiveCategory(cat);
    if (product.id) {
      setSelectedProductId(product.id);
    }
    smoothScrollToSection("menu");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-20">
      
      {/* POPUP: SCHEDULED OR MIXED ORDER NOTICE */}
      {orderNoticePopup && (
        <div className="fixed inset-0 z-[210] bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-8 text-center border-4 animate-in zoom-in duration-200 ${
              orderNoticePopup.type === "mixed_order"
                ? "bg-[#FFC71F] text-[#0f2540] border-[#0f2540]"
                : "bg-white text-[#0f2540] border-[#FFC71F]"
            }`}
          >
            <div className="w-16 h-16 bg-[#0f2540] text-[#FFC71F] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              {orderNoticePopup.type === "mixed_order" ? (
                <AlertTriangle size={34} />
              ) : (
                <CalendarDays size={32} />
              )}
            </div>
            <p className="font-archivo text-lg sm:text-xl leading-relaxed mb-7">
              {orderNoticePopup.message}
            </p>
            <button
              type="button"
              onClick={() => setOrderNoticePopup(null)}
              className="font-archivo w-full py-4 rounded-2xl bg-[#0f2540] text-[#FFC71F] hover:bg-[#24598d] hover:text-white text-lg transition-colors shadow-xl cursor-pointer uppercase"
            >
              Entendido, continuar con mi pedido
            </button>
          </div>
        </div>
      )}

      {/* OUT OF STOCK MODAL */}
      {outOfStockProduct && (
        <div className="fixed inset-0 z-[190] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍕</span>
            </div>
            <h3 className="font-archivo text-2xl text-gray-900 mb-2">¡Sin stock para hoy!</h3>
            <p className="text-gray-600 mb-8">
              En este momento se agotaron las unidades de <strong>{outOfStockProduct.name}</strong> para entrega inmediata hoy, pero podés encargarlo en la sección de pedidos programados.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const prod = outOfStockProduct;
                  setOutOfStockProduct(null);
                  if (prod.id) setSelectedProductId(prod.id);
                  smoothScrollToSection("menu-programado");
                }}
                className="font-archivo w-full bg-[#FFC71F] text-[#0f2540] py-4 rounded-xl hover:bg-[#ffcf3d] transition-colors shadow-lg cursor-pointer uppercase"
              >
                Ir a Comprar Otro Día
              </button>
              <button 
                onClick={() => setOutOfStockProduct(null)}
                className="font-archivo w-full bg-gray-100 text-gray-600 py-4 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer uppercase text-sm"
              >
                Seguir viendo el Menú de Hoy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SMOOTH-SCROLL SWITCHER WIDGET (Hoy vs Otra Fecha) */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#0f2540] shadow-2xl rounded-full p-1.5 border-2 border-[#FFC71F]">
        <div className="flex gap-1 relative">
          <button 
            type="button"
            onClick={() => smoothScrollToSection("menu")}
            className="font-archivo relative z-10 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm text-white hover:bg-[#24598d] transition-all cursor-pointer uppercase"
          >
            <Clock size={15} className="text-emerald-400" />
            <span>🟢 Comprar Hoy</span>
          </button>
          
          <button 
            type="button"
            onClick={() => smoothScrollToSection("menu-programado")}
            className="font-archivo relative z-10 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm bg-[#FFC71F] text-[#0f2540] hover:bg-[#ffcf3d] transition-all cursor-pointer uppercase shadow"
          >
            <CalendarDays size={15} />
            <span>🟡 Comprar Otro Día</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          HERO & TOP NAVIGATION (Diseño MUY PARECIDO a las imágenes adjuntas)
         ===================================================================== */}
      <div className="bg-[#24598d] text-white relative overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-40 bg-[#24598d]/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
            {/* Left Links */}
            <div className="flex items-center gap-4 sm:gap-7">
              <button
                type="button"
                onClick={() => smoothScrollToSection("menu")}
                className="font-archivo text-xs sm:text-sm tracking-wider uppercase text-white hover:text-[#FFC71F] transition-colors cursor-pointer"
              >
                MENÚ
              </button>
              <button
                type="button"
                onClick={() => smoothScrollToSection("menu-programado")}
                className="font-archivo text-xs sm:text-sm tracking-wider uppercase text-white hover:text-[#FFC71F] transition-colors cursor-pointer hidden sm:inline-block"
              >
                OTRO DÍA
              </button>
              <button
                type="button"
                onClick={() => smoothScrollToSection("club")}
                className="font-archivo text-xs sm:text-sm tracking-wider uppercase text-white hover:text-[#FFC71F] transition-colors cursor-pointer hidden md:inline-block"
              >
                NOSOTROS
              </button>
              <a
                href="/admin/products"
                className="font-archivo text-xs sm:text-sm tracking-wider uppercase text-white/85 hover:text-[#FFC71F] transition-colors"
              >
                ADMIN
              </a>
            </div>

            {/* Center: Official NELSON'S Logo (Flat straight cut) */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer focus:outline-none shrink-0"
              aria-label="NELSON'S"
            >
              <img
                src="/nelsons-logo.png"
                alt="NELSON'S"
                className="h-12 sm:h-16 w-auto object-contain rounded-none border-0 shadow-none block"
              />
            </button>

            {/* Right: PEDIR AHORA pill + User/Cart icon with yellow badge */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => smoothScrollToSection("menu")}
                className="font-archivo bg-[#FFC71F] text-[#0f2540] hover:bg-[#ffd54f] px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,199,31,0.45)] transition-all hover:scale-105 cursor-pointer"
              >
                PEDIR AHORA
              </button>

              <button
                type="button"
                onClick={() => (user ? handleProceedToCheckout() : openAuth("login"))}
                className="relative p-2 text-white hover:text-[#FFC71F] transition-colors cursor-pointer"
                title={user ? `Hola, ${user.displayName || "Cliente"}` : "Iniciar sesión"}
              >
                <User size={24} className="fill-current" />
                <span className="font-archivo absolute -top-0.5 -right-0.5 bg-[#FFC71F] text-[#0f2540] text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount > 0 ? cartCount : "!"}
                </span>
              </button>

              {cartCount > 0 && (
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="relative p-2 bg-white/10 hover:bg-white/20 rounded-full text-[#FFC71F] transition-colors cursor-pointer"
                  aria-label="Ver pedido"
                >
                  <ShoppingBag size={20} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* HERO CONTENT */}
        <section className="pt-8 sm:pt-12 pb-14 flex flex-col items-center text-center relative z-10">
          {/* MAIN HEADLINE:
              Reemplazar MASA MADRE por: Horneado Casero
              Reemplazar Horno por: Amor
              Reemplazar Pasión por una Patita (imagen adjunta) */}
          <div className="max-w-5xl mx-auto px-4 mb-8">
            <h1 className="font-archivo text-white uppercase tracking-tight leading-[0.98] drop-shadow-sm">
              <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-[82px]">
                HORNEADO CASERO.
              </span>
              <span className="mt-1 sm:mt-2 inline-flex items-center justify-center gap-3 sm:gap-5 text-4xl sm:text-6xl md:text-7xl lg:text-[82px]">
                <span>AMOR.</span>
                <NelsonsRedPaw className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 -mt-1" />
              </span>
            </h1>
          </div>

          {/* 2 ACTION BUTTONS:
              Reemplazar Ver Menú por: COMPRAR HOY
              Reemplazar Nuestra Historia por: COMPRAR OTRO DÍA */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 px-4 mb-7">
            <button
              type="button"
              onClick={() => smoothScrollToSection("menu")}
              className="font-archivo bg-[#FFC71F] text-[#0f2540] hover:bg-[#ffd646] px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base uppercase tracking-wider shadow-[0_0_28px_rgba(255,199,31,0.55)] hover:scale-105 transition-all cursor-pointer"
            >
              COMPRAR HOY
            </button>

            <button
              type="button"
              onClick={() => smoothScrollToSection("menu-programado")}
              className="font-archivo bg-[#0f2540]/40 hover:bg-white/15 text-white border-2 border-white/85 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base uppercase tracking-wider hover:scale-105 transition-all cursor-pointer"
            >
              COMPRAR OTRO DÍA
            </button>
          </div>

          {/* 2 SUBTLE INFO PILLS (Like Reference Image 1) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/5 text-white/90 text-xs sm:text-sm font-medium">
              <Clock size={14} className="text-[#FFC71F]" />
              <span>Entregas en el día o programadas</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/5 text-white/90 text-xs sm:text-sm font-medium">
              <Sparkles size={14} className="text-[#FFC71F]" />
              <span>Fresco, casero y natural</span>
            </div>
          </div>

          {/* 2 LARGE RECTANGULAR CATEGORY BOXES: PIZZAS & FOCACCIAS (Like Reference Image 3) */}
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 mb-12">
            {/* Recuadro 1: PIZZAS */}
            <button
              type="button"
              onClick={() => handleCategoryBoxClick("pizza")}
              className={`group relative h-52 sm:h-64 md:h-72 rounded-[26px] overflow-hidden p-1.5 transition-all duration-300 shadow-2xl cursor-pointer ${
                activeCategory === "pizza"
                  ? "bg-[#FFC71F] scale-[1.01] ring-4 ring-[#FFC71F]/40"
                  : "bg-[#FFC71F]/80 hover:bg-[#FFC71F] hover:scale-[1.01]"
              }`}
            >
              <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80"
                  alt="PIZZAS"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <span className="font-archivo text-white text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                    PIZZAS
                  </span>
                </div>
              </div>
            </button>

            {/* Recuadro 2: FOCACCIAS */}
            <button
              type="button"
              onClick={() => handleCategoryBoxClick("focaccia")}
              className={`group relative h-52 sm:h-64 md:h-72 rounded-[26px] overflow-hidden p-1.5 transition-all duration-300 shadow-2xl cursor-pointer ${
                activeCategory === "focaccia"
                  ? "bg-[#FFC71F] scale-[1.01] ring-4 ring-[#FFC71F]/40"
                  : "bg-[#FFC71F]/80 hover:bg-[#FFC71F] hover:scale-[1.01]"
              }`}
            >
              <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=80"
                  alt="FOCACCIAS"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <span className="font-archivo text-white text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                    FOCACCIAS
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* BELOW CATEGORY BOXES: FULL-WIDTH PRODUCT CARDS ROW, NO SCROLLBAR VISIBLE, ONLY BRAND COLORS */}
          {products.length > 0 && (
            <div className="w-full">
              <div className="w-full flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-2 snap-x snap-mandatory">
                {products.map((product, idx) => {
                  const brandStyle = BRAND_PRODUCT_CARD_STYLES[idx % BRAND_PRODUCT_CARD_STYLES.length];
                  const photo =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : product.imageUrl;
                  const displayPrice = product.priceOffer || product.priceToday;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductRectangleClick(product)}
                      style={{
                        backgroundColor: brandStyle.bg,
                        color: brandStyle.text,
                        borderColor: brandStyle.border,
                      }}
                      className="snap-start shrink-0 flex-1 min-w-[200px] sm:min-w-[230px] rounded-[24px] p-2.5 border-2 flex flex-col justify-between shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group text-center"
                    >
                      <div className="w-full h-44 sm:h-48 rounded-[18px] overflow-hidden bg-[#0a192c] relative">
                        {photo ? (
                          <img
                            src={photo}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {product.category === "focaccia" ? "🫓" : "🍕"}
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-[#24598d]/90 text-[#FFC71F] border border-[#FFC71F]/50 text-[10px] font-archivo uppercase px-2.5 py-0.5 rounded-full">
                          {product.category === "focaccia" ? "Focaccia" : "Pizza"}
                        </span>
                      </div>

                      <div className="pt-3 pb-1.5 px-2 flex flex-col items-center justify-center">
                        <span className="font-archivo text-sm sm:text-base uppercase leading-tight line-clamp-1">
                          {product.name}
                        </span>
                        <span
                          style={{ color: brandStyle.priceColor }}
                          className="font-archivo text-lg sm:text-xl mt-0.5"
                        >
                          ${displayPrice.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Customer Wallet & Loyalty Section */}
      {user && (
        <section className="px-4 mt-8 relative z-10 max-w-5xl mx-auto mb-12 space-y-6">
          <CustomerWallet />
          <PublicCouponsSection />
          <ReferralDashboard settings={settings} />
          {settings.marketing_allowCouponRedemption && (
            <CouponCatalog />
          )}
        </section>
      )}

      {/* =====================================================================
          PARTE 1: PEDIDOS PARA HOY (INMEDIATOS) — Título únicamente "MENÚ"
         ===================================================================== */}
      <section id="menu" className="py-14 sm:py-20 px-4 bg-[#0f2540] text-white scroll-mt-16 border-t-4 border-[#FFC71F]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left max-w-6xl mx-auto">
            <div>
              <h2 className="font-archivo text-4xl sm:text-6xl text-[#FFC71F] tracking-tight uppercase">
                MENÚ
              </h2>
            </div>
            
            <button
              onClick={() => {
                if (confirm("¿Querés restaurar el catálogo demostrativo original de Pizzas y Focaccias Gourmet de Nelson's?")) {
                  setProducts(INITIAL_NELSONS_PRODUCTS);
                  localStorage.setItem("coquetas_products", JSON.stringify(INITIAL_NELSONS_PRODUCTS));
                }
              }}
              className="text-xs font-bold text-white/70 hover:text-[#FFC71F] flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/20 bg-white/5 cursor-pointer"
              title="Restaurar menú inicial de Nelson's"
            >
              <RotateCcw size={13} />
              Restaurar catálogo demo
            </button>
          </div>

          {!isLoaded ? (
            <div className="text-center py-12 font-archivo text-white/70">Cargando MENÚ...</div>
          ) : (
            <div className="space-y-12">
              {/* Menú 1 para Hoy (Color Azul) */}
              <NelsonsSplitMenu
                products={products}
                variant="today"
                colorTheme="blue"
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                selectedProductId={selectedProductId}
                onSelectProductId={setSelectedProductId}
                getProductDisplayInfo={getProductDisplayInfo}
                onAddToCart={addToCart}
                onOutOfStockClick={(prod) => setOutOfStockProduct(prod)}
                onScrollToOtherSection={() => smoothScrollToSection("menu-programado")}
              />

              {/* Menú 2 para Hoy (Categoría Inversa, Color Complementario) */}
              <NelsonsSplitMenu
                products={products}
                variant="today"
                colorTheme="complementary"
                activeCategory={activeCategory === "pizza" ? "focaccia" : "pizza"}
                onCategoryChange={(cat) => setActiveCategory(cat === "pizza" ? "focaccia" : "pizza")}
                selectedProductId={selectedProductId}
                onSelectProductId={setSelectedProductId}
                getProductDisplayInfo={getProductDisplayInfo}
                onAddToCart={addToCart}
                onOutOfStockClick={(prod) => setOutOfStockProduct(prod)}
                onScrollToOtherSection={() => smoothScrollToSection("menu-programado")}
              />
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          PARTE 2: PEDIDOS PROGRAMADOS (PARA OTRO DÍA) — Bloque Amarillo Vibrante / Menús Duplicados
         ===================================================================== */}
      <section
        id="menu-programado"
        className="py-16 sm:py-24 px-4 bg-[#FFC71F] text-[#0f2540] border-t-8 border-[#0f2540] scroll-mt-16"
      >
        <div className="container mx-auto max-w-6xl">
          {/* Mandatory Prominent Warning Banner */}
          <div className="bg-[#0f2540] text-[#FFC71F] p-5 sm:p-6 rounded-3xl shadow-2xl border-4 border-white mb-10 text-center">
            <p className="font-archivo text-lg sm:text-2xl md:text-3xl uppercase tracking-wide">
              ⚠️ SECCIÓN EXCLUSIVA: PEDIDOS PARA OTRA FECHA / PROGRAMADOS.
            </p>
            <p className="text-white/90 text-xs sm:text-sm font-bold mt-1">
              Encargá con anticipación sin límites de stock y con precios diferenciales para la fecha que elijas al finalizar tu compra.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left">
            <div>
              <h2 className="font-archivo text-3xl sm:text-5xl text-[#0f2540] tracking-tight uppercase">
                MENÚ PROGRAMADO (OTRO DÍA)
              </h2>
            </div>
          </div>

          {!isLoaded ? (
            <div className="text-center py-12 font-archivo text-[#0f2540]">Cargando Menú Programado...</div>
          ) : (
            <div className="space-y-12">
              {/* Menú 1 Programado (Color Azul) */}
              <NelsonsSplitMenu
                products={products}
                variant="scheduled"
                colorTheme="blue"
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                selectedProductId={selectedProductId}
                onSelectProductId={setSelectedProductId}
                getProductDisplayInfo={getProductDisplayInfo}
                onAddToCart={addToCart}
                onOutOfStockClick={(prod) => setOutOfStockProduct(prod)}
                onScrollToOtherSection={() => smoothScrollToSection("menu")}
              />

              {/* Menú 2 Programado (Categoría Inversa, Color Complementario) */}
              <NelsonsSplitMenu
                products={products}
                variant="scheduled"
                colorTheme="complementary"
                activeCategory={activeCategory === "pizza" ? "focaccia" : "pizza"}
                onCategoryChange={(cat) => setActiveCategory(cat === "pizza" ? "focaccia" : "pizza")}
                selectedProductId={selectedProductId}
                onSelectProductId={setSelectedProductId}
                getProductDisplayInfo={getProductDisplayInfo}
                onAddToCart={addToCart}
                onOutOfStockClick={(prod) => setOutOfStockProduct(prod)}
                onScrollToOtherSection={() => smoothScrollToSection("menu")}
              />
            </div>
          )}
        </div>
      </section>

      {/* Club Nelson's Section */}
      <section id="club" className="py-20 px-4 bg-[#24598d] text-white border-t-4 border-[#FFC71F]">
        <div className="container mx-auto max-w-5xl text-center">
          <Star className="w-16 h-16 mx-auto mb-6 text-[#FFC71F]" fill="currentColor" />
          <h2 className="font-archivo text-4xl md:text-5xl mb-6 uppercase">Club NELSON&apos;S</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
            Sumá puntos con cada Pizza o Focaccia, abrí tu cofre diario y canjeá recompensas exclusivas.
          </p>
          <button
            onClick={() => !user && openAuth('register')}
            className="font-archivo bg-[#FFC71F] text-[#0f2540] px-8 py-4 rounded-full text-lg hover:bg-[#ffcf3d] transition-colors shadow-xl cursor-pointer uppercase"
          >
            {user ? "¡Ya sos parte del Club!" : "Crear mi Cuenta Gratis"}
          </button>
        </div>
      </section>

      {/* FLYING PIZZAS / FOCACCIAS ANIMATION */}
      {flyingItems.map(flying => (
        <div 
          key={flying.id}
          className="fixed z-[200] text-4xl animate-fly-to-cart pointer-events-none"
          style={{ 
            left: flying.x, 
            top: flying.y,
            '--start-x': `${flying.x}px`,
            '--start-y': `${flying.y}px`,
            '--cp1-x': `${flying.cp1x}px`,
            '--cp1-y': `${flying.cp1y}px`,
            '--cp2-x': `${flying.cp2x}px`,
            '--cp2-y': `${flying.cp2y}px`,
            '--cp3-x': `${flying.cp3x}px`,
            '--cp3-y': `${flying.cp3y}px`
          } as React.CSSProperties}
        >
          {flying.icon}
        </div>
      ))}

      {/* 4. LARGE FLOATING CART WIDGET DIVIDED INTO 2 CONTRASTED BLOCKS */}
      {showCartWidget && cartCount > 0 && (
        <div 
          className={`fixed bottom-20 right-4 sm:right-6 z-[120] transition-all duration-300 ease-in-out ${
            isCartExpanded ? 'w-[94vw] sm:w-[440px] md:w-[480px]' : 'w-60'
          } bg-white rounded-3xl shadow-2xl border-4 border-[#0f2540] overflow-hidden flex flex-col`}
          onMouseEnter={() => {
            setIsCartExpanded(true);
            clearCollapseTimer();
          }}
          onMouseLeave={resetCollapseTimer}
        >
          {isCartExpanded ? (
            <>
              <div className="bg-[#0f2540] text-white p-4 sm:p-5 flex justify-between items-center border-b-2 border-[#FFC71F]">
                <h3 className="font-archivo text-lg sm:text-xl flex items-center gap-2 text-[#FFC71F] uppercase">
                  <ShoppingBag size={22} /> Tu Pedido ({cartCount})
                </h3>
                <button
                  onClick={() => setIsCartExpanded(false)}
                  className="text-white/80 hover:text-white cursor-pointer p-1"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex-1 max-h-[60vh] overflow-y-auto space-y-4 bg-gray-50">
                {/* BLOQUE 1: 🟢 ENTREGA HOY */}
                {todayCartItems.length > 0 && (
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-500 p-3.5 space-y-2.5 shadow-sm">
                    <div className="font-archivo text-xs sm:text-sm uppercase text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span>🟢 Entrega Hoy</span>
                      <span className="text-xs font-bold text-emerald-700">Inmediato</span>
                    </div>
                    {todayCartItems.map((item, idx) => {
                      const price = item.product.priceOffer || item.product.priceToday;
                      return (
                        <div
                          key={`today-${idx}`}
                          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-xs border border-emerald-100"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-archivo text-sm text-gray-900 truncate uppercase">
                              {item.product.name}
                            </div>
                            <div className="text-xs font-bold text-emerald-700">
                              ${price.toLocaleString("es-AR")} c/u
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                            <button
                              onClick={() => updateCartQuantity(item.product, false, -1)}
                              className="font-archivo text-gray-700 px-1 hover:text-red-600 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-archivo text-sm text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product, false, 1)}
                              className="font-archivo text-gray-700 px-1 hover:text-emerald-700 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* BLOQUE 2: 🟡 ENTREGA FUTURA (OTRO DÍA) */}
                {futureCartItems.length > 0 && (
                  <div className="rounded-2xl bg-[#FFC71F]/30 border-2 border-[#0f2540] p-3.5 space-y-2.5 shadow-sm">
                    <div className="font-archivo text-xs sm:text-sm uppercase text-[#0f2540] flex items-center justify-between border-b border-[#0f2540]/20 pb-2">
                      <span>🟡 Entrega Futura (Otro Día)</span>
                      <span className="text-[11px] font-bold bg-[#0f2540] text-[#FFC71F] px-2 py-0.5 rounded-full">
                        Programado
                      </span>
                    </div>
                    {futureCartItems.map((item, idx) => {
                      const price = item.product.priceOffer || item.product.priceScheduled;
                      return (
                        <div
                          key={`future-${idx}`}
                          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-xs border border-[#0f2540]/15"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-archivo text-sm text-gray-900 truncate uppercase">
                              {item.product.name}
                            </div>
                            <div className="text-xs font-bold text-[#24598d]">
                              ${price.toLocaleString("es-AR")} c/u (Tarifa Programada)
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 bg-[#FFC71F]/30 rounded-full px-3 py-1 border border-[#0f2540]/20">
                            <button
                              onClick={() => updateCartQuantity(item.product, true, -1)}
                              className="font-archivo text-gray-800 px-1 hover:text-red-600 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-archivo text-sm text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product, true, 1)}
                              className="font-archivo text-gray-800 px-1 hover:text-[#24598d] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 border-t-2 border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-archivo text-gray-700 uppercase">Total del Pedido:</span>
                  <span className="font-archivo text-2xl text-[#24598d]">
                    ${cartTotal.toLocaleString("es-AR")}
                  </span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="font-archivo w-full bg-[#FFC71F] text-[#0f2540] py-3.5 rounded-2xl text-base sm:text-lg hover:bg-[#ffcf3d] transition-colors shadow-lg cursor-pointer uppercase"
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          ) : (
            <div 
              className="bg-[#0f2540] text-white p-4 flex items-center justify-between cursor-pointer group"
              onClick={() => setIsCartExpanded(true)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={24} className="text-[#FFC71F]" />
                  <span className="font-archivo absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                    {cartCount}
                  </span>
                </div>
                <span className="font-archivo text-sm sm:text-base text-[#FFC71F] group-hover:scale-105 transition-transform uppercase">
                  Ver Mi Pedido (${cartTotal.toLocaleString("es-AR")})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GLOBAL FOOTER BAR */}
      {isLoaded && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f2540] text-white p-2 text-center z-40 text-xs sm:text-sm flex items-center justify-center gap-2 border-t border-[#24598d]">
          <Star className="w-4 h-4 text-[#FFC71F]" fill="currentColor" />
          <span>
            <span className="font-archivo text-[#FFC71F]">NELSON&apos;S</span> • Horneado Casero & Amor
          </span>
          <Star className="w-4 h-4 text-[#FFC71F]" fill="currentColor" />
        </div>
      )}

      {/* DAILY PROMO POPUP */}
      {showDailyPromo && !user && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-center animate-in zoom-in duration-300">
            <button onClick={handleCloseDailyPromo} className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 transition-colors cursor-pointer">
              <X size={20} />
            </button>
            <div className="bg-[var(--primary)] text-white p-8 pb-10 rounded-b-[40px]">
              <Gift className="w-16 h-16 mx-auto mb-4 text-[#FFC71F] animate-bounce" />
              <h2 className="font-archivo text-2xl mb-2 uppercase">¡50 Puntos de Regalo! 🎁</h2>
            </div>
            <div className="p-8 pt-6">
              <p className="text-gray-600 mb-6 font-medium">
                Sumate al Club <strong>Nelson&apos;s</strong> ahora mismo y canjeá puntos por Pizzas y Focaccias.
              </p>
              <button 
                onClick={() => { handleCloseDailyPromo(); openAuth('register'); }}
                className="font-archivo w-full bg-[#FFC71F] text-[#0f2540] py-4 rounded-xl text-base hover:bg-[#ffcf3d] transition-colors shadow-lg cursor-pointer uppercase"
              >
                ¡Quiero registrarme!
              </button>
              <button 
                onClick={handleCloseDailyPromo}
                className="mt-4 text-sm text-gray-400 font-bold hover:text-gray-600 underline cursor-pointer"
              >
                Quizás en otro momento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT INTERCEPT */}
      {showCheckoutIntercept && !user && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 text-center border-b border-gray-100">
              <Star className="w-12 h-12 text-[#FFC71F] mx-auto mb-4" fill="currentColor" />
              <h2 className="font-archivo text-2xl text-gray-900 mb-2 uppercase">¡Estás a un paso de ganar premios!</h2>
              <p className="text-gray-600 font-medium">
                Si te registrás ahora en <strong>Nelson&apos;s</strong>, ¡esta compra ya suma puntos para Pizzas y Focaccias gratis!
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex flex-col gap-3">
              <button 
                onClick={() => { setShowCheckoutIntercept(false); openAuth('register'); }}
                className="font-archivo w-full bg-[var(--primary)] text-white py-4 rounded-xl text-base hover:bg-[var(--secondary)] transition-colors shadow-lg cursor-pointer uppercase"
              >
                Registrarme en 1 minuto
              </button>
              <button 
                onClick={() => { setShowCheckoutIntercept(false); setShowCheckoutModal(true); }}
                className="font-archivo w-full bg-white text-gray-700 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer uppercase text-sm"
              >
                Continuar como Invitado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <CheckoutModal 
          cart={cart}
          cartTotal={cartTotal}
          settings={settings}
          onClose={() => setShowCheckoutModal(false)}
          onCheckoutSuccess={() => {
            setCart([]);
            setShowCartWidget(false);
            setIsCartExpanded(false);
            setHasShownScheduledOnlyNotice(false);
            setHasShownMixedOrderNotice(false);
          }}
        />
      )}

      {/* GAMIFICATION */}
      <DailyRewardAnimation settings={settings} />
    </div>
  );
}
