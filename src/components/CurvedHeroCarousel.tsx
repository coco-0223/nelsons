"use client";

import { useEffect, useRef, useMemo } from "react";
import { Product } from "@/types";

interface CurvedHeroCarouselProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const TOTAL_CARDS = 10;
const PITCH = 196;
const LOOP_WIDTH = TOTAL_CARDS * PITCH; // 1960u
const AUTO_SPEED = 50; // 50u por segundo (derecha a izquierda)

/**
 * Generador exacto de path SVG para trapezoide con esquinas redondeadas
 * Soporta tanto cuando hR >= hL (derecha de la pantalla) como cuando hL > hR (izquierda de la pantalla)
 * manteniendo todo dentro del bounding box [0..w, 0..maxH].
 */
function makeQuadPath(w: number, hL: number, hR: number, r = 15): string {
  const minH = Math.min(hL, hR);
  const maxH = Math.max(hL, hR);
  r = Math.min(r, w / 2, minH / 2);

  const yTL = (maxH - hL) / 2;
  const yBL = yTL + hL;
  const yTR = (maxH - hR) / 2;
  const yBR = yTR + hR;

  // Pendiente superior e inferior para que las curvas Q en las 4 esquinas sean suaves
  const topSlope = (yTR - yTL) / w;
  const botSlope = (yBR - yBL) / w;

  const yTL_in = yTL + topSlope * r;
  const yTR_in = yTR - topSlope * r;
  const yBR_in = yBR - botSlope * r;
  const yBL_in = yBL + botSlope * r;

  return (
    `path("M ${r.toFixed(2)} ${yTL_in.toFixed(2)} ` +
    `L ${(w - r).toFixed(2)} ${yTR_in.toFixed(2)} Q ${w.toFixed(2)} ${yTR.toFixed(2)} ${w.toFixed(2)} ${(yTR + r).toFixed(2)} ` +
    `L ${w.toFixed(2)} ${(yBR - r).toFixed(2)} Q ${w.toFixed(2)} ${yBR.toFixed(2)} ${(w - r).toFixed(2)} ${yBR_in.toFixed(2)} ` +
    `L ${r.toFixed(2)} ${yBL_in.toFixed(2)} Q 0 ${yBL.toFixed(2)} 0 ${(yBL - r).toFixed(2)} ` +
    `L 0 ${(yTL + r).toFixed(2)} Q 0 ${yTL.toFixed(2)} ${r.toFixed(2)} ${yTL_in.toFixed(2)} Z")`
  );
}

