"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ShoppingBag, Sparkles, Info, CalendarDays, Clock, Plus } from "lucide-react";

interface ProductDisplayInfo {
  price: number;
  originalPrice: number | null;
  isAvailable: boolean;
  statusText: string;
}

interface NelsonsSplitMenuProps {
  products: Product[];
  variant: "today" | "scheduled";
  activeCategory: "pizza" | "focaccia";
  onCategoryChange: (cat: "pizza" | "focaccia") => void;
  selectedProductId: string | null;
  onSelectProductId: (id: string) => void;
  getProductDisplayInfo: (product: Product, variant: "today" | "scheduled") => ProductDisplayInfo;
  onAddToCart: (product: Product, event: React.MouseEvent, isForFutureDate: boolean) => void;
  onOutOfStockClick: (product: Product) => void;
  onScrollToOtherSection?: () => void;
  colorTheme?: "blue" | "complementary";
}

export function NelsonsSplitMenu({
  products,
  variant,
  activeCategory,
  onCategoryChange,
  selectedProductId,
  onSelectProductId,
  getProductDisplayInfo,
  onAddToCart,
  onOutOfStockClick,
  onScrollToOtherSection,
  colorTheme,
}: NelsonsSplitMenuProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const isScheduled = variant === "scheduled";
  const isComplementary = colorTheme ? colorTheme === "complementary" : isScheduled;
  const pizzas = products.filter((p) => p.category !== "focaccia");
  const focaccias = products.filter((p) => p.category === "focaccia");

  const currentCategoryProducts = activeCategory === "pizza" ? pizzas : focaccias;

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedProductId || currentCategoryProducts[0]?.id || null
  );

  // Sincronizar si cambia la categoría o los productos
  useEffect(() => {
    if (currentCategoryProducts.length > 0) {
      const exists = currentCategoryProducts.some((p) => p.id === internalSelectedId);
      if (!exists && currentCategoryProducts[0]?.id) {
        setInternalSelectedId(currentCategoryProducts[0].id);
        setCurrentImageIndex(0);
        setIsDescriptionOpen(false);
      }
    }
  }, [activeCategory, products]);

  // Si desde afuera (por ej. al tocar una tarjeta de arriba) se selecciona un producto de ESTA categoría
  useEffect(() => {
    if (selectedProductId && currentCategoryProducts.some((p) => p.id === selectedProductId)) {
      setInternalSelectedId(selectedProductId);
      setCurrentImageIndex(0);
      setIsDescriptionOpen(false);
    }
  }, [selectedProductId]);

  const selectedProduct =
    currentCategoryProducts.find((p) => p.id === internalSelectedId) ||
    currentCategoryProducts[0] ||
    null;

  const cardRef = useRef<HTMLDivElement>(null);

  const handleSelectFlavor = (product: Product) => {
    if (product.id) {
      setInternalSelectedId(product.id);
      onSelectProductId(product.id);
    }
    setCurrentImageIndex(0);
    setIsDescriptionOpen(false);

    // Centrar la pantalla automáticamente en todo el cuadro del menú interactivo
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const productImages = selectedProduct
    ? Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct.imageUrl
      ? [selectedProduct.imageUrl]
      : []
    : [];

  const hasMultipleImages = productImages.length > 1;
  const safeImageIndex = productImages.length > 0 ? currentImageIndex % productImages.length : 0;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const displayInfo = selectedProduct ? getProductDisplayInfo(selectedProduct, variant) : null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 1. SYNCHRONIZED CATEGORY SWITCH (PIZZAS | FOCACCIAS) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div
          className={`inline-flex p-2 rounded-full shadow-xl border-2 gap-2 sm:gap-3 ${
            isScheduled
              ? "bg-[#0f2540] border-[#0f2540]"
              : "bg-[#1b456e] border-[#FFC71F]/50"
          }`}
        >
          <button
            type="button"
            onClick={() => onCategoryChange("pizza")}
            className={`font-archivo relative px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-xl tracking-wide transition-all duration-200 flex items-center gap-3 cursor-pointer ${
              activeCategory === "pizza"
                ? "bg-[#FFC71F] text-[#0f2540] shadow-lg"
                : "text-white/85 hover:text-white hover:bg-white/10"
            }`}
          >
            {activeCategory === "pizza" && (
              <motion.div
                layoutId={`nelsonCategoryPill-${variant}-${colorTheme || "default"}`}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[#FFC71F] rounded-full shadow-lg"
              />
            )}
            <span className="relative z-10 text-2xl">🍕</span>
            <span className="relative z-10">PIZZAS</span>
            <span
              className={`relative z-10 text-xs font-black px-2.5 py-0.5 rounded-full transition-colors ${
                activeCategory === "pizza"
                  ? "bg-[#0f2540] text-[#FFC71F]"
                  : "bg-white/20 text-white"
              }`}
            >
              {pizzas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onCategoryChange("focaccia")}
            className={`font-archivo relative px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-xl tracking-wide transition-all duration-200 flex items-center gap-3 cursor-pointer ${
              activeCategory === "focaccia"
                ? "bg-[#FFC71F] text-[#0f2540] shadow-lg"
                : "text-white/85 hover:text-white hover:bg-white/10"
            }`}
          >
            {activeCategory === "focaccia" && (
              <motion.div
                layoutId={`nelsonCategoryPill-${variant}-${colorTheme || "default"}`}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[#FFC71F] rounded-full shadow-lg"
              />
            )}
            <span className="relative z-10 text-2xl">🫓</span>
            <span className="relative z-10">FOCACCIAS</span>
            <span
              className={`relative z-10 text-xs font-black px-2.5 py-0.5 rounded-full transition-colors ${
                activeCategory === "focaccia"
                  ? "bg-[#0f2540] text-[#FFC71F]"
                  : "bg-white/20 text-white"
              }`}
            >
              {focaccias.length}
            </span>
          </button>
        </div>

        {onScrollToOtherSection && (
          <button
            type="button"
            onClick={onScrollToOtherSection}
            className={`font-archivo px-5 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isScheduled
                ? "bg-[#0f2540] text-[#FFC71F] hover:bg-[#1a569a] hover:text-white"
                : "bg-[#FFC71F] text-[#0f2540] hover:bg-[#ffd44d]"
            }`}
          >
            {isScheduled ? (
              <>
                <Clock size={16} />
                <span>↑ Ir a Pedidos para HOY</span>
              </>
            ) : (
              <>
                <CalendarDays size={16} />
                <span>↓ Ir a Pedidos para OTRA FECHA</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. SPLIT-VIEW INTERACTIVE MENU */}
      {currentCategoryProducts.length === 0 ? (
        <div className="bg-white rounded-[36px] p-12 text-center shadow-xl border-2 border-[#1D5B9B]/15">
          <div className="text-6xl mb-4">{activeCategory === "pizza" ? "🍕" : "🫓"}</div>
          <h3 className="text-2xl font-archivo text-[#0f2540] mb-2">
            Todavía no hay {activeCategory === "pizza" ? "Pizzas" : "Focaccias"} cargadas
          </h3>
          <p className="text-gray-500">
            Podés agregarlas en cualquier momento desde el panel de administración (`/admin/products`).
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div
            ref={cardRef}
            className={`rounded-[36px] p-5 sm:p-7 md:p-9 lg:p-10 shadow-2xl border-4 relative overflow-hidden transition-all duration-300 scroll-mt-28 ${
              isComplementary
                ? "bg-[#2A1810] border-[#FFC71F]/40 shadow-black/40"
                : "bg-[#24598d] border-[#1b456e]"
            }`}
          >
            {/* Decorative subtle glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFC71F]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch relative z-10">
              {/* LEFT COLUMN: LARGE PHOTO VIEWER WITH CAROUSEL & TOP-LEFT OVERLAY */}
              <div className="lg:col-span-7 flex flex-col">
                {selectedProduct && displayInfo && (
                  <div className="relative w-full min-h-[430px] sm:min-h-[500px] lg:h-full rounded-[28px] overflow-hidden shadow-2xl bg-[#0a192c] border-2 border-white/15 flex flex-col justify-between group">
                    {/* CAROUSEL IMAGE BACKGROUND (Supports swipe on touch devices) */}
                    <AnimatePresence mode="wait">
                      {productImages.length > 0 ? (
                        <motion.img
                          key={`${selectedProduct.id}-${safeImageIndex}`}
                          src={productImages[safeImageIndex]}
                          alt={`${selectedProduct.name} - Foto ${safeImageIndex + 1}`}
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          drag={hasMultipleImages ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.15}
                          onDragEnd={(_, info) => {
                            if (!hasMultipleImages) return;
                            if (info.offset.x < -45) {
                              setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
                            } else if (info.offset.x > 45) {
                              setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
                            }
                          }}
                          className={`absolute inset-0 w-full h-full object-cover select-none ${
                            hasMultipleImages ? "cursor-grab active:cursor-grabbing" : ""
                          } ${!displayInfo.isAvailable ? "grayscale contrast-75" : ""}`}
                        />
                      ) : (
                        <motion.div
                          key={`placeholder-${selectedProduct.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1b456e] via-[#24598d] to-[#0f2540] flex items-center justify-center"
                        >
                          <span className="text-[120px] select-none drop-shadow-2xl">
                            {activeCategory === "pizza" ? "🍕" : "🫓"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Gradient overlays for crisp legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/80 pointer-events-none" />

                    {/* TOP OVERLAY: NAME, PRICE & COLLAPSIBLE "VER DESCRIPCIÓN" */}
                    <div className="relative z-20 p-5 sm:p-7 flex flex-col items-start">
                      <div className="w-full flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-[78%]">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-archivo uppercase tracking-wider mb-2 shadow ${
                              isScheduled
                                ? "bg-[#FFC71F] text-[#0f2540]"
                                : "bg-emerald-400 text-[#0f2540]"
                            }`}
                          >
                            <span>
                              {isScheduled
                                ? "🟡 Precio Programado (Otra Fecha)"
                                : "🟢 Entrega Hoy"}
                            </span>
                          </div>
                          <h3 className="font-archivo text-2xl sm:text-4xl text-white uppercase tracking-tight leading-none drop-shadow-md">
                            {selectedProduct.name}
                          </h3>

                          {/* PRICE BADGE */}
                          <div className="flex flex-wrap items-baseline gap-2.5 mt-2">
                            <span className="font-archivo text-3xl sm:text-4xl text-[#FFC71F] drop-shadow">
                              ${displayInfo.price.toLocaleString("es-AR")}
                            </span>
                            {displayInfo.originalPrice && (
                              <span className="text-base sm:text-lg font-bold text-white/60 line-through">
                                ${displayInfo.originalPrice.toLocaleString("es-AR")}
                              </span>
                            )}
                            {selectedProduct.priceOffer && displayInfo.isAvailable && (
                              <span className="font-archivo bg-red-500 text-white text-[11px] uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                                ¡Oferta!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stock Pill Top-Right */}
                        <div
                          className={`font-archivo px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wide shadow-lg backdrop-blur-md ${
                            displayInfo.isAvailable
                              ? isScheduled
                                ? "bg-[#FFC71F] text-[#0f2540]"
                                : "bg-emerald-500/95 text-white"
                              : "bg-red-600/95 text-white"
                          }`}
                        >
                          {displayInfo.statusText}
                        </div>
                      </div>

                      {/* BUTTON: "Ver descripción" (Only reveals description when clicked) */}
                      <button
                        type="button"
                        onClick={() => setIsDescriptionOpen((prev) => !prev)}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/30 transition-all cursor-pointer shadow-sm"
                      >
                        <Info size={15} className="text-[#FFC71F]" />
                        <span>{isDescriptionOpen ? "Ocultar descripción" : "Ver descripción"}</span>
                        {isDescriptionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* COLLAPSIBLE DESCRIPTION PANEL */}
                      <AnimatePresence>
                        {isDescriptionOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden w-full max-w-lg mt-2.5"
                          >
                            <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-[#FFC71F]/40 text-white/95 text-sm sm:text-base leading-relaxed shadow-xl">
                              {selectedProduct.description || "Elaborada con ingredientes gourmet seleccionados."}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CAROUSEL LEFT/RIGHT ARROWS */}
                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          aria-label="Foto anterior"
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#FFC71F] text-white hover:text-[#0f2540] flex items-center justify-center transition-all shadow-lg backdrop-blur-sm cursor-pointer"
                        >
                          <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          aria-label="Foto siguiente"
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#FFC71F] text-white hover:text-[#0f2540] flex items-center justify-center transition-all shadow-lg backdrop-blur-sm cursor-pointer"
                        >
                          <ChevronRight size={24} strokeWidth={2.5} />
                        </button>
                      </>
                    )}

                    {/* BOTTOM OVERLAY: CAROUSEL DOTS & ADD TO CART ACTION */}
                    <div className="relative z-20 p-5 sm:p-7 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                      {hasMultipleImages ? (
                        <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                          {productImages.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              aria-label={`Ir a foto ${idx + 1}`}
                              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                                idx === safeImageIndex
                                  ? "w-7 bg-[#FFC71F]"
                                  : "w-2.5 bg-white/50 hover:bg-white/80"
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-white/80 ml-1">
                            {safeImageIndex + 1}/{productImages.length}
                          </span>
                        </div>
                      ) : (
                        <div className="hidden sm:block" />
                      )}

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (displayInfo.isAvailable) {
                            onAddToCart(selectedProduct, e, isScheduled);
                          } else {
                            onOutOfStockClick(selectedProduct);
                          }
                        }}
                        className={`font-archivo w-full sm:w-auto px-7 py-4 rounded-full text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer ${
                          displayInfo.isAvailable
                            ? "bg-[#FFC71F] hover:bg-[#ffcf3d] text-[#0f2540] hover:scale-[1.03] active:scale-95 shadow-[#FFC71F]/25"
                            : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        }`}
                      >
                        <ShoppingBag size={20} strokeWidth={2.5} />
                        <span>
                          {displayInfo.isAvailable
                            ? `${isScheduled ? "Encargar (Otro Día)" : "Pedir para Hoy"} • $${displayInfo.price.toLocaleString("es-AR")}`
                            : "Sin stock hoy (Encargar otro día)"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: STACKED ROUNDED PILL BUTTONS FOR FLAVORS */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-archivo text-xs uppercase tracking-widest text-[#FFC71F] flex items-center gap-1.5">
                      <Sparkles size={14} />
                      Sabores Gourmet ({currentCategoryProducts.length})
                    </span>
                    <span className="text-xs font-bold text-white/80">
                      {isScheduled ? "🟡 Entrega Futura" : "🟢 Entrega Hoy"}
                    </span>
                  </div>

                  {/* Flavor Pills List */}
                  <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                    {currentCategoryProducts.map((item) => {
                      const isSelected = selectedProduct?.id === item.id;
                      const itemInfo = getProductDisplayInfo(item, variant);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectFlavor(item)}
                          className={`font-archivo w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-full uppercase tracking-wider text-sm sm:text-base transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer text-left ${
                            isSelected
                              ? "bg-white text-[#24598d] border-[3px] border-[#FFC71F] shadow-xl scale-[1.01]"
                              : "bg-transparent text-white/85 border-2 border-white/35 hover:border-white/80 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate flex-1">{item.name}</span>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {!itemInfo.isAvailable && (
                              <span
                                className={`font-sans text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isSelected ? "bg-red-100 text-red-600" : "bg-black/30 text-white/75"
                                }`}
                              >
                                Agotado
                              </span>
                            )}
                            <span
                              className={`text-sm sm:text-base font-black ${
                                isSelected ? "text-[#24598d]" : "text-[#FFC71F]"
                              }`}
                            >
                              ${itemInfo.price.toLocaleString("es-AR")}
                            </span>

                            {/* Botón de añadir en amarillo al lado del precio */}
                            <button
                              type="button"
                              title={`Añadir ${item.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (itemInfo.isAvailable) {
                                  onAddToCart(item, e, isScheduled);
                                } else {
                                  onOutOfStockClick(item);
                                }
                              }}
                              className={`w-8 h-8 rounded-full font-archivo text-xs flex items-center justify-center transition-all cursor-pointer shadow-md ${
                                itemInfo.isAvailable
                                  ? "bg-[#FFC71F] hover:bg-[#ffd74d] text-[#0f2540] hover:scale-110 active:scale-95"
                                  : "bg-gray-400/50 text-white/60 cursor-not-allowed"
                              }`}
                            >
                              <Plus size={16} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Helper footer inside right panel */}
                <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80 px-2">
                  <span>Tocá cualquier variedad para ver su galería</span>
                  {hasMultipleImages && (
                    <span className="font-bold text-[#FFC71F]">📷 {productImages.length} fotos</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
