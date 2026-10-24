# Contexto del Proyecto (Project Context) — NELSON'S

Este documento es la fuente de verdad del proyecto. El subagente `project_manager` debe leer y consultar este archivo para entender de qué trata la webapp, sus reglas de negocio y los próximos pasos.

## 1. Identidad Visual, Tipografía y Nuevo Hero (NELSON'S)
- **Fuente Principal**: `Archivo Black` (cargada desde `next/font/google`) para títulos, botones, precios y elementos destacados.
- **Logo Oficial (`public/nelsons-logo.png`)**:
  - Se utiliza la imagen oficial de NELSON'S (`public/nelsons-logo.png`, fondo azul y letras amarillas `#FFC71F` con la sonrisa bajo la S) en corte recto/plano sin bordes redondeados.
- **Diseño del Hero Principal (Estilo Referencia Adjunta)**:
  - **Titular Principal Gigante**:
    - Reemplaza `"MASA MADRE. HORNO. PASIÓN."` por:
      - **`HORNEADO CASERO.`**
      - **`AMOR.`** seguido inmediatamente por la **Patita Roja** (imagen adjunta `public/nelsons-paw.png` / silueta exacta de la patita roja).
  - **Botones de Acción Principales**:
    - Reemplaza `"VER MENÚ"` por **`COMPRAR HOY`** (botón píldora amarillo `#FFC71F` con sombra/glow que desplaza suavemente a `#menu`).
    - Reemplaza `"NUESTRA HISTORIA"` por **`COMPRAR OTRO DÍA`** (botón píldora con borde blanco fino sobre azul que desplaza suavemente a `#menu-programado`).
- **Navegación Fluida (Smooth Scroll)**:
  - `scroll-behavior: smooth` global y desplazamiento suave programático en **TODO botón que se toque** hacia la sección pertinente (sin saltos repentinos).

## 2. Recuadros de Categorías (`PIZZAS` y `FOCACCIAS`) + Tira de Productos Full-Width
- **Recuadros Horizontales de Categorías**:
  - En lugar de los 2 círculos anteriores, el Hero muestra **2 grandes recuadros horizontales con bordes redondeados** lado a lado (como en la tercera imagen de referencia):
    - **Recuadro 1**: Foto panorámica de pizza con el título **`PIZZAS`** centrado en grande sobre la foto.
    - **Recuadro 2**: Foto panorámica de focaccia con el título **`FOCACCIAS`** centrado en grande sobre la foto.
    - Al tocar cualquiera de los dos recuadros, selecciona esa categoría y hace scroll suave hacia el `MENÚ`.
- **Tira de Productos Debajo (Ancho Completo, Sin Scrollbar y Solo Colores de Marca)**:
  - Debajo de los recuadros de `PIZZAS` y `FOCACCIAS`, se mantiene la fila de tarjetas rectangulares de productos reales con su foto, nombre y precio.
  - **Ancho completo (`w-full`)** ocupando todo el ancho disponible.
  - **Sin barra de scroll visible** (`no-scrollbar` ocultando `::-webkit-scrollbar` y `scrollbar-width: none`).
  - **Exclusivamente colores de marca**: Se eliminan los colores verde, rojo, celeste y rosa; todas las tarjetas usan únicamente la paleta oficial de **Nelson's** (Azul Nelson's `#144070` / `#0f2540` y Amarillo Nelson's `#FFC71F` con blanco).

## 3. Arquitectura de la Webapp en Dos Partes (En la misma página, diferenciadas)
- **PARTE 1: Pedidos para HOY (Inmediatos)**
  - **Título**: `MENÚ`
  - **Estilo**: Paleta visual estándar de la marca.
  - **Selector/Switch**: Switch sincronizado entre Pizzas y Focaccias.
  - **Catálogo**: Menú interactivo Split-View (visor con carrusel + nombre/precio arriba a la izquierda + "Ver descripción" al tocar + píldoras a la derecha) y cuadro ancho de items gourmet con botón y precio directo.
- **PARTE 2: Pedidos PROGRAMADOS (Para otro día)**
  - **Estilo e Identificador**: Bloque en **color amarillo vibrante (`#FFC71F`)** con el banner:
    **`⚠️ SECCIÓN EXCLUSIVA: PEDIDOS PARA OTRA FECHA / PROGRAMADOS.`**
  - **Catálogo duplicado**: Mismo catálogo interactivo de Pizzas y Focaccias sincronizado, pero con tarifa para entrega futura (`priceScheduled`, stock ilimitado).

## 4. Lógica de Carrito, Avisos y Popups
- **Formato del Carrito / Resumen**:
  - Amplio y legible (`w-[94vw] sm:w-[440px] md:w-[480px]`).
  - Items divididos en dos bloques visualmente contrastados:
    - **`🟢 Entrega Hoy`**
    - **`🟡 Entrega Futura (Otro Día)`**
- **Reglas de Popups al Agregar Productos de la Sección "Para otro día"**:
  1. **Solo otro día (primera vez)**:
     > *"Estás por encargar para otro día. Una vez termines de cargar tu pedido, te vamos a preguntar para qué fecha lo querés."*
  2. **Pedido mixto (Hoy + Otro día)**:
     > *"⚠️ ATENCIÓN: Estás haciendo un pedido para hoy y también para otro día. Una vez termines de cargar tu pedido, te vamos a preguntar para qué fecha querés los productos programados."*