export function CurvedHeroCarousel({ products, onSelectProduct }: CurvedHeroCarouselProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Exactamente 10 tarjetas como en el script original (repetimos productos si hay menos de 10)
  const items = useMemo(() => {
    if (!products || products.length === 0) return [];
    const list: Product[] = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
      list.push(products[i % products.length]);
    }
    return list;
  }, [products]);

  // Estado mutable en refs para que el bucle requestAnimationFrame corra a 60/120fps sin re-renderizar React
  const scrollPosRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startPointerXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const scaleRef = useRef(1);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const updateScale = () => {
      if (!outerRef.current || !wrapRef.current) return;
      const vw = outerRef.current.clientWidth || window.innerWidth;
      // En celulares (<=820px) usamos una base de 680u para que las tarjetas se vean grandes; en desktop 1440u
      const baseWidth = vw <= 820 ? 680 : 1440;
      const s = vw / baseWidth;
      scaleRef.current = s;

      // Centramos el lienzo de 1440x420 escalado con transform
      const scaledHeight = 420 * s;
      outerRef.current.style.height = `${scaledHeight}px`;
      const offsetX = (vw - 1440 * s) / 2;
      wrapRef.current.style.transform = `translate3d(${offsetX}px, 0, 0) scale(${s})`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isDraggingRef.current) {
        // Inercia: decae ~95% por segundo
        velocityRef.current *= Math.pow(0.05, dt);
        // Auto-scroll base
        scrollPosRef.current += (velocityRef.current + AUTO_SPEED) * dt;
      }

      // Normalización cíclica
      scrollPosRef.current = ((scrollPosRef.current % LOOP_WIDTH) + LOOP_WIDTH) % LOOP_WIDTH;

      // Actualización geométrica directa en el DOM de cada tarjeta (igual al script original)
      for (let i = 0; i < TOTAL_CARDS; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        // Cálculo del offset sin desplazar 't' centrado en x = 720
        let t = (i * PITCH - scrollPosRef.current) % LOOP_WIDTH;
        if (t < -LOOP_WIDTH / 2) t += LOOP_WIDTH;
        if (t > LOOP_WIDTH / 2) t -= LOOP_WIDTH;

        // x con empuje hacia el exterior
        const normT = t / 706;
        const x = 720 + t * (1 + 0.083 * Math.pow(normT, 2));

        // Distancia normalizada al centro
        const d = Math.abs(x - 720) / 706;

        // Dimensiones según fórmula de cilindro
        const width = 170 + 48 * Math.pow(d, 2);
        const leftEdgeX = x - width / 2;
        const rightEdgeX = x + width / 2;

        const qL = Math.abs(leftEdgeX - 720) / 706;
        const qR = Math.abs(rightEdgeX - 720) / 706;

        const hL = 280 + 92 * Math.pow(qL, 2.6);
        const hR = 280 + 92 * Math.pow(qR, 2.6);
        const maxH = Math.max(hL, hR);

        // Centro vertical (687 - 500) - 12 * d^2
        const cy = 187 - 12 * Math.pow(d, 2);

        // Aplicar posición y recorte curvado directamente al elemento DOM
        card.style.width = `${width}px`;
        card.style.height = `${maxH}px`;
        card.style.transform = `translate3d(${leftEdgeX}px, ${cy - maxH / 2}px, 0)`;

        const clip = makeQuadPath(width, hL, hR, 15);
        card.style.clipPath = clip;
        (card.style as unknown as Record<string, string>).webkitClipPath = clip;

        // Ocultar si está fuera del encuadre
        card.style.display = leftEdgeX > 1480 || rightEdgeX < -40 ? "none" : "block";
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateScale);
    };
  }, [items]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPointerXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    velocityRef.current = 0;
    if (wrapRef.current) {
      wrapRef.current.classList.add("cursor-grabbing");
      try {
        wrapRef.current.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dxScreen = e.clientX - lastPointerXRef.current;
    if (Math.abs(e.clientX - startPointerXRef.current) > 6) {
      hasMovedRef.current = true;
    }
    lastPointerXRef.current = e.clientX;

    // Convertir el delta de pantalla al espacio de 1440u
    const dx = dxScreen / (scaleRef.current || 1);
    scrollPosRef.current -= dx; // 1:1 con el puntero
    velocityRef.current = -dx / 0.016; // Velocidad para inercia
  };

  const stopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (wrapRef.current) {
      wrapRef.current.classList.remove("cursor-grabbing");
      try {
        wrapRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  if (items.length === 0) return null;

  return (
    <div ref={outerRef} className="w-full relative overflow-hidden select-none">
      {/* Lienzo nativo de 1440x420 escalado uniformemente */}
      <div
        ref={wrapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1440px",
          height: "420px",
          transformOrigin: "top left",
          touchAction: "pan-y",
        }}
        className="cursor-grab select-none"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {items.map((product, i) => {
            const photo =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : product.imageUrl || null;
            const isVideo = Boolean(
              photo && (photo.endsWith(".mp4") || photo.endsWith(".webm") || photo.endsWith(".gif"))
            );
            const displayPrice = product.priceOffer || product.priceToday;

            return (
              <div
                key={`${product.id}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => {
                  if (!hasMovedRef.current) {
                    onSelectProduct(product);
                  }
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  overflow: "hidden",
                  background: "#0f2540",
                  willChange: "clip-path, transform",
                  pointerEvents: "auto",
                }}
                className="group cursor-pointer"
              >
                {/* Media de la tarjeta (Pizza / Focaccia) */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  {photo ? (
                    isVideo ? (
                      <video
                        src={photo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={photo}
                        alt={product.name}
                        draggable={false}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#1b456e] via-[#24598d] to-[#0f2540]">
                      {product.category === "focaccia" ? "🫓" : "🍕"}
                    </div>
                  )}
                </div>

                {/* Degradado sutil inferior para que se lea el nombre de la pizza/focaccia */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/80 pointer-events-none" />

                {/* Badge categoría arriba a la izquierda */}
                <div className="absolute top-[18px] left-[14px] right-[14px] flex items-center justify-between pointer-events-none z-[2]">
                  <span className="bg-[#24598d]/90 text-[#FFC71F] border border-[#FFC71F]/50 text-[11px] font-archivo uppercase px-2.5 py-0.5 rounded-full shadow">
                    {product.category === "focaccia" ? "Focaccia" : "Pizza"}
                  </span>
                  {product.priceOffer && (
                    <span className="bg-red-500 text-white text-[10px] font-archivo uppercase px-2 py-0.5 rounded-full shadow">
                      Oferta
                    </span>
                  )}
                </div>

                {/* Nombre y precio al lado del botón esmerilado inferior izquierdo */}
                <div className="absolute bottom-[14px] left-[12px] right-[12px] flex items-end gap-2.5 pointer-events-none z-[2]">
                  {/* Icono play esmerilado idéntico a .reel-card-play */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.25)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                    className="flex-shrink-0 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{ width: "10px", height: "10px", fill: "#ffffff", marginLeft: "2px" }}
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-archivo text-white text-[13px] uppercase leading-tight line-clamp-1 drop-shadow block">
                      {product.name}
                    </span>
                    <span className="font-archivo text-[#FFC71F] text-[14px] leading-none drop-shadow">
                      ${displayPrice.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
