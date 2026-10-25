"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Product } from "@/types";

interface CurvedHeroCarouselProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function CurvedHeroCarousel({ products, onSelectProduct }: CurvedHeroCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Preparamos los items para el carrusel (repetimos para que sea un loop fluido)
  const items = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Duplicamos si son pocos para tener mínimo 8-10 tarjetas continuas
    let base = [...products];
    while (base.length < 10) {
      base = [...base, ...products];
    }
    return base.slice(0, 14);
  }, [products]);

  // Estado de desplazamiento
  const scrollOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Cards state for rendering
  const [cardPositions, setCardPositions] = useState<
    Array<{
      product: Product;
      x: number;
      width: number;
      leftHeight: number;
      rightHeight: number;
      centerY: number;
      clipPath: string;
      photo: string | null;
      isVideo: boolean;
      index: number;
    }>
  >([]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const updatePhysics = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      if (!isDraggingRef.current) {
        // Inercia si hay velocidad residual
        if (Math.abs(velocityRef.current) > 0.5) {
          scrollOffsetRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.05, dt); // desaceleración ~95% por segundo
        } else {
          // Auto-scroll continuo hacia la izquierda (50 unidades por segundo)
          scrollOffsetRef.current -= 50 * dt;
        }
      }

      // Geometría del arco cilíndrico (según la fórmula exacta del prompt):
      // Centro = 720, Pitch = 196u, Ancho base 1440
      const count = items.length;
      if (count === 0) return;
      const pitch = 196;
      const totalWidth = count * pitch;

      // Normalizar offset para loop infinito
      let offset = scrollOffsetRef.current % totalWidth;
      if (offset > 0) offset -= totalWidth;

      const computed = [];

      for (let i = 0; i < count; i++) {
        // Posición base sin empujar
        let rawX = (i * pitch + offset) % totalWidth;
        if (rawX < -pitch * 2) rawX += totalWidth;
        if (rawX > 1440 + pitch) rawX -= totalWidth;

        // t es la distancia no empujada respecto al centro (720)
        const t = rawX - 720;
        
        // Empuje de cilindro para mantener separación natural
        const tNorm = t / 706;
        const x = 720 + t * (1 + 0.083 * Math.pow(tNorm, 2));

        // Solo procesamos si está visible en el frame (con margen)
        if (x < -180 || x > 1620) continue;

        // Distancia normalizada d respecto al centro
        const d = Math.min(Math.abs(x - 720) / 706, 1.4);

        // Ancho de la tarjeta: (170 + 48 * d^2)
        const width = 170 + 48 * Math.pow(d, 2);

        // Altura de los bordes izquierdo y derecho (simulando vista interior de cilindro)
        const leftEdgeX = x - width / 2;
        const rightEdgeX = x + width / 2;
        const qLeft = Math.min(Math.abs(leftEdgeX - 720) / 706, 1.5);
        const qRight = Math.min(Math.abs(rightEdgeX - 720) / 706, 1.5);

        const leftHeight = 280 + 92 * Math.pow(qLeft, 2.6);
        const rightHeight = 280 + 92 * Math.pow(qRight, 2.6);

        // Centro vertical en el frame (curvatura sutil en el eje Y)
        const centerY = 200 - 12 * Math.pow(d, 2);

        // Creamos la forma convexa con perspectiva de cilindro
        const r = 16; // border radius
        const hw = width / 2;
        const hl = leftHeight / 2;
        const hr = rightHeight / 2;

        // Path poligonal redondeado o quad
        const clipPath = `polygon(
          0px 0px,
          100% ${((hr - hl) / 2 + 10).toFixed(1)}px,
          100% 100%,
          0px 100%
        )`;

        const product = items[i];
        const photo =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.imageUrl || null;

        const isVideo = Boolean(photo && (photo.endsWith(".mp4") || photo.endsWith(".webm") || photo.endsWith(".gif")));

        computed.push({
          product,
          x,
          width,
          leftHeight,
          rightHeight,
          centerY,
          clipPath,
          photo,
          isVideo,
          index: i,
        });
      }

      setCardPositions(computed);
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [items]);

  // Touch / Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    dragStartOffsetRef.current = scrollOffsetRef.current;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max((now - lastTimeRef.current) / 1000, 0.001);
    const deltaX = e.clientX - lastXRef.current;

    velocityRef.current = deltaX / dt;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    // Escala de movimiento (ajustada a la resolución)
    const factor = containerRef.current
      ? 1440 / Math.max(containerRef.current.clientWidth, 320)
      : 1;

    scrollOffsetRef.current += deltaX * factor;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className="w-full relative py-6 overflow-hidden select-none">
      {/* Contenedor relativo escalable basado en un lienzo virtual de 1440u */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-[370px] sm:h-[410px] md:h-[430px] relative cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ perspective: "1000px" }}
      >
        {cardPositions.map((card) => {
          const avgHeight = (card.leftHeight + card.rightHeight) / 2;
          const displayPrice = card.product.priceOffer || card.product.priceToday;

          // Convertimos las coordenadas de 1440u a porcentajes del ancho del viewport
          const leftPercent = (card.x / 1440) * 100;
          const widthPercent = (card.width / 1440) * 100;

          return (
            <div
              key={`${card.product.id}-${card.index}`}
              onClick={() => onSelectProduct(card.product)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer"
              style={{
                left: `${leftPercent}%`,
                width: `clamp(140px, ${widthPercent}vw, 240px)`,
                height: `clamp(230px, ${(avgHeight / 1080) * 100}vh, 370px)`,
                zIndex: Math.round(500 - Math.abs(card.x - 720)),
                transition: isDraggingRef.current ? "none" : "transform 0.15s ease-out",
              }}
            >
              <div
                className="w-full h-full rounded-[20px] overflow-hidden relative shadow-2xl border-2 border-[#FFC71F]/40 group-hover:border-[#FFC71F] group-hover:scale-[1.03] transition-all duration-300 bg-[#0a192c]"
                style={{
                  clipPath: card.clipPath,
                }}
              >
                {/* Media: Video, GIF o Foto */}
                {card.photo ? (
                  card.isVideo ? (
                    <video
                      src={card.photo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <img
                      src={card.photo}
                      alt={card.product.name}
                      draggable={false}
                      className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-110 transition-transform duration-700"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#1b456e] via-[#24598d] to-[#0f2540]">
                    {card.product.category === "focaccia" ? "🫓" : "🍕"}
                  </div>
                )}

                {/* Gradiente oscuro superior e inferior */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

                {/* Badge de Categoría Superior */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="bg-[#24598d]/90 text-[#FFC71F] border border-[#FFC71F]/50 text-[10px] sm:text-xs font-archivo uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    {card.product.category === "focaccia" ? "Focaccia" : "Pizza"}
                  </span>
                  {card.product.priceOffer && (
                    <span className="bg-red-500 text-white text-[9px] font-archivo uppercase px-2 py-0.5 rounded-full shadow">
                      Oferta
                    </span>
                  )}
                </div>

                {/* Overlay Inferior: Nombre y Precio */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-left">
                  <span className="font-archivo text-white text-xs sm:text-sm uppercase leading-tight line-clamp-1 drop-shadow-md block">
                    {card.product.name}
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-archivo text-[#FFC71F] text-sm sm:text-base drop-shadow">
                      ${displayPrice.toLocaleString("es-AR")}
                    </span>
                    <span className="text-[10px] text-white/80 font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      Ver en Menú →
                    </span>
                  </div>
                </div>

                {/* Pequeño icono translúcido play/sparkle */}
                <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  ▶
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicador sutil de arrastre */}
      <div className="text-center mt-1 text-[11px] font-bold text-white/60 tracking-wider uppercase pointer-events-none">
        ← Arrastrá para explorar pizzas y focaccias →
      </div>
    </div>
  );
}
