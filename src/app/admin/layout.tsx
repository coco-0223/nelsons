import Link from "next/link";
import { LayoutDashboard, Package, Users, Settings, FileText, Utensils, List } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-[#24598d] text-white">
          <Link href="/" className="inline-block">
            <h2 className="text-2xl font-black text-[#FFC71F] tracking-tight">NELSON&apos;S</h2>
          </Link>
          <p className="text-xs text-white/80 font-medium mt-0.5">Admin • Pizzas & Focaccias</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors">
            <Package size={20} />
            <span className="font-medium">Productos</span>
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
