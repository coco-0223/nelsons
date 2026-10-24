"use client";

import { useState, useEffect, useRef } from "react";
import { Product, Recipe } from "@/types";
import { Plus, Trash2, Edit2, BookOpen, X, Upload, Image as ImageIcon, Star, Link as LinkIcon, ArrowLeft, ArrowRight } from "lucide-react";

const compressImageFile = (file: File, maxWidth = 900, quality = 0.78): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "pizza" | "focaccia">("all");
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  
  const [addingStockProductId, setAddingStockProductId] = useState<string | null>(null);
  const [stockToAdd, setStockToAdd] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    priceToday: 0,
    priceScheduled: 0,
    stock: 0,
    category: 'pizza',
    images: [],
    isAvailable: true
  });

  useEffect(() => {
    const storedProducts = localStorage.getItem("coquetas_products");
    if (storedProducts) {
      const parsed = JSON.parse(storedProducts);
      const migrated = parsed.map((p: any) => {
        const base = 'price' in p ? { ...p, priceToday: p.price, priceScheduled: p.price } : p;
        const category = (base.category === "pizza" || base.category === "focaccia") ? base.category : "pizza";
        const images = Array.isArray(base.images) && base.images.length > 0
          ? base.images
          : base.imageUrl ? [base.imageUrl] : [];
        return {
          ...base,
          category,
          images,
          imageUrl: images[0] || base.imageUrl
        };
      });
      setProducts(migrated);
    }
    const storedRecipes = localStorage.getItem("coquetas_recipes");
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }
    setIsLoaded(true);
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem("coquetas_products", JSON.stringify(updated));
    } catch (err) {
      console.error("Error guardando productos en localStorage:", err);
      alert("Atención: Las imágenes ocupan demasiado espacio en el navegador. Intentá eliminar alguna imagen o usar fotos más livianas.");
    }
  };

  const handleUpdateProductField = (id: string, field: keyof Product, value: any) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    saveProducts(updated);
  };

  const handleUpdateProductFields = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    saveProducts(updated);
  };

  const handleAdjustStock = (id: string, amount: number) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + amount);
        return { ...p, stock: newStock, isAvailable: newStock > 0 };
      }
      return p;
    });
    saveProducts(updated);
  };

  const submitAddStock = () => {
    if (!addingStockProductId || !stockToAdd) return;
    const amount = parseInt(stockToAdd, 10);
    if (!isNaN(amount) && amount !== 0) {
      handleAdjustStock(addingStockProductId, amount);
    }
    setAddingStockProductId(null);
    setStockToAdd('');
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto de Nelson's?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await compressImageFile(files[i]);
        compressedList.push(dataUrl);
      }
      const currentImages = editingProduct.images || [];
      const updatedImages = [...currentImages, ...compressedList];
      setEditingProduct({
        ...editingProduct,
        images: updatedImages,
        imageUrl: updatedImages[0]
      });
    } catch (err) {
      console.error("Error procesando imágenes:", err);
      alert("No se pudo procesar una de las imágenes seleccionadas.");
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    const currentImages = editingProduct.images || [];
    const updatedImages = [...currentImages, trimmed];
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      imageUrl: updatedImages[0]
    });
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = editingProduct.images || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== index);
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      imageUrl: updatedImages[0] || undefined
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    const currentImages = [...(editingProduct.images || [])];
    if (index <= 0 || index >= currentImages.length) return;
    const [selected] = currentImages.splice(index, 1);
    currentImages.unshift(selected);
    setEditingProduct({
      ...editingProduct,
      images: currentImages,
      imageUrl: currentImages[0]
    });
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const currentImages = [...(editingProduct.images || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;
    setEditingProduct({
      ...editingProduct,
      images: currentImages,
      imageUrl: currentImages[0]
    });
  };

  const handleSaveProduct = () => {
    if (!editingProduct.name) return;
    const productImages = editingProduct.images && editingProduct.images.length > 0
      ? editingProduct.images
      : editingProduct.imageUrl ? [editingProduct.imageUrl] : [];
    
    const newProduct: Product = {
      id: editingProduct.id || Date.now().toString(),
      name: editingProduct.name || '',
      description: editingProduct.description || '',
      priceToday: editingProduct.priceToday || 0,
      priceScheduled: editingProduct.priceScheduled || 0,
      priceOffer: editingProduct.priceOffer,
      priceWholesale: editingProduct.priceWholesale,
      wholesaleMinQuantity: editingProduct.wholesaleMinQuantity,
      stock: editingProduct.stock || 0,
      category: (editingProduct.category === "focaccia" ? "focaccia" : "pizza"),
      images: productImages,
      imageUrl: productImages[0] || undefined,
      isAvailable: (editingProduct.stock || 0) > 0,
      createdAt: editingProduct.createdAt || Date.now(),
    };
    
    let updated;
    if (editingProduct.id) {
      updated = products.map(p => p.id === editingProduct.id ? newProduct : p);
    } else {
      updated = [...products, newProduct];
    }
    
    saveProducts(updated);
    setShowProductModal(false);
  };

  const openNewProductModal = (defaultCategory: "pizza" | "focaccia" = "pizza") => {
    setEditingProduct({
      name: '',
      description: '',
      priceToday: 0,
      priceScheduled: 0,
      stock: 10,
      category: defaultCategory,
      images: [],
      isAvailable: true
    });
    setImageUrlInput('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    const imgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl ? [product.imageUrl] : [];
    setEditingProduct({
      ...product,
      category: product.category === "focaccia" ? "focaccia" : "pizza",
      images: imgs
    });
    setImageUrlInput('');
    setShowProductModal(true);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    let totalBatchCost = 0;
    recipe.ingredients.forEach(ing => {
      const unitCost = ing.unitType === 'unid' ? ing.buyPrice / (ing.packageSize || 1) : ing.buyPrice;
      totalBatchCost += (unitCost * ing.quantityUsed);
    });
    const costPerUnit = totalBatchCost / recipe.yield;
    const suggestedPrice = Math.ceil(costPerUnit * 3 / 100) * 100;
    const isFocaccia = recipe.name.toLowerCase().includes("focaccia");

    setEditingProduct({
      name: recipe.name,
      description: `${isFocaccia ? 'Focaccia artesanal' : 'Pizza artesanal'} de ${recipe.name}.`,
      priceToday: suggestedPrice,
      priceScheduled: suggestedPrice,
      stock: recipe.yield,
      category: isFocaccia ? "focaccia" : "pizza",
      images: [],
      isAvailable: true
    });
    setShowRecipeModal(false);
    setShowProductModal(true);
  };

  if (!isLoaded) {
    return (
      <div className="p-8 text-gray-500">Cargando catálogo de Nelson&apos;s...</div>
    );
  }

  const pizzaCount = products.filter(p => p.category !== "focaccia").length;
  const focacciaCount = products.filter(p => p.category === "focaccia").length;
  const filteredProducts = products.filter(p => {
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "focaccia") return p.category === "focaccia";
    return p.category !== "focaccia";
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Catálogo de Pizzas & Focaccias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administrá las variedades, precios, stock y subí múltiples fotos propias para el carrusel interactivo de Nelson&apos;s.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowRecipeModal(true)}
            className="bg-white border-2 border-[var(--primary)] text-[var(--primary)] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
          >
            <BookOpen size={18} />
            Desde Recetario
          </button>
          <button 
            onClick={() => openNewProductModal("pizza")}
            className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--secondary)] transition-colors shadow-md shadow-[var(--primary)]/20 cursor-pointer"
          >
            <Plus size={18} />
            🍕 Nueva Pizza
          </button>
          <button 
            onClick={() => openNewProductModal("focaccia")}
            className="bg-[#FFC71F] text-[#0f2540] px-4 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-[#e6b215] transition-colors shadow-md cursor-pointer"
          >
            <Plus size={18} />
            🫓 Nueva Focaccia
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategoryFilter("all")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
            activeCategoryFilter === "all"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          Todos ({products.length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter("pizza")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeCategoryFilter === "pizza"
              ? "bg-[var(--primary)] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span>🍕 Pizzas</span>
          <span className="bg-black/15 px-2 py-0.5 rounded-full text-xs">{pizzaCount}</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter("focaccia")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeCategoryFilter === "focaccia"
              ? "bg-[#FFC71F] text-[#0f2540] shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span>🫓 Focaccias</span>
          <span className="bg-black/10 px-2 py-0.5 rounded-full text-xs">{focacciaCount}</span>
        </button>
      </div>

      {/* STOCK ADDITION MODAL */}
      {addingStockProductId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sumar al Stock</h3>
            <p className="text-gray-600 mb-4 text-sm">¿Cuántas unidades horneadas nuevas querés sumar?</p>
            <input 
              type="number"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none text-xl font-bold mb-6 text-center"
              value={stockToAdd}
              onChange={(e) => setStockToAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitAddStock();
                if (e.key === 'Escape') setAddingStockProductId(null);
              }}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setAddingStockProductId(null)}
                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={submitAddStock}
                className="flex-1 py-3 text-white bg-[var(--primary)] hover:bg-[var(--secondary)] rounded-xl font-bold transition-colors"
              >
                Sumar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Producto y Fotos</th>
                <th className="p-4 font-semibold text-gray-600">Tipo</th>
                <th className="p-4 font-semibold text-gray-600">Precios (Edición Rápida)</th>
                <th className="p-4 font-semibold text-gray-600">Stock Hoy</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const imgs = Array.isArray(product.images) && product.images.length > 0
                  ? product.images
                  : product.imageUrl ? [product.imageUrl] : [];
                const mainPhoto = imgs[0];
                const isFocaccia = product.category === "focaccia";

                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 w-1/3">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => openEditProductModal(product)}
                          className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative cursor-pointer group"
                          title="Click para gestionar fotos"
                        >
                          {mainPhoto ? (
                            <img src={mainPhoto} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {isFocaccia ? "🫓" : "🍕"}
                            </div>
                          )}
                          {imgs.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              +{imgs.length - 1} 📷
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[220px]" title={product.description}>
                            {product.description}
                          </div>
                          <button
                            onClick={() => openEditProductModal(product)}
                            className="text-[11px] font-bold text-[var(--primary)] hover:underline mt-1 flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon size={12} />
                            {imgs.length === 0 ? "Subir fotos" : `${imgs.length} foto${imgs.length > 1 ? 's' : ''} en carrusel`}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleUpdateProductField(product.id!, 'category', isFocaccia ? 'pizza' : 'focaccia')}
                        title="Click para cambiar entre Pizza y Focaccia"
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                          isFocaccia
                            ? "bg-[#FFC71F]/30 text-[#8a6800] border border-[#FFC71F]"
                            : "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                        }`}
                      >
                        <span>{isFocaccia ? "🫓 Focaccia" : "🍕 Pizza"}</span>
                      </button>
                    </td>
                    <td className="p-4 w-4/12">
                      <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 w-10">HOY:</label>
                          <span className="text-gray-500 font-bold">$</span>
                          <input 
                            type="number"
                            className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                            value={product.priceToday || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              handleUpdateProductFields(product.id!, {
                                priceToday: val,
                                priceScheduled: product.priceScheduled > val ? val : product.priceScheduled,
                                priceOffer: product.priceOffer && product.priceOffer > val ? val : product.priceOffer,
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 w-10">PROG:</label>
                          <span className="text-gray-500 font-bold">$</span>
                          <input 
                            type="number"
                            className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 outline-none focus:border-[var(--primary)]"
                            value={product.priceScheduled || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const maxVal = product.priceToday || 0;
                              handleUpdateProductField(product.id!, 'priceScheduled', val > maxVal ? maxVal : val);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-gray-100 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500">
                            <input 
                              type="checkbox"
                              className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                              checked={!!product.priceOffer}
                              onChange={(e) => handleUpdateProductField(product.id!, 'priceOffer', e.target.checked ? product.priceToday : undefined)}
                            />
                            OFERTA
                          </label>
                          {!!product.priceOffer && (
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-red-500 font-bold text-xs">$</span>
                              <input 
                                type="number"
                                className="w-20 bg-red-50 border border-red-200 rounded px-2 py-1 text-sm font-bold text-red-600 outline-none focus:border-red-400"
                                value={product.priceOffer || ''}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const maxVal = product.priceToday || 0;
                                  handleUpdateProductField(product.id!, 'priceOffer', val > maxVal ? maxVal : val);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold text-gray-800 outline-none focus:border-[var(--primary)] text-center"
                          value={product.stock === 0 ? '0' : (product.stock || '')}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleUpdateProductFields(product.id!, {
                              stock: val,
                              isAvailable: val > 0
                            });
                          }}
                        />
                        <button 
                          onClick={() => setAddingStockProductId(product.id!)}
                          className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors shadow-sm cursor-pointer"
                          title="Sumar stock nuevo"
                        >
                          + Sumar
                        </button>
                      </div>
                      {!product.isAvailable && (
                        <div className="mt-1 text-xs font-bold text-red-500">Sin Stock para Hoy</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditProductModal(product)}
                          className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors cursor-pointer" 
                          title="Editar producto y fotos"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id!)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Edit/Create Product + Carousel Image Uploader */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {editingProduct.id ? 'Editar Producto de Nelson\'s' : 'Nuevo Producto para el Menú'}
                </h2>
                <p className="text-xs text-gray-500">Elegí si es Pizza o Focaccia y cargá las fotos para el carrusel.</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Selector grande Pizza vs Focaccia */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                  1. Categoría en el Menú Interactivo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, category: "pizza" })}
                    className={`p-4 rounded-2xl border-2 font-black text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      editingProduct.category !== "focaccia"
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl">🍕</span>
                    <span>PIZZA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, category: "focaccia" })}
                    className={`p-4 rounded-2xl border-2 font-black text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      editingProduct.category === "focaccia"
                        ? "border-[#FFC71F] bg-[#FFC71F] text-[#0f2540] shadow-lg shadow-[#FFC71F]/30"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl">🫓</span>
                    <span>FOCACCIA</span>
                  </button>
                </div>
              </div>

              {/* Nombre y Descripción */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Sabor (aparecerá en las píldoras del menú)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Margarita, Fugazzeta Rellena, Focaccia de Romero y Olivas..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 font-bold"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Descripción / Ingredientes (se despliega al tocar &quot;Ver descripción&quot;)
                  </label>
                  <textarea 
                    placeholder="Ej: Salsa de tomates italianos, mozzarella fior di latte, albahaca fresca y aceite de oliva..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 resize-none h-20"
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Gestor de Imágenes Propias para el Carrusel */}
              <div className="bg-blue-50/60 border-2 border-dashed border-[var(--primary)]/30 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                      <ImageIcon size={18} className="text-[var(--primary)]" />
                      Fotos del Producto (Carrusel)
                    </h4>
                    <p className="text-xs text-gray-600">
                      Podés subir 1 o varias fotos desde tu compu/celular. La primera foto es la portada.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImages}
                    className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--secondary)] transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <Upload size={16} />
                    {isUploadingImages ? "Optimizando..." : "Subir Fotos Propias"}
                  </button>
                </div>

                {/* Opción adicional por URL */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      placeholder="O pegá el link (URL) de una imagen y tocá Agregar..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-[var(--primary)] text-gray-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    + Agregar URL
                  </button>
                </div>

                {/* Lista de miniaturas */}
                {editingProduct.images && editingProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {editingProduct.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-[4/3] ${
                          idx === 0 ? "border-[#FFC71F] ring-2 ring-[#FFC71F]/40" : "border-gray-200"
                        }`}
                      >
                        <img src={imgSrc} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-[#FFC71F] text-[#0f2540] text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                            ★ PRINCIPAL
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 flex items-center justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-white hover:text-[#FFC71F] disabled:opacity-30 cursor-pointer"
                              title="Mover a la izquierda"
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 1)}
                              disabled={idx === (editingProduct.images?.length || 1) - 1}
                              className="p-1 text-white hover:text-[#FFC71F] disabled:opacity-30 cursor-pointer"
                              title="Mover a la derecha"
                            >
                              <ArrowRight size={14} />
                            </button>
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1 text-[#FFC71F] hover:scale-110 cursor-pointer"
                                title="Hacer foto principal"
                              >
                                <Star size={14} fill="currentColor" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                            title="Eliminar foto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500">
                    Todavía no cargaste fotos para este sabor. ¡Subí una o más fotos para activar el carrusel!
                  </div>
                )}
              </div>

              {/* Precios y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio HOY ($)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 font-bold text-[var(--primary)]"
                    value={editingProduct.priceToday || ''}
                    onChange={e => setEditingProduct({...editingProduct, priceToday: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Programado ($)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 font-bold text-[var(--primary)]"
                    value={editingProduct.priceScheduled || ''}
                    onChange={e => setEditingProduct({...editingProduct, priceScheduled: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Oferta ($) (Opcional)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900"
                    value={editingProduct.priceOffer || ''}
                    onChange={e => setEditingProduct({...editingProduct, priceOffer: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Disponible para Hoy</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900"
                    value={editingProduct.stock ?? ''}
                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Precio Mayorista / Promo Cantidad ($)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 text-sm"
                    value={editingProduct.priceWholesale || ''}
                    onChange={e => setEditingProduct({...editingProduct, priceWholesale: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad Mínima Promo</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--primary)] outline-none text-gray-900 text-sm"
                    value={editingProduct.wholesaleMinQuantity || ''}
                    onChange={e => setEditingProduct({...editingProduct, wholesaleMinQuantity: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowProductModal(false)}
                className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProduct}
                disabled={!editingProduct.name || !editingProduct.priceToday || !editingProduct.priceScheduled}
                className="px-6 py-2.5 font-black bg-[var(--primary)] text-white hover:bg-[var(--secondary)] rounded-xl transition-colors disabled:opacity-50 shadow-md cursor-pointer"
              >
                Guardar en Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Select Recipe */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Seleccionar del Recetario</h2>
                <p className="text-sm text-gray-500">Creá una Pizza o Focaccia a partir de una receta calculada.</p>
              </div>
              <button onClick={() => setShowRecipeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              {recipes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay recetas disponibles en el recetario todavía.</p>
              ) : (
                recipes.map(recipe => (
                  <button 
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-[var(--primary)] transition-colors">{recipe.name}</h4>
                      <p className="text-sm text-gray-500">Rinde {recipe.yield} unidades</p>
                    </div>
                    <div className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={20} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
