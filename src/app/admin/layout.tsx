"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Users, Settings, FileText, Utensils, List, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SUPERADMIN_EMAIL } from "@/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuth } = useAuth();

  const isSuperadmin =
    user?.role === "admin" ||
    (user?.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2540] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC71F] mx-auto mb-4" />
          <p className="font-archivo text-lg tracking-wider uppercase text-[#FFC71F]">
            Verificando credenciales de Administrador...
          </p>
        </div>
      </div>
    );
  }

  // Si no está logueado o no es el superadmin, bloquear el acceso
  if (!user || !isSuperadmin) {
    return (
      <div className="min-h-screen bg-[#0f2540] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-red-500/30">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={36} />
          </div>
          <h2 className="font-archivo text-2xl text-gray-900 mb-2 uppercase">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Este panel de administración es exclusivo para <strong>{SUPERADMIN_EMAIL}</strong>.
            {user ? (
              <span className="block mt-2 text-red-600 font-medium">
                Has iniciado sesión con ({user.email}), que no posee permisos de administrador.
              </span>
            ) : (
              <span className="block mt-2 text-gray-500">
                Iniciá sesión con tu cuenta de administrador para continuar.
              </span>
            )}
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="font-archivo w-full py-3.5 px-6 rounded-xl bg-[#24598d] hover:bg-[#1b456e] text-white flex items-center justify-center gap-2 uppercase tracking-wider text-sm transition-all shadow-md cursor-pointer"
            >
              <LogIn size={18} />
              <span>Iniciar Sesión como Admin</span>
            </button>

            <Link
              href="/"
              className="font-archivo w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center gap-2 uppercase tracking-wider text-xs transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Volver a la tienda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 bg-[#24598d] text-white">
          <Link href="/" className="inline-block">
            <h2 className="text-2xl font-black text-[#FFC71F] tracking-tight">NELSON&apos;S</h2>
          </Link>
          <p className="text-xs text-white/80 font-medium mt-0.5">Admin • Pizzas & Focaccias</p>
          <div className="mt-2 text-[11px] bg-white/10 px-2 py-1 rounded text-[#FFC71F] font-mono truncate">
            {user.email}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <Package size={20} />
            <span className="font-medium">Productos (Precios, Stock, Fotos)</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors opacity-50 cursor-not-allowed">
            <Users size={20} />
            <span className="font-medium">Clientes</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors opacity-50 cursor-not-allowed">
            <FileText size={20} />
            <span className="font-medium">Blog</span>
          </Link>
          <Link href="/admin/recipes" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <Utensils size={20} />
            <span className="font-medium">Recetario</span>
          </Link>
          <Link href="/admin/ingredients" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <List size={20} />
            <span className="font-medium">Ingredientes</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <Package size={20} />
            <span className="font-medium">Pedidos</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
